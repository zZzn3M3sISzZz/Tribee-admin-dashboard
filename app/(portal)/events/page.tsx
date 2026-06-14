"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Loader2, Plus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { UserSearchPicker } from "@/components/user-search-picker";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
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
  return (
    <span className="rounded bg-surface-inset px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
      {state}
    </span>
  );
}

export default function EventsPage() {
  const [items, setItems] = useState<AdminEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assignEventId, setAssignEventId] = useState<string | null>(null);
  const [assignUsers, setAssignUsers] = useState<AdminUserSearchResult[]>([]);
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listAdminEvents(100);
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.experience_type.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.event_id.toLowerCase().includes(q)
    );
  }, [items, search]);

  const assignEvent = items.find((item) => item.event_id === assignEventId);

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

  return (
    <>
      <Header
        placeholder="Search events by type, state, or ID…"
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
              Manually create dinners and assign members by searching their name or email.
            </p>
          </div>
          <Link
            href="/events/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-cta hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>

        <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
            <CalendarDays className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold text-brand-dark">Recent events</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-8 py-16 text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading events…
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-8 py-16 text-center text-text-muted">
              {items.length === 0
                ? "No events yet. Create one to get started."
                : "No events match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-text-secondary">
                    <th className="px-8 py-4 font-semibold">Scheduled</th>
                    <th className="px-4 py-4 font-semibold">Type</th>
                    <th className="px-4 py-4 font-semibold">State</th>
                    <th className="px-4 py-4 font-semibold">Participants</th>
                    <th className="px-8 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.event_id}
                      className="border-b border-surface-border/60 last:border-0"
                    >
                      <td className="px-8 py-4 text-brand-dark">
                        {formatDateTime(item.scheduled_at)}
                      </td>
                      <td className="px-4 py-4 capitalize text-text-primary">
                        {item.experience_type}
                      </td>
                      <td className="px-4 py-4">{stateBadge(item.state)}</td>
                      <td className="px-4 py-4 text-text-primary">{item.participant_count}</td>
                      <td className="px-8 py-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAssignEventId(item.event_id);
                            setAssignUsers([]);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                          Assign people
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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
    </>
  );
}
