-- roles
CREATE TYPE public.app_role AS ENUM ('admin','manufacturer','user');
CREATE TYPE public.drug_status AS ENUM ('active','recalled','suspended');
CREATE TYPE public.verify_result AS ENUM ('genuine','expired','invalid','suspicious','recalled');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'manufacturer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  license_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manufacturers TO authenticated;
GRANT SELECT ON public.manufacturers TO anon;
GRANT ALL ON public.manufacturers TO service_role;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read manufacturers" ON public.manufacturers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "own manufacturers write" ON public.manufacturers FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE SEQUENCE public.drug_code_seq START 1;

CREATE TABLE public.drugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manufacturer_id uuid REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  drug_code text NOT NULL UNIQUE DEFAULT ('DRG-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.drug_code_seq')::text, 6, '0')),
  drug_name text NOT NULL,
  manufacturer_name text,
  registration_number text,
  batch_number text,
  manufacturing_date date,
  expiry_date date,
  dosage_form text,
  quantity integer,
  description text,
  status public.drug_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drugs TO authenticated;
GRANT SELECT ON public.drugs TO anon;
GRANT ALL ON public.drugs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.drug_code_seq TO authenticated, service_role;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read drugs" ON public.drugs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "own drugs insert" ON public.drugs FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own drugs update" ON public.drugs FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own drugs delete" ON public.drugs FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id uuid REFERENCES public.drugs(id) ON DELETE CASCADE,
  scanned_code text NOT NULL,
  result public.verify_result NOT NULL,
  device_info text,
  scanned_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.verifications TO authenticated;
GRANT INSERT, SELECT ON public.verifications TO anon;
GRANT ALL ON public.verifications TO service_role;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can record a scan" ON public.verifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owners and admins read scans" ON public.verifications FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.drugs d WHERE d.id = verifications.drug_id AND d.owner_id = auth.uid())
);
CREATE INDEX verifications_drug_idx ON public.verifications(drug_id, scanned_at DESC);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own audit insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own audit read" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- suspicious detection helper: count scans in last hour
CREATE OR REPLACE FUNCTION public.recent_scan_count(_drug_id uuid, _minutes int DEFAULT 60)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.verifications
  WHERE drug_id = _drug_id AND scanned_at > now() - (_minutes || ' minutes')::interval
$$;
GRANT EXECUTE ON FUNCTION public.recent_scan_count(uuid, int) TO anon, authenticated;