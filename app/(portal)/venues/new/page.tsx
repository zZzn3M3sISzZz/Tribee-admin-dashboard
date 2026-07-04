"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import { api } from "@/lib/api";
import { VenueAmenitiesEditor } from "@/components/venue-amenities-editor";
import { buildVenueAmenitiesPayload, normalizeAmenitySlug } from "@/lib/venue-amenities";

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

function SectionCard({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-card border border-surface-border-light bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-surface-border bg-brand-dark/5 px-8 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-brand-dark">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-8">{children}</div>
    </section>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
      {children}
      {required && <span className="text-brand"> *</span>}
    </label>
  );
}

export default function NewVenuePage() {
  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState(VENUE_TYPES[0]);
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("mumbai");
  const [postalCode, setPostalCode] = useState("");
  const [budgetTier, setBudgetTier] = useState("mid");
  const [maxTables, setMaxTables] = useState("10");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const previewUrls = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  useEffect(
    () => () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [previewUrls]
  );

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

  const onImageSelect = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!incoming.length) {
      toast.error("Please choose image files only");
      return;
    }
    setImages((prev) => {
      const merged = [...prev, ...incoming].slice(0, MAX_IMAGES);
      if (prev.length + incoming.length > MAX_IMAGES) {
        toast.message(`Only ${MAX_IMAGES} images are allowed per venue`);
      }
      return merged;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const buildDescription = () => {
    const parts = [about.trim()];
    if (postalCode.trim()) {
      parts.push(`Postal code: ${postalCode.trim()}`);
    }
    return parts.filter(Boolean).join("\n\n");
  };

  const handleComplete = async () => {
    if (!venueName.trim() || !address.trim()) {
      toast.error("Venue name and address are required");
      return;
    }
    if (images.length < 1) {
      toast.error("Add at least 1 venue image before publishing");
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.createVenue(
        {
          name: venueName.trim(),
          city_id: city,
          budget_tier: budgetTier,
          max_tables: Number(maxTables) || 10,
          description: buildDescription() || undefined,
          address: address.trim(),
          venue_type: venueType,
          amenities: buildVenueAmenitiesPayload(selectedAmenities, customTags),
          h3_index: 0,
        },
        images
      );
      toast.success(`Venue "${result.name}" created with ${result.image_count} images`);
      setVenueName("");
      setAbout("");
      setAddress("");
      setPostalCode("");
      setSelectedAmenities([]);
      setCustomTags([]);
      setImages([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Venue creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header placeholder="Search venues, hosts, or applications..." />
      <main className="flex-1 overflow-auto px-8 py-8">
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted">
          <span>Console</span>
          <ChevronRight className="h-3 w-3" />
          <span>Venues</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-text-primary">Register New Venue</span>
        </nav>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
              Onboard New Venue
            </h1>
            <p className="mt-2 max-w-2xl text-text-muted">
              Create a partner venue profile. At least one image is required, up to three.
            </p>
          </div>
        </div>

        <form
          className="mx-auto max-w-5xl space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleComplete();
          }}
        >
          <SectionCard icon={Info} title="Core Identity">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <FieldLabel required>Venue Name</FieldLabel>
                  <Input
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. The Green Meadow Hub"
                  />
                </div>
                <div>
                  <FieldLabel>Venue Type</FieldLabel>
                  <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="flex h-12 w-full rounded-lg border border-surface-border bg-surface px-4 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
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
                  placeholder="Describe the atmosphere, design language, and unique appeal..."
                  className="min-h-[148px]"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={MapPin} title="Location Details">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Physical Address</FieldLabel>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name, number, suite..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <FieldLabel>Postal Code</FieldLabel>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-surface-border bg-surface-inset p-6 text-sm text-text-secondary">
                Venue coordinates will be refined in a later release. For now, the city slug
                drives matching and the address is stored on the venue profile.
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={ImagePlus}
            title="Venue Photos"
            action={
              <span className="text-xs text-text-muted">
                {images.length}/{MAX_IMAGES} uploaded
              </span>
            }
          >
            <p className="mb-4 text-sm text-text-secondary">
              Upload between 1 and 3 images. Venues cannot be published without photos.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {previewUrls.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-surface-border"
                >
                  <Image src={url} alt={`Venue ${index + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES ? (
                <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-surface-border bg-surface-inset text-sm text-text-muted hover:border-brand hover:text-brand">
                  <ImagePlus className="mb-2 h-6 w-6" />
                  Add image
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
          </SectionCard>

          <SectionCard
            icon={UtensilsCrossed}
            title="Venue Offerings & Amenities"
            action={<span className="text-xs text-text-muted">Select all that apply</span>}
          >
            <VenueAmenitiesEditor
              selectedAmenities={selectedAmenities}
              customTags={customTags}
              newTag={newTag}
              onToggleAmenity={toggleAmenity}
              onNewTagChange={setNewTag}
              onAddCustomTag={addCustomTag}
              onRemoveCustomTag={removeTag}
            />

          </SectionCard>

          <div className="flex flex-col gap-4 border-t border-surface-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              {images.length < 1
                ? "Add at least one image to enable registration"
                : "Ready to publish this venue to Tribee"}
            </p>
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting || images.length < 1}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
