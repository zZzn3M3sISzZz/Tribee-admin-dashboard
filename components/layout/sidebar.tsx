"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  Home,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Settings,
  Tags,
  UserCheck,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import type { MeResponse } from "@/lib/types";

const NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "User Approvals", href: "/user-approvals", icon: UserCheck },
  { label: "Host Applications", href: "/host-applications", icon: Home },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Venues", href: "/venues", icon: MapPin },
  { label: "Taxonomy", href: "/taxonomy", icon: Tags },
  { label: "Safety & Reports", href: "/reports", icon: AlertTriangle },
  { label: "Safety Inbox", href: "/safety-inbox", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ user }: { user?: MeResponse | null }) {
  const pathname = usePathname();
  const displayName = user?.profile.display_name ?? "Admin User";
  const role = user?.roles.includes("ops_admin") ? "Ops Admin" : "Moderator";

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col border-r border-surface-border bg-surface">
      <div className="border-b border-surface-border px-8 py-8">
        <p className="text-xl font-bold text-brand-dark">offScreen</p>
        <p className="text-xs font-semibold tracking-wide text-text-secondary">
          Admin Console
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 py-4">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-8 py-3 text-sm transition-colors",
                active
                  ? "border-l-4 border-brand-dark bg-brand-tint pl-[28px] font-medium text-brand-dark"
                  : "text-text-muted hover:bg-brand-tint/50"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-surface-border px-8 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-brand text-xs font-bold text-white">
          {initials(displayName)}
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-dark">{displayName}</p>
          <p className="text-[11px] text-text-secondary">{role}</p>
        </div>
      </div>
    </aside>
  );
}
