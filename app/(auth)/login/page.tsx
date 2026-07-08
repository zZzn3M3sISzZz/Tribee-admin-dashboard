"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OffscreenLogo } from "@/components/offscreen-logo";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(27,67,50,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(217,119,6,0.04) 0%, transparent 50%)",
        }}
      />

      <div className="relative w-full max-w-[420px] space-y-8 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <OffscreenLogo size={56} priority />
          <div className="text-center">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-brand-dark">
              offScreen
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-text-muted">
              Admin Console
            </p>
          </div>
        </div>

        <div className="admin-card p-8">
          <div className="mb-6 text-center">
            <h2 className="font-mono text-lg font-semibold text-brand-dark">
              Staff Sign In
            </h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Access restricted to authorized personnel.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Staff Email
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                <Input
                  type="email"
                  placeholder="name@offscreen.app"
                  className="pl-9"
                  autoComplete="username"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-end justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Password
                </label>
                <button
                  type="button"
                  className="cursor-pointer text-[11px] font-medium text-brand transition-colors hover:text-brand-muted"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="pl-9 pr-9"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-disabled transition-colors hover:text-text-secondary"
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
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
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

          <div className="mt-6 space-y-3 border-t border-surface-border pt-6 text-center">
            <Link
              href={withBasePath("/delete-account")}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-brand"
            >
              Delete Tribee account
            </Link>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-medium uppercase tracking-widest text-text-disabled">
            <Link href={withBasePath("/privacy")} className="transition-colors hover:text-brand">
              Privacy
            </Link>
            <Link href={withBasePath("/terms")} className="transition-colors hover:text-brand">
              Terms
            </Link>
            <Link href={withBasePath("/child-safety")} className="transition-colors hover:text-brand">
              Child Safety
            </Link>
            <Link href={withBasePath("/copyright")} className="transition-colors hover:text-brand">
              Copyright
            </Link>
            <Link href={withBasePath("/feedback")} className="transition-colors hover:text-brand">
              Feedback
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-widest text-text-disabled">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  apiHealthy === false
                    ? "bg-red-500"
                    : apiHealthy
                      ? "bg-status-mint"
                      : "animate-pulse bg-text-disabled"
                }`}
              />
              {apiHealthy === null
                ? "Checking…"
                : apiHealthy
                  ? "Operational"
                  : "Degraded"}
            </span>
            <span className="text-surface-border">·</span>
            <span>v2.4.0</span>
          </div>
          <p className="mx-auto max-w-xs text-[10px] leading-relaxed text-text-disabled">
            Proprietary &amp; Confidential. Unauthorized access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
