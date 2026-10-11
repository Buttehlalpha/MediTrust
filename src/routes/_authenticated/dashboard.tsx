import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  AlertTriangle,
  Download,
  Loader2,
  PackagePlus,
  PillBottle,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { QrBadge } from "@/components/qr-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Manufacturer Dashboard — MediTrust" },
      {
        name: "description",
        content:
          "Register drug products, generate serialised QR codes and monitor verification activity.",
      },
      { property: "og:title", content: "Manufacturer Dashboard — MediTrust" },
      {
        property: "og:description",
        content: "Product registration, QR generation and scan monitoring in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const drugSchema = z.object({
  drug_name: z.string().trim().min(2, "Drug name is required").max(160),
  manufacturer_name: z.string().trim().max(160).optional(),
  registration_number: z.string().trim().max(60).optional(),
  batch_number: z.string().trim().max(60).optional(),
  manufacturing_date: z.string().max(20).optional(),
  expiry_date: z.string().max(20).optional(),
  dosage_form: z.string().trim().max(80).optional(),
  quantity: z.string().max(10).optional(),
  description: z.string().trim().max(1000).optional(),
});

const empty = {
  drug_name: "",
  manufacturer_name: "",
  registration_number: "",
  batch_number: "",
  manufacturing_date: "",
  expiry_date: "",
  dosage_form: "",
  quantity: "",
  description: "",
};

function Dashboard() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);

  const drugs = useQuery({
    queryKey: ["drugs", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drugs")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const scans = useQuery({
    queryKey: ["verifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verifications")
        .select("id, scanned_code, result, scanned_at, drug_id, device_info")
        .order("scanned_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const parsed = drugSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const v = parsed.data;
      const { data, error } = await supabase
        .from("drugs")
        .insert({
          owner_id: user!.id,
          drug_name: v.drug_name,
          manufacturer_name: v.manufacturer_name || null,
          registration_number: v.registration_number || null,
          batch_number: v.batch_number || null,
          manufacturing_date: v.manufacturing_date || null,
          expiry_date: v.expiry_date || null,
          dosage_form: v.dosage_form || null,
          quantity: v.quantity ? Number(v.quantity) : null,
          description: v.description || null,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        action: "drug.register",
        description: `Registered ${data.drug_name} (${data.drug_code})`,
      });
      return data;
    },
    onSuccess: (d) => {
      toast.success(`Registered — code ${d.drug_code}`);
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["drugs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not register the drug"),
  });

  const recall = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "recalled" }) => {
      const { error } = await supabase.from("drugs").update({ status }).eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        action: `drug.${status}`,
        description: `Status changed to ${status}`,
      });
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["drugs"] });
    },
  });

  const stats = useMemo(() => {
    const list = drugs.data ?? [];
    const s = scans.data ?? [];
    return {
      products: list.length,
      scans: s.length,
      suspicious: s.filter((x) => x.result === "suspicious" || x.result === "invalid").length,
      recalled: list.filter((d) => d.status === "recalled").length,
    };
  }, [drugs.data, scans.data]);

  function download(code: string) {
    import("qrcode").then(async ({ default: QRCode }) => {
      const url = await QRCode.toDataURL(code, { width: 800, margin: 2 });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${code}.png`;
      a.click();
    });
  }

  const field = (
    key: keyof typeof empty,
    label: string,
    type = "text",
    placeholder = "",
  ) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-5 pt-32 pb-20">
        <h1 className="text-3xl font-bold">Manufacturer dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register products, print their QR codes and watch verification activity.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Registered products", value: stats.products, icon: PillBottle },
            { label: "Recorded scans", value: stats.scans, icon: ScanLine },
            { label: "Flagged scans", value: stats.suspicious, icon: AlertTriangle },
            { label: "Recalled batches", value: stats.recalled, icon: ShieldCheck },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <s.icon className="size-5 text-primary" />
              <div className="font-display mt-3 text-3xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="register" className="mt-10">
          <TabsList className="rounded-full">
            <TabsTrigger value="register" className="rounded-full">
              Register drug
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-full">
              Products & QR codes
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full">
              Verification history
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="mt-6">
            <form
              className="rounded-3xl border border-border bg-card p-7 shadow-soft"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {field("drug_name", "Drug name", "text", "Coartem 20/120mg")}
                {field("manufacturer_name", "Manufacturer", "text", "Emzor Pharmaceuticals")}
                {field("registration_number", "NAFDAC registration no.", "text", "A4-1234")}
                {field("batch_number", "Batch number", "text", "BN-77321")}
                {field("manufacturing_date", "Manufacturing date", "date")}
                {field("expiry_date", "Expiry date", "date")}
                {field("dosage_form", "Dosage / form", "text", "Tablet, 20mg")}
                {field("quantity", "Quantity", "number", "24")}
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="description">Product description</Label>
                <Textarea
                  id="description"
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Antimalarial combination therapy…"
                />
              </div>
              <Button type="submit" className="mt-6 rounded-full" disabled={create.isPending}>
                {create.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PackagePlus className="size-4" />
                )}
                Register & generate QR code
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            {drugs.isLoading ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : (drugs.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products yet. Register your first drug to mint a QR code.
              </p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {drugs.data!.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-3xl border border-border bg-card p-6 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{d.drug_name}</h3>
                        <p className="font-mono text-xs text-muted-foreground">{d.drug_code}</p>
                      </div>
                      <Badge variant={d.status === "active" ? "default" : "destructive"}>
                        {d.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <QrBadge value={d.drug_code} size={104} className="rounded-xl border border-border" />
                      <dl className="space-y-1 text-xs text-muted-foreground">
                        <div>Batch: {d.batch_number ?? "—"}</div>
                        <div>NAFDAC: {d.registration_number ?? "—"}</div>
                        <div>Expires: {d.expiry_date ?? "—"}</div>
                      </dl>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => download(d.drug_code)}
                      >
                        <Download className="size-3.5" /> QR
                      </Button>
                      <Button
                        size="sm"
                        variant={d.status === "recalled" ? "secondary" : "destructive"}
                        className="rounded-full"
                        onClick={() =>
                          recall.mutate({
                            id: d.id,
                            status: d.status === "recalled" ? "active" : "recalled",
                          })
                        }
                      >
                        {d.status === "recalled" ? "Reinstate" : "Recall batch"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3">Drug code</th>
                    <th className="px-5 py-3">Result</th>
                    <th className="px-5 py-3">Scanned at</th>
                  </tr>
                </thead>
                <tbody>
                  {(scans.data ?? []).map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-5 py-3 font-mono text-xs">{s.scanned_code}</td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            s.result === "genuine"
                              ? "default"
                              : s.result === "invalid" || s.result === "recalled"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {s.result}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(s.scanned_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(scans.data ?? []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">
                        No verification activity yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
