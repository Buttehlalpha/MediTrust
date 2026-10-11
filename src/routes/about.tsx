import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How MediTrust Drug Verification Works" },
      {
        name: "description",
        content:
          "The full flow: manufacturer registration, unique QR generation, consumer scanning, verification decisions and suspicious scan detection.",
      },
      { property: "og:title", content: "How MediTrust Drug Verification Works" },
      {
        property: "og:description",
        content:
          "Manufacturer registration, QR generation, scanning, verification decisions and audit history explained.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const sections = [
  {
    h: "A. Manufacturer / Admin side",
    p: "An authorised manufacturer signs in and registers a product with its drug name, manufacturer, NAFDAC registration number, batch number, manufacturing and expiry dates, dosage form, quantity and description. The record is stored in the database and the system mints a unique identifier such as DRG-2026-000125. A QR code carrying only that identifier — never sensitive data — is rendered for printing on the pack.",
  },
  {
    h: "B. Consumer / pharmacist side",
    p: "A consumer opens the web app, chooses Verify a drug and grants camera access. The scanner reads the QR code, extracts the unique identifier and sends it to the registry. No account is required.",
  },
  {
    h: "C. Verification decision",
    p: "If the code does not exist, the product is reported as invalid or suspected counterfeit. If it exists, the status is checked: a recalled batch is blocked, an expired pack is flagged, and an active, in-date pack with normal scan activity is reported as genuine.",
  },
  {
    h: "D. Verification history",
    p: "Every scan writes a record holding the drug identifier, the timestamp, the result and basic device information. Manufacturers see the history for their own products; administrators see everything.",
  },
  {
    h: "E. Suspicious verification detection",
    p: "This is a transparent rule-based check, not an AI model. When a single pack identifier is scanned an unusually large number of times within one hour, the result is downgraded to suspicious and surfaced on the dashboard for review — a strong indicator that the QR code has been copied onto counterfeit packaging.",
  },
];

function About() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 pt-36 pb-10">
        <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Documentation
        </span>
        <h1 className="mt-3 text-4xl font-bold">How the system works</h1>
        <p className="mt-4 text-muted-foreground">
          A web-based drug counterfeit verification system built on QR code technology, covering
          registration, generation, scanning, decisioning and auditing.
        </p>

        <div className="mt-12 space-y-8">
          {sections.map((s) => (
            <article key={s.h} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <h2 className="text-xl font-semibold">{s.h}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-secondary/50 p-7">
          <h2 className="text-lg font-semibold">Data model</h2>
          <pre className="mt-4 overflow-x-auto text-xs leading-relaxed text-muted-foreground">{`profiles        → account name and email
user_roles      → admin / manufacturer permissions
manufacturers   → name, address, license number
drugs           → drug_code, name, registration no., batch,
                  dates, dosage, quantity, status
verifications   → drug_id, result, device info, scanned_at
audit_logs      → user_id, action, description`}</pre>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
