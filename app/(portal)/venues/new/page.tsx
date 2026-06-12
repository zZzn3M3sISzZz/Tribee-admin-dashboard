"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronRight,
  ExternalLink,
  Info,
  MapPin,
  Plus,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const VENUE_TYPES = [
  "Cafe & Lounge",
  "Restaurant",
  "Bar & Pub",
  "Activity Space",
  "Outdoor Venue",
];

const AMENITIES = [
  { id: "breakfast", label: "Breakfast", icon: "🍞" },
  { id: "lunch", label: "Lunch", icon: "🍔" },
  { id: "dinner", label: "Dinner", icon: "🍽️" },
  { id: "board-games", label: "Board Games", icon: "🎮" },
  { id: "sports", label: "Sports", icon: "🏋️" },
] as const;

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
  const [city, setCity] = useState("Mumbai");
  const [postalCode, setPostalCode] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "breakfast",
    "lunch",
    "board-games",
  ]);
  const [customTags, setCustomTags] = useState(["Private Cinema", "Pet Friendly"]);
  const [newTag, setNewTag] = useState("");

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const addCustomTag = () => {
    const tag = newTag.trim();
    if (!tag || customTags.includes(tag)) return;
    setCustomTags((prev) => [...prev, tag]);
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved locally (backend not wired yet)");
  };

  const handleComplete = () => {
    if (!venueName.trim() || !address.trim()) {
      toast.error("Venue name and address are required");
      return;
    }
    toast.success("Venue registration queued (backend not wired yet)");
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
              Create a premium profile for a new partner venue. All fields marked with * are
              mandatory for publication.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4" />
            New Venue
          </Button>
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
                    <FieldLabel>City</FieldLabel>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} />
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
              <div className="relative overflow-hidden rounded-lg bg-brand-dark">
                <div className="relative aspect-[4/3] w-full opacity-90">
                  <Image
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=400&fit=crop"
                    alt="Map preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-brand-dark/40" />
                </div>
                <div className="absolute bottom-4 right-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-white/30 bg-white text-brand-dark hover:bg-white/90"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Verify on Maps
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={UtensilsCrossed}
            title="Venue Offerings & Amenities"
            action={
              <span className="text-xs text-text-muted">Select all that apply</span>
            }
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {AMENITIES.map(({ id, label, icon }) => {
                const selected = selectedAmenities.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAmenity(id)}
                    className={cn(
                      "relative flex flex-col items-center gap-3 rounded-lg border p-5 transition-colors",
                      selected
                        ? "border-brand bg-brand-tint"
                        : "border-surface-border bg-surface-inset/50 hover:border-brand/40"
                    )}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm font-medium text-brand-dark">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <FieldLabel>Custom Categories</FieldLabel>
              <div className="flex flex-wrap items-center gap-2">
                {customTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-inset px-3 py-1.5 text-sm text-brand-dark"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-text-muted hover:text-brand"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                    placeholder="Add category"
                    className="h-9 w-36"
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="flex h-9 items-center gap-1 rounded-lg border border-dashed border-surface-border px-3 text-xs font-medium text-text-muted hover:border-brand hover:text-brand"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Custom
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="flex flex-col gap-4 border-t border-surface-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Live preview available after basic information is filled
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button type="submit">Complete Registration</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
