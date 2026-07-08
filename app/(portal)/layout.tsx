"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MobileNavProvider } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { withBasePath } from "@/lib/base-path";
import type { MeResponse } from "@/lib/types";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(withBasePath("/api/auth/session"))
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.replace(withBasePath("/login"));
          return;
        }
        if (!d.user.roles?.includes("ops_admin")) {
          router.replace(withBasePath("/login?error=unauthorized"));
          return;
        }
        setUser(d.user);
        setReady(true);
      })
      .catch(() => router.replace(withBasePath("/login")));
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        </div>
        <p className="font-mono text-sm text-text-muted">Loading admin console…</p>
      </div>
    );
  }

  return (
    <MobileNavProvider user={user}>
      <div className="flex min-h-screen min-w-0 bg-surface">
        <Sidebar user={user} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </MobileNavProvider>
  );
}
