"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EntryFeeFields } from "@/components/entry-fee-fields";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { CITY_OPTIONS, cityLabel } from "@/lib/cities";
import {
  entryFeeFromLabel,
  entryFeeInrForApi,
  validateEntryFee,
  type EntryFeeKind,
} from "@/lib/entry-fee";
import { formatDateTime } from "@/lib/utils";
import { venueCityLabel, venuesForPicker } from "@/lib/venues";
import type { AdminEventDetail, AdminVenueListItem } from "@/lib/types";

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

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sourceLabel(source: string): string {
  if (source === "auto_matched") return "Auto-matched";
  if (source === "venue_public") return "Public venue program";
  return "Manual";
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = String(params.eventId);

  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [venues, setVenues] = useState<AdminVenueListItem[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [venueId, setVenueId] = useState("");
  const [entryFeeKind, setEntryFeeKind] = useState<EntryFeeKind>("free");
  const [entryFeeAmount, setEntryFeeAmount] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const detail = await api.getAdminEvent(eventId);
        if (cancelled) return;
        setEvent(detail);
        setTitle(detail.title ?? "");
        setSubtitle(detail.subtitle ?? "");
        setScheduledAt(isoToDatetimeLocal(detail.scheduled_at));
        setCapacity(detail.capacity != null ? String(detail.capacity) : "");
        setVenueId(detail.venue_id ?? "");
        const fee = entryFeeFromLabel(detail.price_label);
        setEntryFeeKind(fee.kind);
        setEntryFeeAmount(fee.amount);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load event");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingVenues(true);
      try {
        const res = await api.listAdminVenues(200);
        if (!cancelled) setVenues(res.items);
      } catch {
        if (!cancelled) toast.error("Failed to load venues");
      } finally {
        if (!cancelled) setLoadingVenues(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const citySlug = event?.city_slug ?? "mumbai";
  const { items: cityVenues, showingAllCities } = useMemo(
    () => venuesForPicker(venues, citySlug),
    [venues, citySlug]
  );

  const hasCatalog = Boolean(event?.catalog_id);
  const canEditVenue = !event?.is_venue_public || Boolean(event?.venue_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const scheduled = new Date(scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      toast.error("Enter a valid date and time");
      return;
    }
    if (hasCatalog) {
      const entryFeeError = validateEntryFee(entryFeeKind, entryFeeAmount);
      if (entryFeeError) {
        toast.error(entryFeeError);
        return;
      }
    }

    const body: {
      scheduled_at: string;
      title?: string;
      subtitle?: string;
      capacity?: number;
      venue_id?: string | null;
      entry_fee_inr?: number;
    } = {
      scheduled_at: scheduled.toISOString(),
    };

    if (hasCatalog) {
      body.title = title.trim() || undefined;
      body.subtitle = subtitle.trim() || undefined;
      const cap = Number(capacity);
      if (capacity.trim() && (!Number.isFinite(cap) || cap < 1)) {
        toast.error("Capacity must be a positive number");
        return;
      }
      if (capacity.trim()) body.capacity = cap;
      body.entry_fee_inr = entryFeeInrForApi(entryFeeKind, entryFeeAmount) ?? 0;
    }

    const initialVenue = event.venue_id ?? "";
    if (venueId !== initialVenue) {
      body.venue_id = venueId || null;
    }

    setSaving(true);
    try {
      await api.updateAdminEvent(eventId, body);
      toast.success("Event updated");
      router.push("/events");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </main>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <main className="flex-1 px-8 py-8">
          <p className="text-text-muted">Event not found.</p>
          <Link href="/events" className="mt-4 inline-block text-brand hover:underline">
            Back to events
          </Link>
        </main>
      </>
    );
  }

  if (event.state === "cancelled") {
    return (
      <>
        <Header />
        <main className="flex-1 px-8 py-8">
          <p className="text-text-muted">Cancelled events cannot be edited.</p>
          <Link href="/events" className="mt-4 inline-block text-brand hover:underline">
            Back to events
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 overflow-auto px-8 py-8">
        <Link
          href="/events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-dark">Edit event</h1>
          <p className="mt-1 text-sm text-text-muted">
            {sourceLabel(event.source)} · {event.experience_type.replace(/_/g, " ")} ·{" "}
            {event.state.replace(/_/g, " ")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
            <div className="border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <h2 className="text-lg font-semibold text-brand-dark">Schedule</h2>
            </div>
            <div className="space-y-6 p-8">
              <div>
                <FieldLabel required>Date & time</FieldLabel>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
                <p className="mt-2 text-xs text-text-muted">
                  Currently scheduled for {formatDateTime(event.scheduled_at)}
                </p>
              </div>
            </div>
          </section>

          {hasCatalog ? (
            <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
              <div className="border-b border-surface-border bg-brand-dark/5 px-8 py-4">
                <h2 className="text-lg font-semibold text-brand-dark">Listing details</h2>
              </div>
              <div className="space-y-6 p-8">
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Subtitle</FieldLabel>
                  <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Capacity</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
                <EntryFeeFields
                  kind={entryFeeKind}
                  amount={entryFeeAmount}
                  onKindChange={setEntryFeeKind}
                  onAmountChange={setEntryFeeAmount}
                />
              </div>
            </section>
          ) : (
            <p className="rounded-lg border border-surface-border bg-surface-inset px-4 py-3 text-sm text-text-muted">
              This event has no explore listing — only the schedule can be updated.
            </p>
          )}

          {canEditVenue ? (
            <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
              <div className="border-b border-surface-border bg-brand-dark/5 px-8 py-4">
                <h2 className="text-lg font-semibold text-brand-dark">Venue</h2>
              </div>
              <div className="p-8">
                <FieldLabel>{event.is_venue_public ? "Venue" : "Partner venue"}</FieldLabel>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  disabled={event.is_venue_public}
                  className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm disabled:opacity-60"
                >
                  <option value="">
                    {loadingVenues
                      ? "Loading venues…"
                      : event.is_venue_public
                        ? event.venue_label ?? "Venue"
                        : "No venue selected"}
                  </option>
                  {!event.is_venue_public &&
                    cityVenues.map((venue) => (
                      <option key={venue.venue_id} value={venue.venue_id}>
                        {venue.name}
                        {venue.address ? ` — ${venue.address}` : ""}
                        {showingAllCities ? ` · ${venueCityLabel(venue)}` : ""}
                      </option>
                    ))}
                </select>
                {event.is_venue_public ? (
                  <p className="mt-2 text-xs text-text-muted">
                    Venue is fixed for public venue programs. Change the series to move venues.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-text-muted">
                    City: {cityLabel(citySlug)}
                    {showingAllCities ? " · showing venues from all cities" : ""}
                  </p>
                )}
              </div>
            </section>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-surface-border pt-6">
            <Link
              href="/events"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-surface-border bg-white px-4 text-sm font-semibold text-text-primary hover:bg-surface-inset"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
