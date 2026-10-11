import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ClipboardList,
  Factory,
  QrCode,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediTrust — Verify Medicine Authenticity with QR Codes" },
      {
        name: "description",
        content:
          "Scan the QR code on any registered drug pack and instantly confirm whether it is genuine, expired, recalled or counterfeit.",
      },
      { property: "og:title", content: "MediTrust — QR Drug Verification System" },
      {
        property: "og:description",
        content:
          "Instant QR-based drug authenticity checks, manufacturer registration and suspicious scan detection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const steps = [
  {
    icon: Factory,
    title: "Manufacturer registers",
    body: "Drug name, NAFDAC number, batch, dates, dosage form and quantity are stored securely.",
  },
  {
    icon: QrCode,
    title: "Unique QR is minted",
    body: "The system issues a serialised code such as DRG-2026-000125 and renders a printable QR.",
  },
  {
    icon: ScanLine,
    title: "Consumer scans",
    body: "The web app opens the device camera, reads the code and queries the registry instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Result recorded",
    body: "Genuine, expired, recalled or counterfeit — and every scan is written to the audit trail.",
  },
];

const features = [
  {
    icon: ShieldAlert,
    title: "Suspicious verification detection",
    body: "A rule-based engine flags packs scanned abnormally often within a short window — a strong signal of a cloned QR code.",
  },
  {
    icon: ClipboardList,
    title: "Full verification history",
    body: "Drug ID, timestamp, result and device information are recorded for every single scan, giving regulators a complete trail.",
  },
  {
    icon: Activity,
    title: "Live manufacturer dashboard",
    body: "Track registrations, expiring batches and scan volume in one place, and recall a batch the moment a problem appears.",
  },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <HeroSlider />

        {/* ticker */}
        <div className="surface-ink overflow-hidden border-y border-white/10 py-3">
          <div className="animate-marquee flex w-max gap-10 text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
            {Array.from({ length: 2 }).map((_, r) => (
              <div key={r} className="flex gap-10">
                {[
                  "Serialised QR codes",
                  "NAFDAC registration capture",
                  "Batch level traceability",
                  "Expiry enforcement",
                  "Recall broadcasting",
                  "Scan anomaly alerts",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-3">
                    <ShieldCheck className="size-3.5" /> {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* stats */}
        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { k: "1 in 10", v: "medicines in low and middle income countries are substandard or falsified (WHO)" },
              { k: "< 1 sec", v: "average time to return a verification verdict from the registry" },
              { k: "100%", v: "of scans written to an immutable verification history" },
            ].map((s) => (
              <div key={s.k} className="rounded-3xl border border-border bg-card p-8 shadow-soft">
                <div className="font-display text-4xl font-bold text-gradient">{s.k}</div>
                <p className="mt-3 text-sm text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              System flow
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              From the production line to the patient's hand
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow"
              >
                <span className="font-display text-6xl font-bold text-muted opacity-70">
                  0{i + 1}
                </span>
                <s.icon className="mt-4 size-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* features */}
        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="grid gap-5 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-border bg-secondary/50 p-8 transition-colors hover:bg-secondary"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 pb-4">
          <div className="surface-ink relative overflow-hidden rounded-[2rem] px-8 py-16 text-center">
            <div className="animate-scanline absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <h2 className="relative text-3xl font-bold sm:text-4xl">Got a pack in your hand?</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-sm opacity-75">
              You do not need an account. Open the scanner, point at the QR code, and get a verdict
              in seconds.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full shadow-glow">
                <Link to="/verify">
                  <ScanLine className="size-4" /> Open the scanner
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/25 bg-white/5 text-ink-foreground hover:bg-white/15 hover:text-ink-foreground"
              >
                <Link to="/about">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
