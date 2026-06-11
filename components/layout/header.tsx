"use client";

import { useEffect, useState } from "react";
import { Bell, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export function Header({
  placeholder = "Search moderation logs, hosts, or members...",
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [pendingCount, setPendingCount] = useState(0);

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
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface-border bg-surface px-8">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-full border-0 bg-surface-inset pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative rounded-full p-2 text-text-muted hover:bg-surface-inset"
          aria-label={`${pendingCount} pending moderation items`}
          title={`${pendingCount} pending moderation items`}
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-text-muted hover:bg-surface-inset"
          aria-label="Help"
          title="Contact ops support for admin console help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
