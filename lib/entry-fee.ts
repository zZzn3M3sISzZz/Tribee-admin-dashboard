export type EntryFeeKind = "free" | "paid";

export function entryFeeFromLabel(
  priceLabel?: string | null
): { kind: EntryFeeKind; amount: string } {
  if (!priceLabel) {
    return { kind: "free", amount: "" };
  }
  const trimmed = priceLabel.trim();
  if (!trimmed || /^free(\s+entry)?$/i.test(trimmed)) {
    return { kind: "free", amount: "" };
  }
  const digits = trimmed.replace(/[^\d]/g, "");
  return { kind: "paid", amount: digits || "" };
}

export function entryFeeInrForApi(
  kind: EntryFeeKind,
  amount: string
): number | undefined {
  if (kind === "free") return 0;
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.round(parsed);
}

export function validateEntryFee(kind: EntryFeeKind, amount: string): string | null {
  if (kind === "free") return null;
  const parsed = Number(amount);
  if (!amount.trim() || !Number.isFinite(parsed) || parsed <= 0) {
    return "Enter a valid entry fee amount";
  }
  if (parsed > 500_000) {
    return "Entry fee is too large";
  }
  return null;
}
