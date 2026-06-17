"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, Loader2, MapPin, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AdminVenueListItem } from "@/lib/types";

const CITY_LABELS: Record<string, string> = {
  mumbai: "Mumbai",
  delhi: "Delhi",
  bangalore: "Bangalore",
  chennai: "Chennai",
  hyderabad: "Hyderabad",
  pune: "Pune",
  kolkata: "Kolkata",
};

const BUDGET_FILTERS = [
  { label: "All tiers", value: "" },
  { label: "Budget", value: "budget" },
  { label: "Mid", value: "mid" },
  { label: "Premium", value: "premium" },
] as const;

function cityLabel(item: AdminVenueListItem): string {
  if (item.city_slug && CITY_LABELS[item.city_slug]) {
    return CITY_LABELS[item.city_slug];
  }
  return item.city_slug ?? item.city_id.slice(0, 8);
}

function budgetBadge(tier: string) {
  const styles =
    tier === "premium"
      ? "bg-brand-tint text-brand"
      : tier === "budget"
        ? "bg-surface-inset text-text-muted"
        : "bg-status-mint text-brand-dark";
  return (
    <span
      className={`rounded px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${styles}`}
    >
      {tier}
    </span>
  );
}

function venueImageUrl(primaryImageUrl: string | null): string | null {
  if (!primaryImageUrl) return null;
  if (primaryImageUrl.startsWith("http")) return primaryImageUrl;
  const base = (
    process.env.NEXT_PUBLIC_TRIBEE_API_URL ?? "https://api.enshaproductions.com"
  ).replace(/\/$/, "");
  return `${base}${primaryImageUrl}`;
}

export default function VenuesPage() {
  const [items, setItems] = useState<AdminVenueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listAdminVenues(200);
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load venues");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => {
      if (cityFilter && item.city_slug !== cityFilter) return false;
      if (budgetFilter && item.budget_tier !== budgetFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.venue_type?.toLowerCase().includes(q) ?? false) ||
        (item.address?.toLowerCase().includes(q) ?? false) ||
        cityLabel(item).toLowerCase().includes(q) ||
        item.venue_id.toLowerCase().includes(q)
      );
    });
  }, [items, search, cityFilter, budgetFilter]);

  return (
    <>
      <Header
        placeholder="Search venues by name, city, type, or address..."
        value={search}
        onChange={setSearch}
      />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Venues</h1>
            <p className="mt-2 text-text-secondary">
              {loading
                ? "Loading onboarded venues…"
                : `${items.length} venue${items.length === 1 ? "" : "s"} on the platform`}
            </p>
          </div>
          <Link
            href="/venues/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-cta hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Add venue
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-10 rounded-lg border border-surface-border bg-white px-3 text-sm"
          >
            <option value="">All cities</option>
            {Object.entries(CITY_LABELS).map(([slug, label]) => (
              <option key={slug} value={slug}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
            className="h-10 rounded-lg border border-surface-border bg-white px-3 text-sm"
          >
            {BUDGET_FILTERS.map(({ label, value }) => (
              <option key={value || "all"} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-text-secondary">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading venues…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-surface-border bg-white px-8 py-16 text-center">
            <Building2 className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-4 text-lg font-semibold text-brand-dark">No venues found</p>
            <p className="mt-2 text-sm text-text-secondary">
              {items.length === 0
                ? "Onboard your first partner venue to start assigning events."
                : "Try adjusting your search or filters."}
            </p>
            {items.length === 0 && (
              <Link
                href="/venues/new"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Add venue
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((venue) => {
              const imageUrl = venueImageUrl(venue.primary_image_url);
              return (
                <article
                  key={venue.venue_id}
                  className="overflow-hidden rounded-card border border-surface-border-light bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
                    <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-surface-inset md:h-28 md:w-40">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={venue.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-text-muted">
                          <MapPin className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-brand-dark">
                            {venue.name}
                          </h2>
                          {venue.venue_type && (
                            <p className="mt-1 text-sm text-text-secondary">
                              {venue.venue_type}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {budgetBadge(venue.budget_tier)}
                          <span className="rounded bg-surface-inset px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
                            {venue.image_count} photo{venue.image_count === 1 ? "" : "s"}
                          </span>
                          <Link
                            href={`/venues/${venue.venue_id}/edit`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-surface-border px-3 text-xs font-semibold text-brand-dark hover:border-brand hover:text-brand"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </div>
                      </div>

                      <div className="grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                        <p>
                          <span className="font-semibold text-text-primary">City:</span>{" "}
                          {cityLabel(venue)}
                        </p>
                        <p>
                          <span className="font-semibold text-text-primary">Max tables:</span>{" "}
                          {venue.max_tables}
                        </p>
                        <p>
                          <span className="font-semibold text-text-primary">Spend / head:</span> ₹
                          {venue.typical_spend_per_head_inr.toLocaleString("en-IN")}
                        </p>
                        <p>
                          <span className="font-semibold text-text-primary">Added:</span>{" "}
                          {formatDate(venue.created_at)}
                        </p>
                      </div>

                      {venue.address && (
                        <p className="text-sm text-text-secondary">
                          <span className="font-semibold text-text-primary">Address:</span>{" "}
                          {venue.address}
                        </p>
                      )}

                      {venue.description && (
                        <p className="line-clamp-2 text-sm text-text-secondary">
                          {venue.description}
                        </p>
                      )}

                      <p className="font-mono text-[11px] text-text-muted">{venue.venue_id}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
