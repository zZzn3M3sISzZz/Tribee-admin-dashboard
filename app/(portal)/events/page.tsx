"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Loader2, MapPin, Pencil, Plus, Sparkles, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { UserSearchPicker } from "@/components/user-search-picker";
import { api } from "@/lib/api";
import { currentWeekMonday, formatDateTime, formatWeekLabel } from "@/lib/utils";
import type { AdminEventListItem, AdminUserSearchResult } from "@/lib/types";

function stateBadge(state: string) {
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

function EventTable({
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

export default function EventsPage() {
  const weekMonday = currentWeekMonday();
  const [autoMatched, setAutoMatched] = useState<AdminEventListItem[]>([]);
  const [manualEvents, setManualEvents] = useState<AdminEventListItem[]>([]);
  const [venuePublicEvents, setVenuePublicEvents] = useState<AdminEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assignEventId, setAssignEventId] = useState<string | null>(null);
  const [assignUsers, setAssignUsers] = useState<AdminUserSearchResult[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [cancelEventId, setCancelEventId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [autoRes, manualRes, venuePublicRes] = await Promise.all([
        api.listAdminEvents({
          source: "auto_matched",
          week: weekMonday,
          limit: 100,
        }),
        api.listAdminEvents({ source: "manual", limit: 100 }),
        api.listAdminEvents({ source: "venue_public", limit: 100 }),
      ]);
      setAutoMatched(autoRes.items);
      setManualEvents(manualRes.items);
      setVenuePublicEvents(venuePublicRes.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [weekMonday]);

  useEffect(() => {
    load();
  }, [load]);

  const filterItems = useCallback(
    (items: AdminEventListItem[]) => {
      const q = search.toLowerCase();
      if (!q) return items;
      return items.filter(
        (item) =>
          item.experience_type.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.event_id.toLowerCase().includes(q) ||
          (item.city_id?.toLowerCase().includes(q) ?? false) ||
          (item.title?.toLowerCase().includes(q) ?? false)
      );
    },
    [search]
  );

  const filteredAutoMatched = useMemo(
    () => filterItems(autoMatched),
    [autoMatched, filterItems]
  );
  const filteredManual = useMemo(
    () => filterItems(manualEvents),
    [manualEvents, filterItems]
  );
  const filteredVenuePublic = useMemo(
    () => filterItems(venuePublicEvents),
    [venuePublicEvents, filterItems]
  );

  const allItems = useMemo(
    () => [...autoMatched, ...manualEvents, ...venuePublicEvents],
    [autoMatched, manualEvents, venuePublicEvents]
  );
  const assignEvent = allItems.find((item) => item.event_id === assignEventId);
  const cancelEvent = allItems.find((item) => item.event_id === cancelEventId);

  const canCancelEvent = (item: AdminEventListItem) => {
    const upcoming = new Date(item.scheduled_at).getTime() >= Date.now();
    return (
      upcoming &&
      (item.state === "pending_confirmation" || item.state === "confirmed")
    );
  };

  const handleAssign = async () => {
    if (!assignEventId || assignUsers.length === 0) {
      toast.error("Select at least one person to assign");
      return;
    }
    setAssigning(true);
    try {
      const result = await api.addEventParticipants(
        assignEventId,
        assignUsers.map((u) => u.user_id)
      );
      const added = result.added.length;
      const skipped = result.skipped.length;
      toast.success(
        added
          ? `Added ${added} participant${added === 1 ? "" : "s"}${
              skipped ? ` (${skipped} already assigned)` : ""
            }`
          : "No new participants added"
      );
      setAssignEventId(null);
      setAssignUsers([]);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign participants");
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelEventId) return;
    setCancelling(true);
    try {
      await api.cancelAdminEvent(cancelEventId);
      toast.success("Event cancelled");
      setCancelEventId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel event");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Header
        placeholder="Search events by type, city, state, or ID…"
        value={search}
        onChange={setSearch}
      />
      <main className="flex-1 overflow-auto px-8 py-8">
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted">
          <span>Console</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-text-primary">Events</span>
        </nav>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">Events</h1>
            <p className="mt-2 max-w-2xl text-text-muted">
              Review auto-matched plans, invite-only events, and public venue programs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/events/venue-program/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-brand bg-white px-4 text-sm font-semibold text-brand hover:bg-brand-tint"
            >
              <MapPin className="h-4 w-4" />
              Venue public program
            </Link>
            <Link
              href="/events/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-cta hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" />
              Invite-only event
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand" />
                <div>
                  <h2 className="text-lg font-semibold text-brand-dark">
                    Automatically matched schedules
                  </h2>
                  <p className="text-xs text-text-muted">
                    Week of {formatWeekLabel(weekMonday)} · created by the matching scheduler
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand">
                {autoMatched.length} this week
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 px-8 py-16 text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading auto-matched events…
              </div>
            ) : (
              <EventTable
                items={filteredAutoMatched}
                emptyMessage={
                  autoMatched.length === 0
                    ? "No auto-matched schedules for this week yet. Run the matching scheduler from Settings when members have opted in."
                    : "No auto-matched events match your search."
                }
                onAssign={(id) => {
                  setAssignEventId(id);
                  setAssignUsers([]);
                }}
                onCancel={setCancelEventId}
                canCancelEvent={canCancelEvent}
                showCity
              />
            )}
          </section>

          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand" />
                <div>
                  <h2 className="text-lg font-semibold text-brand-dark">Public venue programs</h2>
                  <p className="text-xs text-text-muted">
                    Listed in Explore — members reserve directly
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand">
                {venuePublicEvents.length} upcoming
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 px-8 py-16 text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading venue programs…
              </div>
            ) : (
              <EventTable
                items={filteredVenuePublic}
                emptyMessage={
                  venuePublicEvents.length === 0
                    ? "No public venue programs yet. Create a single or recurring program at a partner venue."
                    : "No venue programs match your search."
                }
                onAssign={(id) => {
                  setAssignEventId(id);
                  setAssignUsers([]);
                }}
                onCancel={setCancelEventId}
                canCancelEvent={canCancelEvent}
              />
            )}
          </section>

          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <CalendarDays className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold text-brand-dark">Invite-only events</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 px-8 py-16 text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading invite-only events…
              </div>
            ) : (
              <EventTable
                items={filteredManual}
                emptyMessage={
                  manualEvents.length === 0
                    ? "No invite-only events yet. Create one to get started."
                    : "No invite-only events match your search."
                }
                onAssign={(id) => {
                  setAssignEventId(id);
                  setAssignUsers([]);
                }}
                onCancel={setCancelEventId}
                canCancelEvent={canCancelEvent}
              />
            )}
          </section>
        </div>
      </main>

      {assignEventId && assignEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card border border-surface-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-brand-dark">Assign participants</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {assignEvent.experience_type} on {formatDateTime(assignEvent.scheduled_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssignEventId(null);
                  setAssignUsers([]);
                }}
                className="rounded-full p-1 text-text-muted hover:bg-surface-inset"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <UserSearchPicker selected={assignUsers} onChange={setAssignUsers} />

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAssignEventId(null);
                  setAssignUsers([]);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={assigning || assignUsers.length === 0}
                onClick={handleAssign}
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Assigning…
                  </>
                ) : (
                  "Assign selected"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {cancelEventId && cancelEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card border border-surface-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-brand-dark">Cancel event</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {cancelEvent.title ?? cancelEvent.experience_type} on{" "}
                  {formatDateTime(cancelEvent.scheduled_at)}
                </p>
                <p className="mt-3 text-sm text-text-primary">
                  This will cancel the event for all assigned participants. This action cannot be
                  undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelEventId(null)}
                className="rounded-full p-1 text-text-muted hover:bg-surface-inset"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelEventId(null)}
                disabled={cancelling}
              >
                Keep event
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={cancelling}
                onClick={handleCancel}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  "Cancel event"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
