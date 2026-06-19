"use client";

import { Input } from "@/components/ui/input";
import type { EntryFeeKind } from "@/lib/entry-fee";

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
      {children}
      {required && <span className="text-brand"> *</span>}
    </label>
  );
}

export function EntryFeeFields({
  kind,
  amount,
  onKindChange,
  onAmountChange,
}: {
  kind: EntryFeeKind;
  amount: string;
  onKindChange: (kind: EntryFeeKind) => void;
  onAmountChange: (amount: string) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <FieldLabel required>Entry fee</FieldLabel>
      <div className="flex flex-wrap gap-3">
        {(["free", "paid"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onKindChange(option)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              kind === option
                ? "border-brand bg-brand-tint text-brand"
                : "border-surface-border text-text-muted"
            }`}
          >
            {option === "free" ? "Free entry" : "Paid entry"}
          </button>
        ))}
      </div>
      {kind === "paid" ? (
        <div className="mt-3 flex max-w-xs items-center gap-2">
          <span className="text-sm font-semibold text-text-secondary">₹</span>
          <Input
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="500"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
        </div>
      ) : (
        <p className="mt-2 text-xs text-text-muted">
          Shown in the app as &quot;Free entry&quot;.
        </p>
      )}
    </div>
  );
}
