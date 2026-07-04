"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  ImagePlus,
  Info,
  Loader2,
  MapPin,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VenueAmenitiesEditor } from "@/components/venue-amenities-editor";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  buildVenueAmenitiesPayload,
  normalizeAmenitySlug,
  parseLegacyAmenitiesFromDescription,
  splitVenueAmenities,
  stripLegacyAmenitiesFromDescription,
} from "@/lib/venue-amenities";
import type { AdminVenueListItem } from "@/lib/types";

const VENUE_TYPES = [
  "Cafe & Lounge",
  "Restaurant",
  "Bar & Pub",
  "Activity Space",
  "Outdoor Venue",
];

const CITY_OPTIONS = [
  { slug: "mumbai", label: "Mumbai" },
  { slug: "delhi", label: "Delhi" },
  { slug: "bangalore", label: "Bangalore" },
  { slug: "chennai", label: "Chennai" },
  { slug: "hyderabad", label: "Hyderabad" },
  { slug: "pune", label: "Pune" },
  { slug: "kolkata", label: "Kolkata" },
];

const BUDGET_TIERS = [
  { value: "budget", label: "Budget" },
  { value: "mid", label: "Mid" },
  { value: "premium", label: "Premium" },
];

const MAX_IMAGES = 3;

function venueImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = (
    process.env.NEXT_PUBLIC_TRIBEE_API_URL ?? "https://api.enshaproductions.com"
  ).replace(/\/$/, "");
  return `${base}${path}`;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
      {children}
      {required && <span className="text-brand"> *</span>}
    </label>
  );
}

