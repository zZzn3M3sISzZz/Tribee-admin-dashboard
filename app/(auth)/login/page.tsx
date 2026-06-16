"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, AtSign, Eye, EyeOff, Loader2, Shield, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withBasePath } from "@/lib/base-path";

const schema = z.object({
  email: z.string().email("Enter a valid staff email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    fetch("https://api.enshaproductions.com/health")
      .then((r) => setApiHealthy(r.ok))
      .catch(() => setApiHealthy(false));
  }, []);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setServerError("Access denied — ops_admin role required.");
    }
    fetch(withBasePath("/api/auth/session"))
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.roles?.includes("ops_admin")) {
          router.replace(withBasePath("/dashboard"));
        }
      })
      .catch(() => {});
  }, [router, searchParams]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch(withBasePath("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.error ?? "Login failed. Please try again.");
        return;
      }
      router.replace(withBasePath("/dashboard"));
    } catch {
      setServerError("Network error. Please check your connection.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-[440px] space-y-10">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-card bg-brand/10 opacity-25 blur" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-card bg-brand text-center text-white shadow-card">
              <div>
                <div className="text-2xl">⏻</div>
                <div className="text-[10px] font-semibold">offScreen</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-surface-border-light bg-white p-12 shadow-card">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-brand">
              Admin Console Login
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Access restricted to authorized staff only.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-primary">
                Staff Email
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                <Input
                  type="email"
                  placeholder="name@offscreen.app"
                  className="pl-11"
                  autoComplete="username"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-text-primary">
                  Password
                </label>
                <button type="button" className="text-[11px] font-medium text-brand">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="pl-11 pr-11"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Secure Access
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 space-y-4 border-t border-surface-border/30 pt-8 text-center">
            <Link
              href={withBasePath("/delete-account")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand"
            >
              Delete Tribee account
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary"
            >
              <TriangleAlert className="h-3.5 w-3.5" />
              Report Access Issue
            </button>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/70">
            <Link href={withBasePath("/privacy")} className="hover:text-brand">
              Privacy Policy
            </Link>
            <Link href={withBasePath("/terms")} className="hover:text-brand">
              Terms &amp; Conditions
            </Link>
            <Link href={withBasePath("/delete-account")} className="hover:text-brand">
              Delete Account
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary/60">
            <span>
              System Status:{" "}
              <strong
                className={
                  apiHealthy === false ? "text-red-600" : "text-brand-dark"
                }
              >
                {apiHealthy === null
                  ? "Checking…"
                  : apiHealthy
                    ? "Operational"
                    : "Degraded"}
              </strong>
            </span>
            <span className="h-1 w-1 rounded-full bg-surface-border" />
            <span>V2.4.0-ADMIN</span>
          </div>
          <p className="mx-auto max-w-xs text-[11px] leading-relaxed text-text-secondary/40">
            Proprietary &amp; Confidential. Unauthorized access attempts are logged and monitored
            by offScreen Security.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
