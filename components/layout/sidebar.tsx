"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { OffscreenLogo } from "@/components/offscreen-logo";
import { cn, initials } from "@/lib/utils";
import type { MeResponse } from "@/lib/types";

const NAV_SECTIONS = [
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

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

export function Sidebar({ user }: { user?: MeResponse | null }) {
  const pathname = usePathname();
  const displayName = user?.profile.display_name ?? "Admin User";
  const role = user?.roles.includes("ops_admin") ? "Ops Admin" : "Moderator";

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-surface-border bg-surface-sidebar">
      <div className="border-b border-surface-border px-5 py-5">
        <div className="flex items-center gap-3">
          <OffscreenLogo size={32} />
          <div>
            <p className="font-mono text-sm font-bold tracking-tight text-brand-dark">
              offScreen
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ label, href, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "nav-item cursor-pointer",
                      active ? "nav-item-active" : "nav-item-inactive"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-surface-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-surface-inset px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[11px] font-bold text-white">
            {initials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-text-primary">{displayName}</p>
            <p className="text-[10px] text-text-muted">{role}</p>
          </div>
          <span className="h-2 w-2 shrink-0 rounded-full bg-status-mint" />
        </div>
      </div>
    </aside>
  );
}
