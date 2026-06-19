"use client";

import Link from "next/link";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { AdminEventListItem } from "@/lib/types";

export function stateBadge(state: string) {
  if (state === "confirmed") {
    return (
      <span className="rounded bg-brand-tint px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-brand">
        Confirmed
      </span>
    );
  }
  if (state === "pending_confirmation") {
    return (
      <span className="rounded bg-status-mint px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-brand-dark">
        Pending
      </span>
    );
  }
  if (state === "cancelled") {
    return (
      <span className="rounded bg-surface-inset px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
        Cancelled
      </span>
    );
  }
  return (
    <span className="rounded bg-surface-inset px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
      {state}
    </span>
  );
}

export function AdminEventTable({
  items,
  emptyMessage,
  onAssign,
  onCancel,
  canCancelEvent,
  canEditEvent = (item) => item.state !== "cancelled",
  showCity = false,
}: {
  items: AdminEventListItem[];
  emptyMessage: string;
  onAssign: (eventId: string) => void;
  onCancel: (eventId: string) => void;
  canCancelEvent: (item: AdminEventListItem) => boolean;
  canEditEvent?: (item: AdminEventListItem) => boolean;
  showCity?: boolean;
}) {
  if (items.length === 0) {
    return <div className="px-8 py-16 text-center text-text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-text-secondary">
            <th className="px-8 py-4 font-semibold">Event</th>
            {showCity ? <th className="px-4 py-4 font-semibold">City</th> : null}
            <th className="px-4 py-4 font-semibold">Type</th>
            <th className="px-4 py-4 font-semibold">State</th>
            <th className="px-4 py-4 font-semibold">Participants</th>
            <th className="px-8 py-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.event_id}
              className="border-b border-surface-border/60 last:border-0"
            >
              <td className="px-8 py-4 text-brand-dark">
                <div className="font-medium">{item.title ?? item.experience_type}</div>
                <div className="text-xs text-text-muted">{formatDateTime(item.scheduled_at)}</div>
              </td>
              {showCity ? (
                <td className="px-4 py-4 capitalize text-text-primary">
                  {item.city_id ?? "—"}
                </td>
              ) : null}
              <td className="px-4 py-4 capitalize text-text-primary">{item.experience_type}</td>
              <td className="px-4 py-4">{stateBadge(item.state)}</td>
              <td className="px-4 py-4 text-text-primary">{item.participant_count}</td>
              <td className="px-8 py-4">
                <div className="flex flex-wrap gap-2">
                  {canEditEvent(item) ? (
                    <Link
                      href={`/events/${item.event_id}/edit`}
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
                    onClick={() => onAssign(item.event_id)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign people
                  </Button>
                  {canCancelEvent(item) ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onCancel(item.event_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
