"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import {
  RefreshProgressBar,
  WEEKLY_OPT_INS_REFRESH_MS,
} from "@/components/refresh-progress-bar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  activityDetail,
  activityHref,
  activityTitle,
  activityTone,
} from "@/lib/activity";
import { withBasePath } from "@/lib/base-path";
import { downloadCsv } from "@/lib/export";
import type { ActivityItem, GrowthPoint, OverviewStats } from "@/lib/types";

type GrowthPeriod = 7 | 30 | 90;

const GROWTH_PERIODS: { label: string; days: GrowthPeriod }[] = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const QUICK_ACTIONS = [
  {
    label: "User Approvals",
    description: "Review pending identity verifications",
    href: "/user-approvals",
    disabled: false,
  },
  {
    label: "Host Applications",
    description: "Approve or reject host requests",
    href: "/host-applications",
    disabled: false,
  },
  {
    label: "Safety & Compliance",
    description: "Triage open safety reports",
    href: "/reports",
    disabled: false,
  },
  {
    label: "Export Reports",
    description: "Download safety report CSV",
    href: null,
    disabled: false,
    exportReports: true,
  },
] as const;

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  footer,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ElementType;
  accent?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-surface-border bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-2 text-3xl font-bold text-brand-dark">{value}</p>
          <p className="mt-1 text-xs text-text-secondary">{hint}</p>
          {footer ? <div className="mt-3">{footer}</div> : null}
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
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [weeklyOptInsRefreshedAt, setWeeklyOptInsRefreshedAt] = useState(() => Date.now());

  useEffect(() => {
    const loadOverview = () => {
      api
        .getOverview()
        .then((data) => {
          setStats(data);
          setWeeklyOptInsRefreshedAt(Date.now());
        })
        .catch(() => setStats(null));
    };
    loadOverview();
    const interval = window.setInterval(loadOverview, WEEKLY_OPT_INS_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setGrowthLoading(true);
    api
      .getGrowth(growthPeriod)
      .then((data) => setGrowthData(data.points))
      .catch(() => setGrowthData([]))
      .finally(() => setGrowthLoading(false));
  }, [growthPeriod]);

  useEffect(() => {
    setActivityLoading(true);
    api
      .getActivity(8)
      .then((data) => setActivity(data.items))
      .catch(() => setActivity([]))
      .finally(() => setActivityLoading(false));
  }, []);

  const pendingTasks =
    (stats?.pending_identity_verifications ?? 0) + (stats?.pending_host_applications ?? 0);

  const exportReports = async () => {
    setExporting(true);
    try {
      const res = await api.listSafetyReports({ limit: 100 });
      downloadCsv("offscreen-safety-reports.csv", [
        [
          "id",
          "reported_user",
          "reporter",
          "category",
          "status",
          "description",
          "created_at",
        ],
        ...res.items.map((item) => [
          item.id,
          item.reported_display_name,
          item.reporter_display_name,
          item.category,
          item.status,
          item.description ?? "",
          item.created_at,
        ]),
      ]);
      toast.success(`Exported ${res.items.length} reports`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

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

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
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
            label="Weekly Opt-ins"
            value={stats?.weekly_opt_in_count?.toLocaleString() ?? "—"}
            hint={
              stats?.matching_week
                ? `Week of ${stats.matching_week} · refreshes every 30s`
                : "Members opted in this week"
            }
            icon={CalendarCheck}
            accent="bg-brand-tint text-brand"
            footer={
              <RefreshProgressBar lastRefreshedAt={weeklyOptInsRefreshedAt} />
            }
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
              <Link href={withBasePath("/reports")} className="text-xs font-medium text-brand">
                View All
              </Link>
            </div>
            <div className="space-y-4 text-sm">
              {activityLoading ? (
                <p className="text-text-secondary">Loading activity…</p>
              ) : activity.length === 0 ? (
                <p className="text-text-secondary">No recent platform activity yet.</p>
              ) : (
                activity.map((item) => (
                  <Link
                    key={`${item.kind}-${item.entity_id}`}
                    href={activityHref(item)}
                    className="block rounded-lg border border-surface-border p-3 transition-colors hover:bg-surface-inset/40"
                  >
                    <p className={`font-semibold ${activityTone(item)}`}>
                      {activityTitle(item)}
                    </p>
                    <p className="mt-1 text-text-secondary">{activityDetail(item)}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">Quick Management</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <div
                key={action.label}
                className="rounded-card border border-surface-border bg-white p-5"
              >
                <p className="font-semibold text-brand-dark">{action.label}</p>
                <p className="mt-1 text-xs text-text-secondary">{action.description}</p>
                {"exportReports" in action && action.exportReports ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    disabled={exporting}
                    onClick={exportReports}
                  >
                    {exporting ? "Exporting…" : "Export CSV"}
                  </Button>
                ) : action.href ? (
                  <Link href={withBasePath(action.href)}>
                    <Button variant="outline" size="sm" className="mt-4">
                      Open
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" className="mt-4" disabled>
                    Open
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
