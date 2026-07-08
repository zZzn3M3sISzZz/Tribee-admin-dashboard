import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Home,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Settings,
  Tags,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    label: "People",
    items: [
      { label: "User Approvals", href: "/user-approvals", icon: UserCheck },
      { label: "Host Applications", href: "/host-applications", icon: Home },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Events", href: "/events", icon: CalendarDays },
      { label: "Venues", href: "/venues", icon: MapPin },
      { label: "Taxonomy", href: "/taxonomy", icon: Tags },
    ],
  },
  {
    label: "Safety",
    items: [
      { label: "Reports", href: "/reports", icon: AlertTriangle },
      { label: "Safety Inbox", href: "/safety-inbox", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Push Notifications", href: "/push", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function isNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}
