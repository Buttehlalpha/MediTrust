import { Link } from "@tanstack/react-router";

import logo from "../assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="surface-ink mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        {/* BRAND */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
              <img
                src={logo}
                alt="MediTrust Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <span className="font-display text-lg font-bold">
              Medi<span className="text-gradient">Trust</span>
            </span>
          </div>

          <p className="mt-4 max-w-sm text-sm opacity-70">
            A web-based drug counterfeit verification system using QR code
            technology. Every pack registered, every scan recorded, every
            anomaly flagged.
          </p>
        </div>

        {/* PRODUCT */}
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

        {/* SAFETY */}
        <div>
          <h3 className="text-sm font-semibold">Safety</h3>

          <ul className="mt-3 space-y-2 text-sm opacity-70">
            <li>Report suspicious packs</li>
            <li>Suspicious scan detection</li>
            <li>Verification audit trail</li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/10 py-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} MediTrust — QR-based drug authentication.
      </div>
    </footer>
  );
}