"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2, Repeat, X } from "lucide-react";
import { toast } from "sonner";
import { AdminEventTable } from "@/components/admin-event-table";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { UserSearchPicker } from "@/components/user-search-picker";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type {
  AdminEventListItem,
  AdminEventParticipant,
  AdminUserSearchResult,
} from "@/lib/types";

export default function VenueProgramSeriesPage() {
  const params = useParams<{ seriesId: string }>();
  const seriesId = params.seriesId;
  const [occurrences, setOccurrences] = useState<AdminEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignEventId, setAssignEventId] = useState<string | null>(null);
  const [assignUsers, setAssignUsers] = useState<AdminUserSearchResult[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [cancelEventId, setCancelEventId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [participantsEventId, setParticipantsEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<AdminEventParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [removingParticipantId, setRemovingParticipantId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listAdminEvents({
        source: "venue_public",
        series_id: seriesId,
        limit: 200,
      });
      const sorted = [...res.items].sort((a, b) =>
        a.scheduled_at.localeCompare(b.scheduled_at)
      );
      setOccurrences(sorted);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    load();
  }, [load]);

  const sample = occurrences[0];
  const title = sample?.title ?? sample?.experience_type ?? "Venue program";
  const assignEvent = occurrences.find((item) => item.event_id === assignEventId);
  const cancelEvent = occurrences.find((item) => item.event_id === cancelEventId);
  const participantsEvent = occurrences.find((item) => item.event_id === participantsEventId);

  const upcomingCount = useMemo(
    () =>
      occurrences.filter(
        (item) =>
          item.state !== "cancelled" && new Date(item.scheduled_at).getTime() >= Date.now()
      ).length,
    [occurrences]
  );

  const canCancelEvent = (item: AdminEventListItem) => {
    const upcoming = new Date(item.scheduled_at).getTime() >= Date.now();
    return (
      upcoming &&
      (item.state === "pending_confirmation" || item.state === "confirmed")
    );
  };

  const canManageParticipants = (item: AdminEventListItem) =>
    item.state === "pending_confirmation" || item.state === "confirmed";

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

  useEffect(() => {
    if (!participantsEventId) {
      setParticipants([]);
      return;
    }
    let cancelled = false;
    setParticipantsLoading(true);
    api
      .listAdminEventParticipants(participantsEventId)
      .then((res) => {
        if (!cancelled) setParticipants(res.items);
      })
      .catch((e) => {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load participants");
        }
      })
      .finally(() => {
        if (!cancelled) setParticipantsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [participantsEventId]);

  const handleRemoveParticipant = async (userId: string) => {
    if (!participantsEventId) return;
    setRemovingParticipantId(userId);
    try {
      await api.removeAdminEventParticipant(participantsEventId, userId);
      setParticipants((current) => current.filter((item) => item.user_id !== userId));
      toast.success("Participant removed from event");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove participant");
    } finally {
      setRemovingParticipantId(null);
    }
  };

  return (
    <>
      <Header placeholder="Search is disabled on this page" value="" onChange={() => {}} />
      <main className="flex-1 overflow-auto px-8 py-8">
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted">
          <span>Console</span>
          <ChevronRight className="h-3 w-3" />
          <Link href="/events" className="hover:text-text-primary">
            Events
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-text-primary">Schedule</span>
        </nav>

        <div className="mb-8">
          <Link
            href="/events"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Repeat className="h-5 w-5 text-brand" />
                <span className="rounded bg-brand-tint px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-brand">
                  Recurring program
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-brand-dark">{title}</h1>
              {sample ? (
                <p className="mt-2 text-text-muted">
                  {sample.venue_label ? `${sample.venue_label} · ` : ""}
                  {sample.experience_type} · {occurrences.length} dates · {upcomingCount}{" "}
                  upcoming
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
          <div className="border-b border-surface-border bg-brand-dark/5 px-8 py-4">
            <h2 className="text-lg font-semibold text-brand-dark">Occurrence schedule</h2>
            <p className="text-xs text-text-muted">
              Assign participants or edit each date individually
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-8 py-16 text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading schedule…
            </div>
          ) : (
            <AdminEventTable
              items={occurrences}
              emptyMessage="No occurrences found for this program."
              onAssign={(id) => {
                setAssignEventId(id);
                setAssignUsers([]);
              }}
              onParticipants={setParticipantsEventId}
              onCancel={setCancelEventId}
              canCancelEvent={canCancelEvent}
            />
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
                  {assignEvent.title ?? assignEvent.experience_type} on{" "}
                  {formatDateTime(assignEvent.scheduled_at)}
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

      {participantsEventId && participantsEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-card border border-surface-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-brand-dark">Occurrence participants</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {participantsEvent.title ?? participantsEvent.experience_type} on{" "}
                  {formatDateTime(participantsEvent.scheduled_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setParticipantsEventId(null)}
                className="rounded-full p-1 text-text-muted hover:bg-surface-inset"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {participantsLoading ? (
              <div className="flex items-center justify-center gap-2 py-14 text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading participants…
              </div>
            ) : participants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-surface-border px-4 py-10 text-center text-sm text-text-muted">
                No one is assigned to this occurrence yet.
              </div>
            ) : (
              <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                {participants.map((participant) => {
                  const initials = participant.display_name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? "")
                    .join("");
                  return (
                    <div
                      key={participant.user_id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-surface-border px-4 py-3"
                    >
                      <div>
                        <div className="font-medium text-brand-dark">
                          {participant.display_name}{" "}
                          <span className="text-xs text-text-muted">({initials || "U"})</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                          <span className="rounded bg-surface-inset px-2 py-1">
                            {participant.verification_level}
                          </span>
                          <span className="rounded bg-surface-inset px-2 py-1">
                            {participant.attendance_status}
                          </span>
                          {participant.user_confirmed ? (
                            <span className="rounded bg-brand-tint px-2 py-1 text-brand">
                              accepted
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={
                          removingParticipantId === participant.user_id ||
                          !canManageParticipants(participantsEvent)
                        }
                        onClick={() => handleRemoveParticipant(participant.user_id)}
                      >
                        {removingParticipantId === participant.user_id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Removing…
                          </>
                        ) : (
                          "Kick out"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setParticipantsEventId(null)}>
                Close
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
                <h3 className="text-lg font-semibold text-brand-dark">Cancel occurrence</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {cancelEvent.title ?? cancelEvent.experience_type} on{" "}
                  {formatDateTime(cancelEvent.scheduled_at)}
                </p>
                <p className="mt-3 text-sm text-text-primary">
                  This will cancel only this date. Other dates in the series are unaffected.
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
                Keep occurrence
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
                  "Cancel occurrence"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
