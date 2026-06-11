"use client";

import { Bell, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header({
  placeholder = "Search moderation logs, hosts, or members...",
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
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
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-text-muted hover:bg-surface-inset"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
