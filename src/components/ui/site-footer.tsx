import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="surface-ink mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">MediTrust</span>
          </div>
          <p className="mt-4 max-w-sm text-sm opacity-70">
            A web-based drug counterfeit verification system using QR code technology. Every pack
            registered, every scan recorded, every anomaly flagged.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Product</h3>
          <ul className="mt-3 space-y-2 text-sm opacity-70">
            <li>
              <Link to="/verify">Verify a drug</Link>
            </li>
            <li>
              <Link to="/about">How it works</Link>
            </li>
            <li>
              <Link to="/auth">Manufacturer portal</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Safety</h3>
          <ul className="mt-3 space-y-2 text-sm opacity-70">
            <li>Report suspicious packs</li>
            <li>Suspicious scan detection</li>
            <li>Verification audit trail</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} MediTrust — QR-based drug authentication.
      </div>
    </footer>
  );
}
