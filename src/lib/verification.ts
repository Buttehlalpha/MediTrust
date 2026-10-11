import { supabase } from "@/integrations/supabase/client";

export type VerifyResult = "genuine" | "expired" | "invalid" | "suspicious" | "recalled";

export interface DrugRecord {
  id: string;
  drug_code: string;
  drug_name: string;
  manufacturer_name: string | null;
  registration_number: string | null;
  batch_number: string | null;
  manufacturing_date: string | null;
  expiry_date: string | null;
  dosage_form: string | null;
  quantity: number | null;
  description: string | null;
  status: "active" | "recalled" | "suspended";
}

export interface VerificationOutcome {
  result: VerifyResult;
  code: string;
  drug: DrugRecord | null;
  scanCount: number;
  message: string;
}

/** Accepts a raw scan payload and extracts the drug code. */
export function normalizeCode(raw: string): string {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("code");
    if (fromQuery) return fromQuery.trim().toUpperCase();
    const last = url.pathname.split("/").filter(Boolean).pop();
    if (last) return decodeURIComponent(last).trim().toUpperCase();
  } catch {
    /* not a URL */
  }
  return trimmed.toUpperCase();
}

const SUSPICIOUS_THRESHOLD = 8; // scans of the same pack within 60 minutes

export async function verifyDrugCode(rawCode: string): Promise<VerificationOutcome> {
  const code = normalizeCode(rawCode);

  const { data: drug } = await supabase
    .from("drugs")
    .select(
      "id, drug_code, drug_name, manufacturer_name, registration_number, batch_number, manufacturing_date, expiry_date, dosage_form, quantity, description, status",
    )
    .eq("drug_code", code)
    .maybeSingle();

  let result: VerifyResult = "invalid";
  let message = "This code is not registered. The product may be counterfeit.";
  let scanCount = 0;

  if (drug) {
    const { data: count } = await supabase.rpc("recent_scan_count", {
      _drug_id: drug.id,
      _minutes: 60,
    });
    scanCount = typeof count === "number" ? count : 0;

    const expired = drug.expiry_date ? new Date(drug.expiry_date) < new Date() : false;

    if (drug.status === "recalled") {
      result = "recalled";
      message = "This product batch has been recalled by the manufacturer. Do not use it.";
    } else if (drug.status === "suspended") {
      result = "suspicious";
      message = "This product is currently suspended pending regulatory review.";
    } else if (expired) {
      result = "expired";
      message = "This product is registered but has passed its expiry date. Do not use it.";
    } else if (scanCount >= SUSPICIOUS_THRESHOLD) {
      result = "suspicious";
      message = `Unusual activity: this pack has been scanned ${scanCount} times in the last hour. It may have been cloned.`;
    } else {
      result = "genuine";
      message = "Verified genuine. This product is registered and active in the national registry.";
    }
  }

  await supabase.from("verifications").insert({
    drug_id: drug?.id ?? null,
    scanned_code: code,
    result,
    device_info: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
  });

  return { result, code, drug: (drug as DrugRecord | null) ?? null, scanCount, message };
}
