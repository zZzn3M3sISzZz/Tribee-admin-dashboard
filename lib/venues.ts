import { cityLabel, SLUG_BY_CITY_ID } from "./cities";
import type { AdminVenueListItem } from "./types";

/** Resolve a venue's Tribee city slug from API fields. */
export function venueCitySlug(venue: AdminVenueListItem): string | null {
  if (venue.city_slug) return venue.city_slug;
  return SLUG_BY_CITY_ID[venue.city_id.toLowerCase()] ?? null;
}

export function venueCityLabel(venue: AdminVenueListItem): string {
  const slug = venueCitySlug(venue);
  return slug ? cityLabel(slug) : "Unknown city";
}

export function venuesInCity(
  venues: AdminVenueListItem[],
  citySlug: string
): AdminVenueListItem[] {
  return venues.filter((venue) => venueCitySlug(venue) === citySlug);
}

/**
 * Venues for the city picker. If none match the selected city but venues exist
 * elsewhere, return all venues so the admin is not stuck with an empty dropdown.
 */
export function venuesForPicker(
  venues: AdminVenueListItem[],
  citySlug: string
): { items: AdminVenueListItem[]; showingAllCities: boolean } {
  const inCity = venuesInCity(venues, citySlug);
  if (inCity.length > 0) {
    return {
      items: [...inCity].sort((a, b) => a.name.localeCompare(b.name)),
      showingAllCities: false,
    };
  }
  if (venues.length === 0) {
    return { items: [], showingAllCities: false };
  }
  return {
    items: [...venues].sort((a, b) => {
      const cityCmp = venueCityLabel(a).localeCompare(venueCityLabel(b));
      return cityCmp !== 0 ? cityCmp : a.name.localeCompare(b.name);
    }),
    showingAllCities: true,
  };
}
