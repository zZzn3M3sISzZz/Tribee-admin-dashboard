"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { OffscreenLogo } from "@/components/offscreen-logo";
import { cn, initials } from "@/lib/utils";
import type { MeResponse } from "@/lib/types";
import { isNavActive, NAV_SECTIONS } from "./nav-config";

type MobileNavContextValue = {
  open: boolean;
  openNav: () => void;
  closeNav: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  return ctx;
}

export function MobileNavProvider({
  user,
  children,
}: {
  user?: MeResponse | null;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const displayName = user?.profile.display_name ?? "Admin User";
  const role = user?.roles.includes("ops_admin") ? "Ops Admin" : "Moderator";

  const openNav = useCallback(() => setOpen(true), []);
  const closeNav = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <MobileNavContext.Provider value={{ open, openNav, closeNav }}>
      {children}

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            aria-label="Close navigation menu"
            onClick={closeNav}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(280px,88vw)] flex-col border-r border-surface-border bg-surface-sidebar shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-border px-4 py-4">
              <div className="flex items-center gap-3">
                <OffscreenLogo size={28} />
                <div>
                  <p className="font-mono text-sm font-bold text-brand-dark">offScreen</p>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
                    Admin Console
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeNav}
                className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-inset"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
                    {section.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {section.items.map(({ label, href, icon: Icon }) => {
                      const active = isNavActive(pathname, href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={closeNav}
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
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </MobileNavContext.Provider>
  );
}
