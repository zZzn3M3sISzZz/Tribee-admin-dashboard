"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, MessageSquareText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { withBasePath } from "@/lib/base-path";

const feedbackSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be at most 200 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  content: z
    .string()
    .trim()
    .min(10, "Please share at least 10 characters of feedback")
    .max(5000, "Feedback must be at most 5000 characters"),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      content: "",
    },
  });

  const onSubmit = async (values: FeedbackValues) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch(withBasePath("/api/feedback"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(body.error ?? "Could not submit feedback. Please try again.");
        return;
      }
      setSubmitted(true);
      setSuccessMessage(
        body.message ?? "Thank you for your feedback. Our team will review it soon.",
      );
      form.reset();
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-surface px-6 py-16">
      <div className="mx-auto max-w-xl">
        <Link
          href={withBasePath("/login")}
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>

        <div className="rounded-card border border-surface-border-light bg-white p-10 shadow-card">
          <header className="mb-8 border-b border-surface-border/40 pb-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">offScreen</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand">App feedback</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Tell us what you think about the app — bugs, ideas, or anything we can improve.
            </p>
          </header>

          {submitted && successMessage ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {successMessage}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setSuccessMessage(null);
                }}
              >
                Submit more feedback
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-text-primary">
                  Name
                </label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Your name"
                  {...form.register("name")}
                />
                {form.formState.errors.name ? (
                  <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-text-primary">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium text-text-primary">
                  Feedback
                </label>
                <Textarea
                  id="content"
                  rows={6}
                  placeholder="Share your thoughts about the app..."
                  {...form.register("content")}
                />
                {form.formState.errors.content ? (
                  <p className="text-xs text-red-600">{form.formState.errors.content.message}</p>
                ) : null}
              </div>

              {serverError ? (
                <p className="text-sm text-red-600">{serverError}</p>
              ) : null}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit feedback
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
