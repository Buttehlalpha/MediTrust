import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import { z } from "zod";

import { Loader2 } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/hooks/use-session";

import logo from "../assets/logo.png";
import slide4 from "../assets/slide-4.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      {
        title: "Manufacturer Sign In — MediTrust",
      },
      {
        name: "description",
        content:
          "Sign in or create a manufacturer account to register drug products and generate verification QR codes.",
      },
      {
        property: "og:title",
        content: "Manufacturer Sign In — MediTrust",
      },
      {
        property: "og:description",
        content:
          "Register drug products and issue serialised verification QR codes.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),

  component: Auth,
});

const schema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),

  fullName: z.string().trim().max(120).optional(),
});

function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [busy, setBusy] = useState(false);

  const { user, loading } = useSession();

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({
        to: "/dashboard",
        replace: true,
      });
    }
  }, [user, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = schema.safeParse({
      email,
      password,
      fullName,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }

    setBusy(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,

          options: {
            emailRedirectTo: window.location.origin,

            data: {
              full_name: parsed.data.fullName ?? "",
            },
          },
        });

        if (error) throw error;

        toast.success(
          "Account created. Check your email to confirm, then sign in."
        );

        setMode("signin");
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
          });

        if (error) throw error;

        navigate({
          to: "/dashboard",
          replace: true,
        });
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Authentication failed"
      );
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }

    if (result.redirected) return;

    navigate({
      to: "/dashboard",
      replace: true,
    });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT SIDE — IMAGE ONLY */}
      <div className="relative hidden min-h-screen overflow-hidden lg:block">
        <img
          src={slide4}
          alt="MediTrust drug verification"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-ink/20" />

        {/* Animated scan line */}
        <div className="animate-scanline absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
      </div>

      {/* RIGHT SIDE — AUTHENTICATION */}
      <div className="flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* LOGO */}
          <div className="mb-8 flex justify-center">
            <Link to="/" className="group">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
                  <img
                    src={logo}
                    alt="MediTrust Logo"
                    className="h-full w-full object-contain"
                  />
                </div>

                <span className="font-display text-xl font-bold tracking-tight">
                  Medi
                  <span className="text-gradient">Trust</span>
                </span>
              </div>
            </Link>
          </div>

          {/* TITLE */}
          <h1 className="text-center text-3xl font-bold">
            {mode === "signin"
              ? "Welcome back"
              : "Create your account"}
          </h1>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to the manufacturer portal."
              : "New accounts get manufacturer access."}
          </p>

          {/* FORM */}
          <form
            className="mt-8 space-y-4"
            onSubmit={submit}
          >
            {/* FULL NAME */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full name
                </Label>

                <Input
                  id="fullName"
                  value={fullName}
                  maxLength={120}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Ada Okafor"
                />
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                maxLength={255}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@company.com"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === "signin"
                    ? "current-password"
                    : "new-password"
                }
                value={password}
                maxLength={72}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
              />
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={busy}
            >
              {busy && (
                <Loader2 className="size-4 animate-spin" />
              )}

              {mode === "signin"
                ? "Sign in"
                : "Create account"}
            </Button>
          </form>

          {/* OR */}
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* GOOGLE */}
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={google}
          >
            Continue with Google
          </Button>

          {/* SWITCH SIGN IN / SIGN UP */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin"
              ? "No account yet?"
              : "Already registered?"}{" "}

            <button
              type="button"
              className="font-semibold text-primary"
              onClick={() =>
                setMode(
                  mode === "signin"
                    ? "signup"
                    : "signin"
                )
              }
            >
              {mode === "signin"
                ? "Create one"
                : "Sign in"}
            </button>
          </p>

          {/* BACK HOME */}
          <p className="mt-8 text-center text-sm">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}