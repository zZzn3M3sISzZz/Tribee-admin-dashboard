export type VenueAmenityOption = {
  id: string;
  label: string;
  icon: string;
};

/** Keep in sync with Tribee-backend `tribee-common::venue_amenities`. */
export const VENUE_AMENITIES: VenueAmenityOption[] = [
  { id: "breakfast", label: "Breakfast", icon: "🍞" },
  { id: "lunch", label: "Lunch", icon: "🍔" },
  { id: "dinner", label: "Dinner", icon: "🍽️" },
  { id: "brunch", label: "Brunch", icon: "🥐" },
  { id: "coffee", label: "Coffee", icon: "☕" },
  { id: "drinks", label: "Drinks", icon: "🍸" },
  { id: "board_games", label: "Board Games", icon: "🎮" },
  { id: "sports", label: "Sports", icon: "🏋️" },
  { id: "pottery", label: "Pottery", icon: "🏺" },
  { id: "workshops", label: "Workshops", icon: "🛠️" },
];

const KNOWN_AMENITY_IDS = new Set(VENUE_AMENITIES.map((item) => item.id));

export function amenityLabel(id: string): string {
  return VENUE_AMENITIES.find((item) => item.id === id)?.label ?? id.replace(/_/g, " ");
}

export function splitVenueAmenities(amenities: string[] = []): {
  standard: string[];
  custom: string[];
} {
  const standard: string[] = [];
  const custom: string[] = [];
  for (const id of amenities) {
    if (KNOWN_AMENITY_IDS.has(id)) {
      standard.push(id);
    } else {
      custom.push(id);
    }
  }
  return { standard, custom };
}

export function normalizeAmenitySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join("_");
}

export function buildVenueAmenitiesPayload(
  selectedStandard: string[],
  customTags: string[]
): string[] {
  const normalizedCustom = customTags.map(normalizeAmenitySlug).filter(Boolean);
  return Array.from(new Set([...selectedStandard, ...normalizedCustom]));
}

/** Strip legacy amenities line from description when loading old venues. */
export function stripLegacyAmenitiesFromDescription(description: string | null | undefined): string {
  if (!description) return "";
  const marker = "\n\nAmenities:";
  const index = description.indexOf(marker);
  if (index === -1) return description;
  return description.slice(0, index).trim();
}

export function parseLegacyAmenitiesFromDescription(
  description: string | null | undefined
): string[] {
  if (!description) return [];
  const marker = "\n\nAmenities:";
  const index = description.indexOf(marker);
  if (index === -1) return [];
  return description
    .slice(index + marker.length)
    .split(",")
    .map((part) => normalizeAmenitySlug(part))
    .filter(Boolean);
}
