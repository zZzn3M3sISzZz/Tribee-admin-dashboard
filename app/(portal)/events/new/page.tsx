"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ImagePlus,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserSearchPicker } from "@/components/user-search-picker";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type {
  AdminEventImageSuggestion,
  AdminUserSearchResult,
  AdminVenueListItem,
} from "@/lib/types";

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
  date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7));
  date.setHours(19, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T19:00`;
}

function cityLabel(slug: string): string {
  return CITY_OPTIONS.find((c) => c.slug === slug)?.label ?? slug;
}

function experienceLabel(value: string): string {
  return EXPERIENCE_TYPES.find((t) => t.value === value)?.label ?? value;
}

function venueImageUrl(primaryImageUrl: string | null | undefined): string | null {
  if (!primaryImageUrl) return null;
  if (primaryImageUrl.startsWith("http")) return primaryImageUrl;
  const base = (
    process.env.NEXT_PUBLIC_TRIBEE_API_URL ?? "https://api.enshaproductions.com"
  ).replace(/\/$/, "");
  return `${base}${primaryImageUrl}`;
}

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [citySlug, setCitySlug] = useState("mumbai");
  const [experienceType, setExperienceType] = useState("dinner");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt);
  const [initialState, setInitialState] = useState<"confirmed" | "pending_confirmation">(
    "confirmed"
  );
  const [participants, setParticipants] = useState<AdminUserSearchResult[]>([]);
  const [venues, setVenues] = useState<AdminVenueListItem[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venueId, setVenueId] = useState("");
  const [suggestion, setSuggestion] = useState<AdminEventImageSuggestion | null>(null);
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const customPreviewUrl = useMemo(
    () => (customImage ? URL.createObjectURL(customImage) : null),
    [customImage]
  );

  useEffect(
    () => () => {
      if (customPreviewUrl) URL.revokeObjectURL(customPreviewUrl);
    },
    [customPreviewUrl]
  );

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

  const selectedVenueImageUrl = venueImageUrl(selectedVenue?.primary_image_url);

  const usingVenueImage =
    Boolean(venueId && selectedVenue && selectedVenue.image_count > 0);

  const usingCatalogSuggestion =
    !customImage &&
    !usingVenueImage &&
    Boolean(suggestion?.has_image && suggestion.catalog_id);

  const canCreate =
    Boolean(customImage) || usingVenueImage || usingCatalogSuggestion;

  const previewTitle =
    title.trim() ||
    suggestion?.title ||
    `${experienceLabel(experienceType)} in ${cityLabel(citySlug)}`;

  const previewImageUrl =
    customPreviewUrl ?? selectedVenueImageUrl ?? suggestion?.image_url ?? null;

  const handleReview = async () => {
    if (!scheduledAt) {
      toast.error("Scheduled date and time are required");
      return;
    }
    const scheduled = new Date(scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      toast.error("Invalid scheduled date");
      return;
    }

    setLoadingPreview(true);
    try {
      const imageSuggestion = await api.getAdminEventImageSuggestion(
        experienceType,
        citySlug,
        venueId || undefined
      );
      setSuggestion(imageSuggestion);
      setCustomImage(null);
      setStep("preview");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load image preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCreate = async () => {
    const scheduled = new Date(scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      toast.error("Invalid scheduled date");
      return;
    }

    if (!canCreate) {
      toast.error(
        venueId
          ? "Upload an event image or choose a venue that has photos"
          : "Upload an event image or use a suggested one"
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.createAdminEvent(
        {
          city_slug: citySlug,
          experience_type: experienceType,
          scheduled_at: scheduled.toISOString(),
          initial_state: initialState,
          participant_user_ids: participants.map((p) => p.user_id),
          title: title.trim() || undefined,
          subtitle: suggestion?.subtitle,
          venue_id: venueId || undefined,
          source_image_catalog_id: usingCatalogSuggestion
            ? suggestion?.catalog_id ?? undefined
            : undefined,
        },
        customImage
      );
      toast.success(
        `Event "${result.title}" created with ${result.participant_count} participant${
          result.participant_count === 1 ? "" : "s"
        }`
      );
      router.push("/events");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Event creation failed");
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
          <span className="text-text-primary">Create Event</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">Create Event</h1>
          <p className="mt-2 max-w-2xl text-text-muted">
            {step === "form"
              ? "Fill in the details, then review a preview with the event image before publishing."
              : "Review everything below. Change the image if needed, then create the event."}
          </p>
        </div>

        {step === "form" ? (
          <form
            className="mx-auto max-w-3xl space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleReview();
            }}
          >
            <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
                <CalendarDays className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-semibold text-brand-dark">Event details</h2>
              </div>
              <div className="grid gap-6 p-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`e.g. ${experienceLabel(experienceType)} in ${cityLabel(citySlug)}`}
                  />
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
                <div>
                  <FieldLabel required>Scheduled at</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Initial state</FieldLabel>
                  <select
                    value={initialState}
                    onChange={(e) =>
                      setInitialState(e.target.value as "confirmed" | "pending_confirmation")
                    }
                    className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm"
                  >
                    <option value="confirmed">Confirmed (skip user confirmation)</option>
                    <option value="pending_confirmation">
                      Pending confirmation (users must confirm)
                    </option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Partner venue</FieldLabel>
                  <select
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    disabled={loadingVenues}
                    className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm"
                  >
                    <option value="">
                      {loadingVenues
                        ? "Loading venues…"
                        : cityVenues.length > 0
                          ? "No venue selected"
                          : "No venues in this city yet"}
                    </option>
                    {cityVenues.map((venue) => (
                      <option key={venue.venue_id} value={venue.venue_id}>
                        {venue.name}
                        {venue.address ? ` — ${venue.address}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-text-muted">
                    Optional. Links the event to a partner venue and shows the venue name in the
                    app. Without a venue, the city name is used as the location label.
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
              <div className="border-b border-surface-border bg-brand-dark/5 px-8 py-4">
                <h2 className="text-lg font-semibold text-brand-dark">Participants</h2>
              </div>
              <div className="p-8">
                <UserSearchPicker selected={participants} onChange={setParticipants} />
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t border-surface-border pt-6">
              <Link
                href="/events"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-surface-border bg-white px-4 text-sm font-semibold text-text-primary hover:bg-surface-inset"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={loadingPreview}>
                {loadingPreview ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing preview…
                  </>
                ) : (
                  "Review & preview"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mx-auto max-w-3xl space-y-8">
            <section className="overflow-hidden rounded-card border border-surface-border-light bg-white shadow-sm">
              <div className="relative aspect-[16/9] bg-surface-inset">
                {previewImageUrl ? (
                  <Image
                    src={previewImageUrl}
                    alt={previewTitle}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-text-muted">
                    <ImagePlus className="h-10 w-10" />
                    <p className="text-sm">
                      {venueId
                        ? "No venue photo available — upload an image below"
                        : "No suggested image — upload one below"}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-4 p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Event preview
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-brand-dark">{previewTitle}</h2>
                  {suggestion?.subtitle ? (
                    <p className="mt-1 text-sm text-text-muted">{suggestion.subtitle}</p>
                  ) : null}
                </div>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      When
                    </dt>
                    <dd className="mt-1 text-sm text-brand-dark">
                      {formatDateTime(new Date(scheduledAt).toISOString())}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-brand-dark">
                      {selectedVenue
                        ? `${selectedVenue.name}${selectedVenue.address ? ` · ${selectedVenue.address}` : ""}`
                        : `${cityLabel(citySlug)} · ${experienceLabel(experienceType)}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      State
                    </dt>
                    <dd className="mt-1 text-sm capitalize text-brand-dark">
                      {initialState.replace("_", " ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      <Users className="h-3.5 w-3.5" />
                      Participants
                    </dt>
                    <dd className="mt-1 text-sm text-brand-dark">
                      {participants.length > 0
                        ? participants.map((p) => p.display_name).join(", ")
                        : "None yet"}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="rounded-card border border-surface-border-light bg-white/80 p-8">
              <h3 className="text-sm font-semibold text-brand-dark">Event image</h3>
              <p className="mt-1 text-sm text-text-muted">
                {customImage
                  ? `Using your upload: ${customImage.name}`
                  : usingVenueImage
                    ? `Using ${selectedVenue?.name}'s venue photo. Upload a different file to replace it.`
                    : suggestion?.has_image
                      ? "Using the suggested image. Upload a different file to replace it."
                      : venueId
                        ? "This venue has no photos — upload an event image to continue."
                        : "Upload an image, or assign a venue with photos."}
              </p>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-surface-border px-4 py-3 text-sm font-medium text-text-muted hover:border-brand hover:text-brand">
                <ImagePlus className="h-4 w-4" />
                {customImage ? "Choose a different image" : "Upload image from computer"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      toast.error("Please choose an image file");
                      return;
                    }
                    setCustomImage(file);
                  }}
                />
              </label>
            </section>

            <div className="flex flex-col gap-4 border-t border-surface-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("form")}
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to edit
              </Button>
              <div className="flex gap-3">
                <Link
                  href="/events"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-surface-border bg-white px-4 text-sm font-semibold text-text-primary hover:bg-surface-inset"
                >
                  Cancel
                </Link>
                <Button
                  type="button"
                  disabled={submitting || !canCreate}
                  onClick={handleCreate}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create event"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
