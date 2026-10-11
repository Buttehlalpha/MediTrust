import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import logo from "../assets/logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/verify", label: "Verify a drug" },
  { to: "/about", label: "How it works" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const ghost = cn(
    "rounded-full",
    !scrolled &&
      "text-ink-foreground hover:bg-white/15 hover:text-ink-foreground"
  );

  const outline = cn(
    "rounded-full",
    !scrolled &&
      "border-white/25 bg-white/5 text-ink-foreground hover:bg-white/15 hover:text-ink-foreground"
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "glass-panel shadow-soft py-2 text-foreground"
          : "bg-transparent py-4 text-ink-foreground"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5">
        {/* LOGO */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
            <img
              src={logo}
              alt="MediTrust Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <span className="font-display text-lg font-bold tracking-tight">
            Medi<span className="text-gradient">Trust</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                scrolled
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-ink-foreground/70 hover:text-ink-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden items-center gap-2 md:flex">
          {!loading && user ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={ghost}
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className={outline}
                onClick={signOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={ghost}
              >
                <Link to="/auth">Sign in</Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="rounded-full"
              >
                <Link to="/verify">Verify now</Link>
              </Button>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="rounded-lg border border-border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="glass-panel animate-fade-in mx-4 mt-2 rounded-2xl p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Dashboard
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={signOut}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                asChild
                size="sm"
                className="mt-2"
              >
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}