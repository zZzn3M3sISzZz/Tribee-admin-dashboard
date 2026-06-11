"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";
import type { MeResponse } from "@/lib/types";

export default function SettingsPage() {
  const [user, setUser] = useState<MeResponse | null>(null);

  useEffect(() => {
    fetch(withBasePath("/api/auth/session"))
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => {});
  }, []);

  const signOut = async () => {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    window.location.href = withBasePath("/login");
  };

  return (
    <>
      <Header placeholder="Search settings..." />
      <main className="flex-1 overflow-auto px-8 py-8">
        <h1 className="text-3xl font-bold text-brand-dark">Settings</h1>
        <p className="mt-2 text-text-secondary">Manage your admin console preferences.</p>

        <div className="mt-8 max-w-xl space-y-6">
          <section className="rounded-card border border-surface-border bg-white p-6">
            <h2 className="font-semibold text-brand-dark">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Display name</dt>
                <dd className="font-medium">{user?.profile.display_name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">User ID</dt>
                <dd className="font-mono text-xs">{user?.user.id ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Roles</dt>
                <dd className="font-medium">{user?.roles.join(", ") ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-card border border-surface-border bg-white p-6">
            <h2 className="font-semibold text-brand-dark">Session</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Sign out of the offScreen admin console on this device.
            </p>
            <Button variant="outline" className="mt-4" onClick={signOut}>
              Sign out
            </Button>
          </section>
        </div>
      </main>
    </>
  );
}
