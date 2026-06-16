"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Loader2,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withBasePath } from "@/lib/base-path";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const codeSchema = z.object({
  code: z
    .string()
    .min(6, "Enter the 6-digit code")
    .max(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type EmailValues = z.infer<typeof emailSchema>;
type CodeValues = z.infer<typeof codeSchema>;

type Step = "email" | "code" | "done";

export default function DeleteAccountPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm<CodeValues>({ resolver: zodResolver(codeSchema) });

  const sendCode = async (values: EmailValues) => {
    setServerError(null);
    setInfoMessage(null);
    try {
      const res = await fetch(withBasePath("/api/account/delete/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(body.error ?? "Could not send verification code.");
        return;
      }
      setEmail(values.email.trim());
      setInfoMessage(
        body.message ??
          "If an account exists for this email, we sent a verification code.",
      );
      setStep("code");
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const confirmDelete = async (values: CodeValues) => {
    setServerError(null);
    try {
      const res = await fetch(withBasePath("/api/account/delete/confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: values.code }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(body.error ?? "Invalid or expired verification code.");
        return;
      }
      setStep("done");
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-card bg-red-500/10 opacity-40 blur" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-card bg-brand text-white shadow-card">
              <ShieldAlert className="h-9 w-9" />
            </div>
          </div>
        </div>

        <div className="rounded-card border border-surface-border-light bg-white p-10 shadow-card">
          {step === "done" ? (
            <div className="space-y-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-brand">
                Account deleted
              </h1>
              <p className="text-sm text-text-secondary">
                Your Tribee account and sign-in access for <strong>{email}</strong> have
                been permanently removed.
              </p>
              <Link
                href={withBasePath("/login")}
                className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-surface-border bg-white text-sm font-semibold text-text-primary hover:bg-surface-inset"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-brand">
                  Delete your account
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  {step === "email"
                    ? "Enter the email on your Tribee account. We will send a one-time code to confirm deletion."
                    : "Enter the verification code we sent to your email. This permanently deletes your account."}
                </p>
              </div>

              {step === "email" ? (
                <form
                  onSubmit={emailForm.handleSubmit(sendCode)}
                  className="space-y-6"
                  noValidate
                >
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-primary">
                      Account email
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="pl-11"
                        autoComplete="email"
                        {...emailForm.register("email")}
                      />
                    </div>
                    {emailForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {serverError && <ErrorBanner message={serverError} />}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Send verification code
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={codeForm.handleSubmit(confirmDelete)}
                  className="space-y-6"
                  noValidate
                >
                  {infoMessage && (
                    <p className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-xs text-text-secondary">
                      {infoMessage}
                    </p>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-primary">
                      Verification code
                    </label>
                    <Input
                      inputMode="numeric"
                      placeholder="123456"
                      maxLength={6}
                      autoComplete="one-time-code"
                      {...codeForm.register("code")}
                    />
                    {codeForm.formState.errors.code && (
                      <p className="mt-1 text-xs text-red-600">
                        {codeForm.formState.errors.code.message}
                      </p>
                    )}
                  </div>

                  {serverError && <ErrorBanner message={serverError} />}

                  <Button
                    type="submit"
                    size="lg"
                    variant="danger"
                    className="w-full"
                    disabled={codeForm.formState.isSubmitting}
                  >
                    {codeForm.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Delete my account permanently"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep("email");
                      setServerError(null);
                      codeForm.reset();
                    }}
                  >
                    Use a different email
                  </Button>
                </form>
              )}
            </>
          )}
        </div>

        {step !== "done" && (
          <div className="text-center">
            <Link
              href={withBasePath("/login")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
    >
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
