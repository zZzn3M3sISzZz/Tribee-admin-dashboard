export const CITY_OPTIONS = [
  { slug: "mumbai", label: "Mumbai" },
  { slug: "delhi", label: "Delhi" },
  { slug: "bangalore", label: "Bangalore" },
  { slug: "chennai", label: "Chennai" },
  { slug: "hyderabad", label: "Hyderabad" },
  { slug: "pune", label: "Pune" },
  { slug: "kolkata", label: "Kolkata" },
] as const;

export const CITY_LABELS: Record<string, string> = Object.fromEntries(
  CITY_OPTIONS.map((city) => [city.slug, city.label])
);

/** Deterministic Tribee city IDs (UUID v5 of `tribee.city.{slug}`). */
export const CITY_ID_BY_SLUG: Record<string, string> = {
  mumbai: "f30183b6-490e-5b5b-9eff-40ab9ed40c9b",
  delhi: "7fa20287-ffe2-5f54-abd7-8bbc557c9d8f",
  bangalore: "7605df8f-3297-539e-82c6-78bf2cb4e014",
  chennai: "f2681e01-ad4d-5fbe-a216-46b0088db1bc",
  hyderabad: "2fafb10a-ce2e-5acc-bbb5-5e5098151689",
  pune: "2223c591-1a31-5900-bb12-b8e0087ee3d3",
  kolkata: "762f1414-49c7-550e-8d6c-469ccaa7b1d4",
};

export const SLUG_BY_CITY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(CITY_ID_BY_SLUG).map(([slug, id]) => [id.toLowerCase(), slug])
);

export function cityLabel(slug: string): string {
  return CITY_LABELS[slug] ?? slug;
}

export function cityIdFromSlug(slug: string): string | undefined {
  return CITY_ID_BY_SLUG[slug];
}
