"use client";

import { Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { amenityLabel, VENUE_AMENITIES } from "@/lib/venue-amenities";

type VenueAmenitiesEditorProps = {
  selectedAmenities: string[];
  customTags: string[];
  newTag: string;
  onToggleAmenity: (id: string) => void;
  onNewTagChange: (value: string) => void;
  onAddCustomTag: () => void;
  onRemoveCustomTag: (tag: string) => void;
};

export function VenueAmenitiesEditor({
  selectedAmenities,
  customTags,
  newTag,
  onToggleAmenity,
  onNewTagChange,
  onAddCustomTag,
  onRemoveCustomTag,
}: VenueAmenitiesEditorProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {VENUE_AMENITIES.map(({ id, label, icon }) => {
          const selected = selectedAmenities.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggleAmenity(id)}
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
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Custom offerings
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {customTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-inset px-3 py-1.5 text-sm text-brand-dark"
            >
              {amenityLabel(tag)}
              <button
                type="button"
                onClick={() => onRemoveCustomTag(tag)}
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
              onChange={(e) => onNewTagChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddCustomTag())}
              placeholder="e.g. badminton"
              className="h-9 w-40"
            />
            <button
              type="button"
              onClick={onAddCustomTag}
              className="flex h-9 items-center gap-1 rounded-lg border border-dashed border-surface-border px-3 text-xs font-medium text-text-muted hover:border-brand hover:text-brand"
            >
              <Plus className="h-3.5 w-3.5" />
              Add custom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
