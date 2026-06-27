"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import {
  RefreshProgressBar,
  WEEKLY_OPT_INS_REFRESH_MS,
} from "@/components/refresh-progress-bar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { withBasePath } from "@/lib/base-path";
import type { MeResponse, WeeklyMatchingSchedulerStatus } from "@/lib/types";

export default function SettingsPage() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [scheduler, setScheduler] = useState<WeeklyMatchingSchedulerStatus | null>(null);
  const [schedulerLoading, setSchedulerLoading] = useState(true);
  const [schedulerBusy, setSchedulerBusy] = useState(false);
  const [weeklyOptInsRefreshedAt, setWeeklyOptInsRefreshedAt] = useState(() => Date.now());

  useEffect(() => {
    fetch(withBasePath("/api/auth/session"))
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;

    const loadScheduler = (showLoading = false) => {
      if (showLoading) setSchedulerLoading(true);
      api
        .getWeeklyMatchingScheduler()
        .then((data) => {
          if (active) {
            setScheduler(data);
            setWeeklyOptInsRefreshedAt(Date.now());
          }
        })
        .catch((err: Error) => toast.error(err.message))
        .finally(() => {
          if (active && showLoading) setSchedulerLoading(false);
        });
    };

    loadScheduler(true);
    const interval = window.setInterval(
      () => loadScheduler(false),
      WEEKLY_OPT_INS_REFRESH_MS
    );
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const signOut = async () => {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    window.location.href = withBasePath("/login");
  };

  const toggleScheduler = async () => {
    if (!scheduler) return;
    setSchedulerBusy(true);
    try {
      const next = await api.setWeeklyMatchingScheduler(!scheduler.enabled);
      setScheduler(next);
      toast.success(
        next.enabled
          ? "Automatic weekly matching is on."
          : "Automatic weekly matching is off."
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update scheduler");
    } finally {
      setSchedulerBusy(false);
    }
  };

  const runSchedulerNow = async () => {
    if (
      !window.confirm(
        "Run the weekly matching scheduler now for the current week? This queues matching for all opted-in cities."
      )
    ) {
      return;
    }
    setSchedulerBusy(true);
    try {
      const result = await api.triggerWeeklyMatchingScheduler();
      toast.success(`Matching queued for week of ${result.week}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not trigger matching");
    } finally {
      setSchedulerBusy(false);
    }
  };

  return (
    <>
      <Header placeholder="Search settings..." />
      <main className="flex-1 overflow-auto px-8 py-8">
        <h1 className="text-3xl font-bold text-brand-dark">Settings</h1>
        <p className="mt-2 text-text-secondary">Manage your admin console preferences.</p>

        <div className="mt-8 max-w-xl space-y-6">
          <section className="rounded-card border border-surface-border bg-white p-6">
            <h2 className="font-semibold text-brand-dark">Weekly matching scheduler</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Control the automatic Monday run that matches opted-in members into weekly plans.
              Manual runs still work when automatic scheduling is off.
            </p>

            {schedulerLoading ? (
              <p className="mt-4 text-sm text-text-secondary">Loading scheduler status…</p>
            ) : scheduler ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-inset px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-dark">
                      Automatic schedule: {scheduler.enabled ? "On" : "Off"}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {scheduler.schedule_label}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      scheduler.enabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {scheduler.enabled ? "Enabled" : "Paused"}
                  </span>
                </div>

                <div className="rounded-lg border border-brand/20 bg-brand-tint/40 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                    Live weekly opt-ins
                  </p>
                  <p className="mt-1 text-2xl font-bold text-brand-dark">
                    {(scheduler.weekly_opt_in_count ?? 0).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {scheduler.matching_week
                      ? `Week of ${scheduler.matching_week} · updates every 30s`
                      : "Members opted in for the current matching week"}
                  </p>
                  <RefreshProgressBar
                    className="mt-3"
                    lastRefreshedAt={weeklyOptInsRefreshedAt}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={scheduler.enabled ? "outline" : "primary"}
                    disabled={schedulerBusy}
                    onClick={toggleScheduler}
                  >
                    {scheduler.enabled ? "Turn off automatic schedule" : "Turn on automatic schedule"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={schedulerBusy}
                    onClick={runSchedulerNow}
                  >
                    Run matching now
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-text-secondary">Scheduler status unavailable.</p>
            )}
          </section>

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
