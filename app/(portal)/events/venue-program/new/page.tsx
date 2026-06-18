"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { AdminVenueListItem } from "@/lib/types";

const CITY_OPTIONS = [
  { slug: "mumbai", label: "Mumbai" },
  { slug: "delhi", label: "Delhi" },
  { slug: "bangalore", label: "Bangalore" },
  { slug: "chennai", label: "Chennai" },
  { slug: "hyderabad", label: "Hyderabad" },
  { slug: "pune", label: "Pune" },
  { slug: "kolkata", label: "Kolkata" },
];

const EXPERIENCE_TYPES = [
  { value: "dinner", label: "Dinner" },
  { value: "brunch", label: "Brunch" },
  { value: "coffee", label: "Coffee" },
  { value: "drinks", label: "Drinks" },
];

const WEEKDAYS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
];

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

function defaultScheduledAt(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(19, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T19:00`;
}

function defaultDate(daysAhead = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function NewVenueProgramPage() {
  const router = useRouter();
  const [scheduleKind, setScheduleKind] = useState<"single" | "recurring">("single");
  const [citySlug, setCitySlug] = useState("mumbai");
  const [experienceType, setExperienceType] = useState("dinner");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [venueId, setVenueId] = useState("");
  const [capacity, setCapacity] = useState("20");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt);
  const [timeLocal, setTimeLocal] = useState("19:00");
  const [seriesStartDate, setSeriesStartDate] = useState(defaultDate());
  const [seriesEndDate, setSeriesEndDate] = useState(defaultDate(90));
  const [weekdays, setWeekdays] = useState<number[]>([4]);
  const [venues, setVenues] = useState<AdminVenueListItem[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingVenues(true);
      try {
        const res = await api.listAdminVenues(200);
        if (!cancelled) setVenues(res.items);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load venues");
        }
      } finally {
        if (!cancelled) setLoadingVenues(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cityVenues = useMemo(
    () => venues.filter((venue) => (venue.city_slug ?? venue.city_id) === citySlug),
    [venues, citySlug]
  );

  const selectedVenue = useMemo(
    () => cityVenues.find((venue) => venue.venue_id === venueId) ?? null,
    [cityVenues, venueId]
  );

  useEffect(() => {
    if (venueId && !cityVenues.some((venue) => venue.venue_id === venueId)) {
      setVenueId("");
    }
  }, [cityVenues, venueId]);

  const toggleWeekday = (day: number) => {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueId) {
      toast.error("Select a partner venue");
      return;
    }
    if (scheduleKind === "recurring" && weekdays.length === 0) {
      toast.error("Select at least one weekday");
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.createVenuePublicProgram(
        scheduleKind === "single"
          ? {
              venue_id: venueId,
              city_slug: citySlug,
              experience_type: experienceType,
              title: title.trim() || undefined,
              subtitle: subtitle.trim() || undefined,
              schedule_kind: "single",
              scheduled_at: new Date(scheduledAt).toISOString(),
              capacity: Number(capacity) || 20,
            }
          : {
              venue_id: venueId,
              city_slug: citySlug,
              experience_type: experienceType,
              title: title.trim() || undefined,
              subtitle: subtitle.trim() || undefined,
              schedule_kind: "recurring",
              weekdays,
              time_local: timeLocal,
              series_start_date: seriesStartDate,
              series_end_date: seriesEndDate,
              capacity: Number(capacity) || 20,
            },
        customImage
      );
      toast.success(
        `Created ${result.occurrence_count} public occurrence${
          result.occurrence_count === 1 ? "" : "s"
        } at ${selectedVenue?.name ?? "venue"}`
      );
      router.push("/events");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create venue program");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header placeholder="Search events, members, or hosts…" />
      <main className="flex-1 overflow-auto px-8 py-8">
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted">
          <span>Console</span>
          <ChevronRight className="h-3 w-3" />
          <Link href="/events" className="hover:text-brand">
            Events
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-text-primary">Venue public program</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
            Venue public program
          </h1>
          <p className="mt-2 max-w-2xl text-text-muted">
            Schedule a single or recurring public event at a partner venue. These appear in
            Explore and members can reserve directly — no accept step required.
          </p>
        </div>

        <form className="mx-auto max-w-3xl space-y-8" onSubmit={handleSubmit}>
          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <MapPin className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold text-brand-dark">Venue & schedule</h2>
            </div>
            <div className="grid gap-6 p-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel required>Schedule type</FieldLabel>
                <div className="flex gap-3">
                  {(["single", "recurring"] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setScheduleKind(kind)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold capitalize ${
                        scheduleKind === kind
                          ? "border-brand bg-brand-tint text-brand"
                          : "border-surface-border text-text-muted"
                      }`}
                    >
                      {kind}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel required>City</FieldLabel>
                <select
                  value={citySlug}
                  onChange={(e) => setCitySlug(e.target.value)}
                  className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm"
                >
                  {CITY_OPTIONS.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel required>Partner venue</FieldLabel>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  disabled={loadingVenues}
                  className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm"
                >
                  <option value="">
                    {loadingVenues ? "Loading venues…" : "Select a venue"}
                  </option>
                  {cityVenues.map((venue) => (
                    <option key={venue.venue_id} value={venue.venue_id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              {scheduleKind === "single" ? (
                <div className="sm:col-span-2">
                  <FieldLabel required>Date & time</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <FieldLabel required>Weekdays</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWeekday(day.value)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                            weekdays.includes(day.value)
                              ? "border-brand bg-brand-tint text-brand"
                              : "border-surface-border text-text-muted"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel required>Time</FieldLabel>
                    <Input
                      type="time"
                      value={timeLocal}
                      onChange={(e) => setTimeLocal(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Capacity</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Start date</FieldLabel>
                    <Input
                      type="date"
                      value={seriesStartDate}
                      onChange={(e) => setSeriesStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel required>End date</FieldLabel>
                    <Input
                      type="date"
                      value={seriesEndDate}
                      onChange={(e) => setSeriesEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <CalendarDays className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold text-brand-dark">Listing details</h2>
            </div>
            <div className="grid gap-6 p-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel>Title</FieldLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    selectedVenue
                      ? `e.g. Live music at ${selectedVenue.name}`
                      : "Event title"
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Subtitle</FieldLabel>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Open to everyone — reserve your spot in the app"
                />
              </div>
              <div>
                <FieldLabel required>Experience</FieldLabel>
                <select
                  value={experienceType}
                  onChange={(e) => setExperienceType(e.target.value)}
                  className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm"
                >
                  {EXPERIENCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {scheduleKind === "single" ? (
                <div>
                  <FieldLabel required>Capacity</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <FieldLabel>Cover image</FieldLabel>
                <p className="mb-3 text-xs text-text-muted">
                  Optional. If omitted, the venue&apos;s first photo is used for every occurrence.
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCustomImage(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t border-surface-border pt-6">
            <Link
              href="/events"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-surface-border bg-white px-4 text-sm font-semibold text-text-primary hover:bg-surface-inset"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : scheduleKind === "recurring" ? (
                "Create recurring program"
              ) : (
                "Create public event"
              )}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
