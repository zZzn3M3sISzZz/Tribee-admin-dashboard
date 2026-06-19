import type { AdminEventListItem } from "@/lib/types";

export type VenueProgramEntry =
  | { kind: "recurring"; seriesId: string; items: AdminEventListItem[] }
  | { kind: "single"; item: AdminEventListItem };

function nextOccurrenceAt(entry: VenueProgramEntry): string {
  if (entry.kind === "single") return entry.item.scheduled_at;
  const sorted = [...entry.items].sort((a, b) =>
    a.scheduled_at.localeCompare(b.scheduled_at)
  );
  const upcoming = sorted.find(
    (item) =>
      item.state !== "cancelled" && new Date(item.scheduled_at).getTime() >= Date.now()
  );
  return (upcoming ?? sorted[0]).scheduled_at;
}

export function groupVenuePrograms(items: AdminEventListItem[]): VenueProgramEntry[] {
  const singles: AdminEventListItem[] = [];
  const bySeries = new Map<string, AdminEventListItem[]>();

  for (const item of items) {
    if (item.series_id && item.schedule_kind === "recurring") {
      const list = bySeries.get(item.series_id) ?? [];
      list.push(item);
      bySeries.set(item.series_id, list);
    } else {
      singles.push(item);
    }
  }

  const entries: VenueProgramEntry[] = [];

  for (const [seriesId, seriesItems] of Array.from(bySeries.entries())) {
    entries.push({
      kind: "recurring",
      seriesId,
      items: seriesItems.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)),
    });
  }

  for (const item of singles) {
    entries.push({ kind: "single", item });
  }

  return entries.sort((a, b) => nextOccurrenceAt(a).localeCompare(nextOccurrenceAt(b)));
}

export function venueProgramCount(entries: VenueProgramEntry[]): number {
  return entries.length;
}
