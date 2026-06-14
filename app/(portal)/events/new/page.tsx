"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserSearchPicker } from "@/components/user-search-picker";
import { api } from "@/lib/api";
import type { AdminUserSearchResult } from "@/lib/types";

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

export default function NewEventPage() {
  const router = useRouter();
  const [citySlug, setCitySlug] = useState("mumbai");
  const [experienceType, setExperienceType] = useState("dinner");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt);
  const [initialState, setInitialState] = useState<"confirmed" | "pending_confirmation">(
    "confirmed"
  );
  const [participants, setParticipants] = useState<AdminUserSearchResult[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!scheduledAt) {
      toast.error("Scheduled date and time are required");
      return;
    }

    const scheduled = new Date(scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      toast.error("Invalid scheduled date");
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.createAdminEvent({
        city_slug: citySlug,
        experience_type: experienceType,
        scheduled_at: scheduled.toISOString(),
        initial_state: initialState,
        participant_user_ids: participants.map((p) => p.user_id),
      });
      toast.success(
        `Event created with ${result.participant_count} participant${
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
            Schedule a manual event and assign members. Search by display name or full email
            address.
          </p>
        </div>

        <form
          className="mx-auto max-w-3xl space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <CalendarDays className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold text-brand-dark">Event details</h2>
            </div>
            <div className="grid gap-6 p-8 sm:grid-cols-2">
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
            </div>
          </section>

          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
            <div className="border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <h2 className="text-lg font-semibold text-brand-dark">Participants</h2>
              <p className="mt-1 text-sm text-text-muted">
                Optional at creation time — you can add more people later from the events list.
              </p>
            </div>
            <div className="p-8">
              <UserSearchPicker selected={participants} onChange={setParticipants} />
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-surface-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              {participants.length > 0
                ? `${participants.length} participant${participants.length === 1 ? "" : "s"} selected`
                : "You can create the event without participants and assign people afterward."}
            </p>
            <div className="flex gap-3">
              <Link
                href="/events"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-surface-border bg-white px-4 text-sm font-semibold text-text-primary hover:bg-surface-inset"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
