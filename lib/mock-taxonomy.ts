export type TaxonomyKind = "interest" | "comfort" | "motive";

export interface TaxonomyItem {
  id: string;
  title: string;
  description: string;
  userCount: number;
  kind: TaxonomyKind;
  icon: string;
}

export const TAXONOMY_TABS: { id: TaxonomyKind; label: string }[] = [
  { id: "interest", label: "Interests" },
  { id: "comfort", label: "Social Comforts" },
  { id: "motive", label: "Social Motives" },
];

export const MOCK_TAXONOMY: Record<TaxonomyKind, TaxonomyItem[]> = {
  interest: [
    {
      id: "hiking",
      title: "Outdoor Hiking",
      description:
        "Nature trails, weekend treks, and group hikes for members who prefer active outdoor socialising.",
      userCount: 1240,
      kind: "interest",
      icon: "🥾",
    },
    {
      id: "fine-arts",
      title: "Fine Arts",
      description:
        "Gallery visits, studio sessions, and creative workshops for culturally curious members.",
      userCount: 892,
      kind: "interest",
      icon: "🎨",
    },
    {
      id: "live-sports",
      title: "Live Sports",
      description:
        "Stadium events, watch parties, and recreational leagues for sports enthusiasts.",
      userCount: 2103,
      kind: "interest",
      icon: "🏟️",
    },
    {
      id: "coffee-culture",
      title: "Coffee Culture",
      description:
        "Specialty cafés, latte art meetups, and slow mornings for conversation-led bonding.",
      userCount: 1567,
      kind: "interest",
      icon: "☕",
    },
    {
      id: "theatre",
      title: "Theatre & Performance",
      description:
        "Plays, improv nights, and live performances for members drawn to the stage.",
      userCount: 634,
      kind: "interest",
      icon: "🎭",
    },
  ],
  comfort: [
    {
      id: "small-groups",
      title: "Small Groups Only",
      description: "Prefer intimate gatherings of 4–6 people over large crowds.",
      userCount: 3420,
      kind: "comfort",
      icon: "👥",
    },
    {
      id: "quiet-venues",
      title: "Quiet Venues",
      description: "Low-noise environments where conversation is easy and relaxed.",
      userCount: 2891,
      kind: "comfort",
      icon: "🤫",
    },
    {
      id: "daytime",
      title: "Daytime Events",
      description: "Brunch, afternoon walks, and early-evening experiences.",
      userCount: 1754,
      kind: "comfort",
      icon: "☀️",
    },
    {
      id: "alcohol-free",
      title: "Alcohol-Free",
      description: "Social settings without alcohol as the primary activity.",
      userCount: 1102,
      kind: "comfort",
      icon: "🍵",
    },
  ],
  motive: [
    {
      id: "new-friends",
      title: "Make New Friends",
      description: "Expand social circles and meet people outside existing networks.",
      userCount: 5210,
      kind: "motive",
      icon: "🤝",
    },
    {
      id: "professional",
      title: "Professional Networking",
      description: "Connect with peers in similar industries or career stages.",
      userCount: 1987,
      kind: "motive",
      icon: "💼",
    },
    {
      id: "dating",
      title: "Dating & Romance",
      description: "Meet potential partners in low-pressure group settings first.",
      userCount: 2341,
      kind: "motive",
      icon: "💚",
    },
    {
      id: "community",
      title: "Community Building",
      description: "Contribute to local communities and recurring tribe experiences.",
      userCount: 1433,
      kind: "motive",
      icon: "🏘️",
    },
  ],
};

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