export default function EditVenuePage() {
  const params = useParams<{ venueId: string }>();
  const router = useRouter();
  const venueId = params.venueId;

  const [loading, setLoading] = useState(true);
  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState(VENUE_TYPES[0]);
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("mumbai");
  const [budgetTier, setBudgetTier] = useState("mid");
  const [maxTables, setMaxTables] = useState("10");
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previewUrls = useMemo(
    () => newImages.map((file) => URL.createObjectURL(file)),
    [newImages]
  );

  useEffect(
    () => () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [previewUrls]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const venue: AdminVenueListItem = await api.getAdminVenue(venueId);
        if (cancelled) return;
        setVenueName(venue.name);
        setVenueType(venue.venue_type ?? VENUE_TYPES[0]);
        const legacyAmenities = parseLegacyAmenitiesFromDescription(venue.description);
        const structuredAmenities =
          (venue.amenities?.length ?? 0) > 0 ? venue.amenities! : legacyAmenities;
        const { standard, custom } = splitVenueAmenities(structuredAmenities);
        setSelectedAmenities(standard);
        setCustomTags(custom);
        setAbout(stripLegacyAmenitiesFromDescription(venue.description));
        setAddress(venue.address ?? "");
        setCity(venue.city_slug ?? venue.city_id);
        setBudgetTier(venue.budget_tier);
        setMaxTables(String(venue.max_tables));
        const urls = (venue.image_urls ?? []).map(venueImageUrl);
        if (!urls.length && venue.primary_image_url) {
          urls.push(venueImageUrl(venue.primary_image_url));
        }
        setExistingImageUrls(urls);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load venue");
        router.push("/venues");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venueId, router]);

  const onImageSelect = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!incoming.length) {
      toast.error("Please choose image files only");
      return;
    }
    setNewImages((prev) => {
      const merged = [...prev, ...incoming].slice(0, MAX_IMAGES);
      if (prev.length + incoming.length > MAX_IMAGES) {
        toast.message(`Only ${MAX_IMAGES} images are allowed per venue`);
      }
      return merged;
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const addCustomTag = () => {
    const tag = normalizeAmenitySlug(newTag);
    if (!tag || customTags.includes(tag)) return;
    setCustomTags((prev) => [...prev, tag]);
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!venueName.trim() || !address.trim()) {
      toast.error("Venue name and address are required");
      return;
    }
    if (newImages.length === 0 && existingImageUrls.length === 0) {
      toast.error("Venue must have at least one image");
      return;
    }

    setSubmitting(true);
    try {
      await api.updateVenue(
        venueId,
        {
          name: venueName.trim(),
          city_id: city,
          budget_tier: budgetTier,
          max_tables: Number(maxTables) || 10,
          description: about.trim() || undefined,
          address: address.trim(),
          venue_type: venueType,
          amenities: buildVenueAmenitiesPayload(selectedAmenities, customTags),
          h3_index: 0,
        },
        newImages.length > 0 ? newImages : undefined
      );
      toast.success(`Venue "${venueName.trim()}" updated`);
      router.push("/venues");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Venue update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header placeholder="Search venues..." />
        <main className="flex flex-1 items-center justify-center py-24 text-text-secondary">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading venue…
        </main>
      </>
    );
  }

  const displayImages =
    newImages.length > 0
      ? previewUrls.map((url, index) => ({ url, kind: "new" as const, index }))
      : existingImageUrls.map((url, index) => ({ url, kind: "existing" as const, index }));

  return (
    <>
      <Header placeholder="Search venues, hosts, or applications..." />
      <main className="flex-1 overflow-auto px-8 py-8">
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted">
          <Link href="/venues" className="hover:text-brand">
            Venues
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-text-primary">Edit venue</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">Edit Venue</h1>
          <p className="mt-2 max-w-2xl text-text-muted">
            Update partner venue details. Upload new photos only if you want to replace the
            current gallery.
          </p>
        </div>

        <form
          className="mx-auto max-w-5xl space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80">
            <div className="flex items-center gap-2 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <Info className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold text-brand-dark">Core Identity</h2>
            </div>
            <div className="grid gap-6 p-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <FieldLabel required>Venue Name</FieldLabel>
                  <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Venue Type</FieldLabel>
                  <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm"
                  >
                    {VENUE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Budget Tier</FieldLabel>
                    <select
                      value={budgetTier}
                      onChange={(e) => setBudgetTier(e.target.value)}
                      className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm"
                    >
                      {BUDGET_TIERS.map((tier) => (
                        <option key={tier.value} value={tier.value}>
                          {tier.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Max Tables</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={maxTables}
                      onChange={(e) => setMaxTables(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <FieldLabel>About the Venue</FieldLabel>
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="min-h-[148px]"
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80">
            <div className="flex items-center gap-2 border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <MapPin className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold text-brand-dark">Location</h2>
            </div>
            <div className="grid gap-6 p-8 lg:grid-cols-2">
              <div>
                <FieldLabel required>Physical Address</FieldLabel>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <FieldLabel required>City</FieldLabel>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm"
                >
                  {CITY_OPTIONS.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80">
            <div className="flex items-center justify-between border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-semibold text-brand-dark">Venue Photos</h2>
              </div>
              <span className="text-xs text-text-muted">
                {newImages.length > 0
                  ? `${newImages.length} new (will replace current)`
                  : `${existingImageUrls.length} current`}
              </span>
            </div>
            <div className="p-8">
              <p className="mb-4 text-sm text-text-secondary">
                Leave photos unchanged, or upload 1–3 new images to replace the gallery.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {displayImages.map((item) => (
                  <div
                    key={`${item.kind}-${item.index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border border-surface-border"
                  >
                    <Image
                      src={item.url}
                      alt={`Venue ${item.index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {item.kind === "new" && (
                      <button
                        type="button"
                        onClick={() => removeNewImage(item.index)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {(newImages.length > 0 ? newImages.length : existingImageUrls.length) <
                MAX_IMAGES ? (
                  <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-surface-border bg-surface-inset text-sm text-text-muted hover:border-brand hover:text-brand">
                    <ImagePlus className="mb-2 h-6 w-6" />
                    {newImages.length > 0 ? "Add image" : "Replace photos"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => onImageSelect(e.target.files)}
                    />
                  </label>
                ) : null}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80">
            <div className="flex items-center justify-between border-b border-surface-border bg-brand-dark/5 px-8 py-4">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-semibold text-brand-dark">Venue Offerings & Amenities</h2>
              </div>
              <span className="text-xs text-text-muted">Select all that apply</span>
            </div>
            <div className="p-8">
              <VenueAmenitiesEditor
                selectedAmenities={selectedAmenities}
                customTags={customTags}
                newTag={newTag}
                onToggleAmenity={toggleAmenity}
                onNewTagChange={setNewTag}
                onAddCustomTag={addCustomTag}
                onRemoveCustomTag={removeTag}
              />
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-surface-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-text-muted">{venueId}</p>
            <div className="flex gap-3">
              <Link
                href="/venues"
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-lg border border-surface-border bg-white px-4 text-sm font-semibold text-text-primary hover:bg-surface-inset"
                )}
              >
                Cancel
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
