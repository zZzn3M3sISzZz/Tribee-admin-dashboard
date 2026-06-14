"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { cn, initials } from "@/lib/utils";
import type { AdminUserSearchResult } from "@/lib/types";
import { Input } from "@/components/ui/input";

export function UserSearchPicker({
  selected,
  onChange,
  placeholder = "Search by name or email…",
}: {
  selected: AdminUserSearchResult[];
  onChange: (users: AdminUserSearchResult[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminUserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.searchAdminUsers(trimmed);
        const selectedIds = new Set(selected.map((u) => u.user_id));
        setResults(res.items.filter((u) => !selectedIds.has(u.user_id)));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selected]);

  const addUser = (user: AdminUserSearchResult) => {
    onChange([...selected, user]);
    setQuery("");
    setResults([]);
  };

  const removeUser = (userId: string) => {
    onChange(selected.filter((u) => u.user_id !== userId));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
        {searching ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />
        ) : null}
      </div>

      {results.length > 0 ? (
        <ul className="max-h-48 overflow-auto rounded-lg border border-surface-border bg-white">
          {results.map((user) => (
            <li key={user.user_id}>
              <button
                type="button"
                onClick={() => addUser(user)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-tint/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {initials(user.display_name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-brand-dark">
                    {user.display_name}
                  </span>
                  <span className="text-xs text-text-muted">
                    Matched by {user.matched_by} · {user.verification_level}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {query.trim().length >= 2 && !searching && results.length === 0 ? (
        <p className="text-sm text-text-muted">No active users found for that search.</p>
      ) : null}

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((user) => (
            <span
              key={user.user_id}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-inset px-3 py-1.5 text-sm text-brand-dark"
              )}
            >
              {user.display_name}
              <button
                type="button"
                onClick={() => removeUser(user.user_id)}
                className="text-text-muted hover:text-brand"
                aria-label={`Remove ${user.display_name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No participants selected yet.</p>
      )}
    </div>
  );
}
