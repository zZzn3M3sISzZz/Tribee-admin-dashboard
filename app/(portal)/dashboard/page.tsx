"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ClipboardList,
  Home,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { GrowthPoint, OverviewStats } from "@/lib/types";

type GrowthPeriod = 7 | 30 | 90;

const GROWTH_PERIODS: { label: string; days: GrowthPeriod }[] = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="rounded-card border border-surface-border bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-2 text-3xl font-bold text-brand-dark">{value}</p>
          <p className="mt-1 text-xs text-text-secondary">{hint}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ?? "bg-brand-tint text-brand"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>(30);
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [growthLoading, setGrowthLoading] = useState(true);

  useEffect(() => {
    api.getOverview().then(setStats).catch(() => setStats(null));
  }, []);

  useEffect(() => {
    setGrowthLoading(true);
    api
      .getGrowth(growthPeriod)
      .then((data) => setGrowthData(data.points))
      .catch(() => setGrowthData([]))
      .finally(() => setGrowthLoading(false));
  }, [growthPeriod]);

  const pendingTasks =
    (stats?.pending_identity_verifications ?? 0) + (stats?.pending_host_applications ?? 0);

  return (
    <>
      <Header />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
            Overview Dashboard
          </h1>
          <p className="mt-2 text-text-secondary">
            Real-time health monitoring of the offScreen platform ecosystem.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Members"
            value={stats?.total_members.toLocaleString() ?? "—"}
            hint="Active user accounts"
            icon={Users}
          />
          <StatCard
            label="Active Hosts"
            value={stats?.active_hosts ?? "—"}
            hint="Approved community hosts"
            icon={Home}
          />
          <StatCard
            label="Safety Issues"
            value={String(stats?.open_safety_reports ?? 0).padStart(2, "0")}
            hint="Open safety reports"
            icon={AlertTriangle}
            accent="bg-red-50 text-red-600"
          />
          <StatCard
            label="Pending Tasks"
            value={pendingTasks}
            hint={`${stats?.pending_identity_verifications ?? 0} identity · ${stats?.pending_host_applications ?? 0} hosts`}
            icon={ClipboardList}
            accent="bg-surface-inset text-text-muted"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-card border border-surface-border bg-white p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-dark">Growth Over Time</h2>
              <div className="flex gap-2 text-xs">
                {GROWTH_PERIODS.map(({ label, days }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setGrowthPeriod(days)}
                    className={`rounded-full px-3 py-1 ${
                      growthPeriod === days
                        ? "bg-brand text-white"
                        : "bg-surface-inset text-text-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              {growthLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                  Loading growth data…
                </div>
              ) : growthData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                  No growth data for this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData}>
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="members" name="New members" fill="#1b4332" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hosts" name="New hosts" fill="#a5d0b9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-card border border-surface-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-dark">Recent Activity</h2>
              <button type="button" className="text-xs font-medium text-brand">
                View All
              </button>
            </div>
            <div className="space-y-4 text-sm">
              {[
                {
                  title: "Identity reviews pending",
                  detail: `${stats?.pending_identity_verifications ?? 0} submissions awaiting approval`,
                  tone: "text-brand",
                },
                {
                  title: "Open safety reports",
                  detail: `${stats?.open_safety_reports ?? 0} incidents need triage`,
                  tone: "text-red-600",
                },
                {
                  title: "Host applications",
                  detail: `${stats?.pending_host_applications ?? 0} applications in queue`,
                  tone: "text-brand",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-surface-border p-3">
                  <p className={`font-semibold ${item.tone}`}>{item.title}</p>
                  <p className="mt-1 text-text-secondary">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">Quick Management</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Update Policies",
              "Broadcasting",
              "Compliance",
              "Export Data",
            ].map((label) => (
              <div
                key={label}
                className="rounded-card border border-surface-border bg-white p-5"
              >
                <p className="font-semibold text-brand-dark">{label}</p>
                <p className="mt-1 text-xs text-text-secondary">Coming soon</p>
                <Button variant="outline" size="sm" className="mt-4" disabled>
                  Open
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
