"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      <div className="flex min-h-screen items-center justify-center bg-surface text-brand">
        Loading admin console…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar user={user} />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
