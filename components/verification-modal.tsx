"use client";

import Image from "next/image";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { IdentityVerificationDetail } from "@/lib/types";

interface VerificationModalProps {
  open: boolean;
  loading?: boolean;
  detail: IdentityVerificationDetail | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  acting?: boolean;
}

export function VerificationModal({
  open,
  loading,
  detail,
  onClose,
  onApprove,
  onReject,
  acting,
}: VerificationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-card border border-surface-border bg-white shadow-card">
        <div className="flex items-start justify-between border-b border-surface-border px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">
              Verification: {detail?.display_name ?? "—"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Review biometric match and document authenticity.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-muted hover:bg-surface-inset"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : detail ? (
          <>
            <div className="grid gap-6 px-8 py-6 md:grid-cols-2">
              <section className="rounded-lg border border-surface-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Liveness Check
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded bg-status-mint-bg px-2 py-1 text-xs font-medium text-brand">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-inset">
                  {detail.selfie_url ? (
                    <Image
                      src={detail.selfie_url}
                      alt="Selfie"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-text-disabled">
                      No selfie uploaded
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  Captured {formatDate(detail.submission.submitted_at)}
                </p>
              </section>

              <section className="rounded-lg border border-surface-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Government ID
                  </h3>
                  <span className="text-xs text-text-secondary">Document</span>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-inset">
                  {detail.government_id_url ? (
                    <Image
                      src={detail.government_id_url}
                      alt="Government ID"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-text-disabled">
                      No ID uploaded
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  Submitted {formatDate(detail.submission.submitted_at)}
                </p>
              </section>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-surface-border px-8 py-6">
              {[
                { label: "Trust Score", value: "—" },
                { label: "Biometric Match", value: "—" },
                { label: "Status", value: detail.submission.status },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-surface-border bg-surface-inset p-4 text-center"
                >
                  <p className="text-xs uppercase tracking-wider text-text-secondary">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-dark">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-surface-border px-8 py-6">
              <Button variant="outline" onClick={onReject} disabled={acting}>
                Request Re-submission
              </Button>
              <Button onClick={onApprove} disabled={acting}>
                {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Approve Member
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
