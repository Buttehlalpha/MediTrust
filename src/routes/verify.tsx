import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarX,
  Camera,
  Loader2,
  Search,
  ShieldX,
  StopCircle,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { QrScanner } from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyDrugCode, type VerificationOutcome } from "@/lib/verification";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a Drug — Scan the QR Code | MediTrust" },
      {
        name: "description",
        content:
          "Scan a medicine QR code or type its drug code to instantly check whether the product is genuine, expired, recalled or counterfeit.",
      },
      { property: "og:title", content: "Verify a Drug — MediTrust QR Scanner" },
      {
        property: "og:description",
        content: "Instant authenticity checks for medicine packs. No account required.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Verify,
});

const resultStyles: Record<
  string,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  genuine: {
    label: "Genuine product",
    icon: BadgeCheck,
    className: "border-success/40 bg-success/10 text-success",
  },
  expired: {
    label: "Expired product",
    icon: CalendarX,
    className: "border-warning/50 bg-warning/10 text-warning",
  },
  recalled: {
    label: "Recalled batch",
    icon: ShieldX,
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  suspicious: {
    label: "Suspicious activity",
    icon: AlertTriangle,
    className: "border-warning/50 bg-warning/10 text-warning",
  },
  invalid: {
    label: "Not verified — possible counterfeit",
    icon: ShieldX,
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

function Verify() {
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<VerificationOutcome | null>(null);

  const run = useCallback(async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setScanning(false);
    try {
      setOutcome(await verifyDrugCode(value));
    } finally {
      setLoading(false);
    }
  }, []);

  const style = outcome ? resultStyles[outcome.result]! : null;
  const ResultIcon = style?.icon ?? BadgeCheck;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-5 pt-36 pb-10">
        <div className="text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Consumer verification
          </span>
          <h1 className="mt-3 text-4xl font-bold">Verify your medicine</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Scan the QR code printed on the pack, or type the drug code beneath it. Every check is
            recorded so that unusual activity can be investigated.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            {scanning ? (
              <QrScanner active onResult={run} />
            ) : (
              <div className="grid aspect-square place-items-center rounded-3xl border border-dashed border-border bg-muted/50 text-center">
                <div className="px-8">
                  <Camera className="mx-auto size-8 text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Use your device camera to read the QR code on the package.
                  </p>
                </div>
              </div>
            )}
            <Button
              className="mt-5 w-full rounded-full"
              size="lg"
              variant={scanning ? "outline" : "default"}
              onClick={() => setScanning((v) => !v)}
            >
              {scanning ? (
                <>
                  <StopCircle className="size-4" /> Stop camera
                </>
              ) : (
                <>
                  <Camera className="size-4" /> Open camera & scan
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            <form
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              onSubmit={(e) => {
                e.preventDefault();
                void run(code);
              }}
            >
              <label htmlFor="code" className="text-sm font-semibold">
                Enter the drug code manually
              </label>
              <div className="mt-3 flex gap-2">
                <Input
                  id="code"
                  value={code}
                  maxLength={64}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="DRG-2026-000125"
                  className="rounded-full"
                />
                <Button type="submit" className="rounded-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                The code is printed directly beneath the QR square on the pack.
              </p>
            </form>

            {outcome && style && (
              <div
                className={cn(
                  "animate-slide-up rounded-3xl border p-6 shadow-soft",
                  style.className,
                )}
              >
                <div className="flex items-center gap-3">
                  <ResultIcon className="size-7" />
                  <div>
                    <h2 className="text-lg font-semibold">{style.label}</h2>
                    <p className="font-mono text-xs opacity-80">{outcome.code}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-foreground/80">{outcome.message}</p>

                {outcome.drug && (
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-current/20 pt-5 text-sm text-foreground">
                    {[
                      ["Drug", outcome.drug.drug_name],
                      ["Manufacturer", outcome.drug.manufacturer_name],
                      ["NAFDAC no.", outcome.drug.registration_number],
                      ["Batch", outcome.drug.batch_number],
                      ["Manufactured", outcome.drug.manufacturing_date],
                      ["Expires", outcome.drug.expiry_date],
                      ["Dosage form", outcome.drug.dosage_form],
                      ["Status", outcome.drug.status],
                    ]
                      .filter(([, v]) => Boolean(v))
                      .map(([k, v]) => (
                        <div key={k as string}>
                          <dt className="text-xs text-muted-foreground">{k}</dt>
                          <dd className="font-medium">{v}</dd>
                        </div>
                      ))}
                  </dl>
                )}

                <p className="mt-5 text-xs opacity-70">
                  Scans of this pack in the last hour: {outcome.scanCount}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
