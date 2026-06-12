import type { TaxonomyKind } from "./types";

export const TAXONOMY_TABS: { id: TaxonomyKind; label: string }[] = [
  { id: "interest", label: "Interests" },
  { id: "comfort", label: "Social Comforts" },
  { id: "motive", label: "Social Motives" },
];

export function kindLabel(kind: TaxonomyKind): string {
  switch (kind) {
    case "interest":
      return "Interest";
    case "comfort":
      return "Comfort";
    case "motive":
      return "Motive";
  }
}

export function slugifyCatalogId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
