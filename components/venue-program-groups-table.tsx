"use client";

import Link from "next/link";
import { ChevronRight, Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import {
  groupVenuePrograms,
  type VenueProgramEntry,
} from "@/lib/venue-program-groups";
import { stateBadge } from "@/components/admin-event-table";
import type { AdminEventListItem } from "@/lib/types";

function upcomingCount(items: AdminEventListItem[]): number {
  return items.filter(
    (item) =>
      item.state !== "cancelled" && new Date(item.scheduled_at).getTime() >= Date.now()
  ).length;
}

function RecurringProgramRow({ entry }: { entry: Extract<VenueProgramEntry, { kind: "recurring" }> }) {
  const sample = entry.items[0];
  const title = sample.title ?? sample.experience_type;
  const upcoming = upcomingCount(entry.items);
  const nextItem =
    entry.items.find(
      (item) =>
        item.state !== "cancelled" && new Date(item.scheduled_at).getTime() >= Date.now()
    ) ?? entry.items[0];

  return (
    <tr className="border-b border-surface-border/60 last:border-0 hover:bg-brand-tint/30">
      <td className="px-8 py-4">
        <Link
          href={`/events/series/${entry.seriesId}`}
          className="group block text-brand-dark"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold group-hover:text-brand">{title}</span>
            <ChevronRight className="h-4 w-4 text-text-muted transition group-hover:text-brand" />
          </div>
          <div className="mt-1 text-xs text-text-muted">
            {sample.venue_label ? `${sample.venue_label} · ` : ""}
            Next: {formatDateTime(nextItem.scheduled_at)}
          </div>
        </Link>
      </td>
      <td className="px-4 py-4 capitalize text-text-primary">{sample.experience_type}</td>
      <td className="px-4 py-4">
        <span className="rounded bg-brand-tint px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-brand">
          Recurring · {entry.items.length} dates
        </span>
      </td>
      <td className="px-4 py-4 text-text-primary">
        {upcoming} upcoming
      </td>
      <td className="px-8 py-4">
        <Link
          href={`/events/series/${entry.seriesId}`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-border bg-white px-3 text-xs font-semibold text-text-primary hover:bg-surface-inset"
        >
          View schedule
        </Link>
      </td>
    </tr>
  );
}

export function VenueProgramGroupsTable({
  items,
  emptyMessage,
  onAssign,
  onCancel,
  canCancelEvent,
  canEditEvent = (item) => item.state !== "cancelled",
}: {
  items: AdminEventListItem[];
  emptyMessage: string;
  onAssign: (eventId: string) => void;
  onCancel: (eventId: string) => void;
  canCancelEvent: (item: AdminEventListItem) => boolean;
  canEditEvent?: (item: AdminEventListItem) => boolean;
}) {
  const entries = groupVenuePrograms(items);

  if (entries.length === 0) {
    return <div className="px-8 py-16 text-center text-text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-text-secondary">
            <th className="px-8 py-4 font-semibold">Program</th>
            <th className="px-4 py-4 font-semibold">Type</th>
            <th className="px-4 py-4 font-semibold">Schedule</th>
            <th className="px-4 py-4 font-semibold">Occurrences</th>
            <th className="px-8 py-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) =>
            entry.kind === "recurring" ? (
              <RecurringProgramRow key={entry.seriesId} entry={entry} />
            ) : (
              <tr
                key={entry.item.event_id}
                className="border-b border-surface-border/60 last:border-0"
              >
                <td className="px-8 py-4 text-brand-dark">
                  <div className="font-medium">
                    {entry.item.title ?? entry.item.experience_type}
                  </div>
                  <div className="text-xs text-text-muted">
                    {entry.item.venue_label ? `${entry.item.venue_label} · ` : ""}
                    {formatDateTime(entry.item.scheduled_at)}
                  </div>
                </td>
                <td className="px-4 py-4 capitalize text-text-primary">
                  {entry.item.experience_type}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded bg-surface-inset px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    Single
                  </span>
                </td>
                <td className="px-4 py-4">{stateBadge(entry.item.state)}</td>
                <td className="px-8 py-4">
                  <div className="flex flex-wrap gap-2">
                    {canEditEvent(entry.item) ? (
                      <Link
                        href={`/events/${entry.item.event_id}/edit`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-surface-border bg-white px-3 text-xs font-semibold text-text-primary hover:bg-surface-inset"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onAssign(entry.item.event_id)}
                    >
                      <UserPlus className="h-4 w-4" />
                      Assign people
                    </Button>
                    {canCancelEvent(entry.item) ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onCancel(entry.item.event_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
