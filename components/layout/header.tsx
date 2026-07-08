"use client";

import { useEffect, useState } from "react";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMobileNav } from "@/components/layout/mobile-nav";
import { api } from "@/lib/api";

export function Header({
  placeholder = "Search moderation logs, hosts, or members…",
  value,
  onChange,
  title,
  subtitle,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  title?: string;
  subtitle?: string;
}) {
  const [pendingCount, setPendingCount] = useState(0);
  const mobileNav = useMobileNav();

  useEffect(() => {
    api
      .getOverview()
      .then((stats) => {
        setPendingCount(
          (stats.pending_identity_verifications ?? 0) +
            (stats.pending_host_applications ?? 0) +
            (stats.open_safety_reports ?? 0)
        );
      })
      .catch(() => setPendingCount(0));
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-surface-card/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {mobileNav ? (
            <button
              type="button"
              onClick={mobileNav.openNav}
              className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-inset hover:text-text-secondary lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}

          {title ? (
            <div className="min-w-0">
              <h1 className="truncate font-mono text-sm font-semibold text-brand-dark sm:text-base">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-text-muted">{subtitle}</p>
              ) : null}
            </div>
          ) : (
            <div className="relative min-w-0 flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
              <Input
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="h-9 rounded-lg border-surface-border bg-surface-inset pl-9 text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {title ? (
            <div className="relative mr-1 hidden w-52 sm:block">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled" />
              <Input
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="h-8 rounded-lg border-surface-border bg-surface-inset pl-8 text-xs"
              />
            </div>
          ) : null}
          <button
            type="button"
            className="relative cursor-pointer rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-surface-inset hover:text-text-secondary"
            aria-label={`${pendingCount} pending moderation items`}
            title={`${pendingCount} pending moderation items`}
          >
            <Bell className="h-4 w-4" />
            {pendingCount > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-open px-1 font-mono text-[9px] font-bold text-white">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-surface-inset hover:text-text-secondary"
            aria-label="Help"
            title="Contact ops support for admin console help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
