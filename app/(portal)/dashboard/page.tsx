"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  Download,
  Home,
  TrendingUp,
  Users,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
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
    icon: Users,
  },
  {
    label: "Host Applications",
    description: "Approve or reject host requests",
    href: "/host-applications",
    icon: Home,
  },
  {
    label: "Safety & Compliance",
    description: "Triage open safety reports",
    href: "/reports",
    icon: AlertTriangle,
  },
  {
    label: "Export Reports",
    description: "Download safety report CSV",
    href: null,
    icon: Download,
    exportReports: true,
  },
] as const;

const CHART_COLORS = {
  members: "#1b4332",
  hosts: "#d97706",
  grid: "#e2e8f0",
  axis: "#64748b",
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accentClass,
  footer,
  urgent,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ElementType;
  accentClass?: string;
  footer?: React.ReactNode;
  urgent?: boolean;
}) {
  return (
    <Card className={cn("animate-slide-up p-4", urgent && "border-red-200 bg-red-50/40")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
          <p className="admin-stat-value mt-1.5">{value}</p>
          <p className="mt-1 text-[11px] text-text-secondary">{hint}</p>
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            accentClass ?? "bg-brand-tint text-brand"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 shadow-card">
      <p className="mb-1.5 font-mono text-xs text-text-muted">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-text-primary">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          <span className="font-mono font-semibold">{entry.value}</span>
        </p>
      ))}
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

  const openReports = stats?.open_safety_reports ?? 0;

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
      <Header
        title="Overview"
        subtitle="Real-time platform health monitoring"
      />
      <main className="flex-1 overflow-auto px-6 py-6">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
            accentClass="bg-accent-muted text-accent-foreground"
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
            footer={
              <RefreshProgressBar lastRefreshedAt={weeklyOptInsRefreshedAt} />
            }
          />
          <StatCard
            label="Safety Issues"
            value={String(openReports).padStart(2, "0")}
            hint="Open safety reports"
            icon={AlertTriangle}
            accentClass="bg-red-50 text-red-600"
            urgent={openReports > 0}
          />
          <StatCard
            label="Pending Tasks"
            value={pendingTasks}
            hint={`${stats?.pending_identity_verifications ?? 0} identity · ${stats?.pending_host_applications ?? 0} hosts`}
            icon={ClipboardList}
            accentClass="bg-surface-inset text-text-muted"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="animate-slide-up xl:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                <CardTitle>Growth Over Time</CardTitle>
              </div>
              <div className="flex gap-1">
                {GROWTH_PERIODS.map(({ label, days }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setGrowthPeriod(days)}
                    className={cn(
                      "cursor-pointer rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors duration-200",
                      growthPeriod === days
                        ? "bg-brand text-white"
                        : "bg-surface-inset text-text-muted hover:text-text-secondary"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-56">
                {growthLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-brand/10" />
                  </div>
                ) : growthData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-text-muted">
                    No growth data for this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={growthData} barGap={2} barCategoryGap="20%">
                      <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                      <Bar
                        dataKey="members"
                        name="New members"
                        fill={CHART_COLORS.members}
                        radius={[3, 3, 0, 0]}
                      />
                      <Bar
                        dataKey="hosts"
                        name="New hosts"
                        fill={CHART_COLORS.hosts}
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-brand" />
                  New members
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-accent" />
                  New hosts
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up">
            <CardHeader className="pb-3">
              <CardTitle>Recent Activity</CardTitle>
              <Link
                href={withBasePath("/reports")}
                className="flex cursor-pointer items-center gap-0.5 text-[11px] font-medium text-brand transition-colors hover:text-brand-muted"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {activityLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-inset" />
                    ))}
                  </div>
                ) : activity.length === 0 ? (
                  <p className="py-8 text-center text-sm text-text-muted">
                    No recent platform activity yet.
                  </p>
                ) : (
                  activity.map((item) => (
                    <Link
                      key={`${item.kind}-${item.entity_id}`}
                      href={activityHref(item)}
                      className="block cursor-pointer rounded-lg border border-surface-border bg-surface-inset/50 px-3 py-2.5 transition-colors duration-200 hover:border-brand/20 hover:bg-surface-inset"
                    >
                      <p className={cn("text-xs font-semibold", activityTone(item))}>
                        {activityTitle(item)}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-text-secondary">
                        {activityDetail(item)}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="mt-6">
          <p className="admin-section-title mb-3">Quick Management</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.label}
                  className="group cursor-pointer p-4 transition-colors duration-200 hover:border-brand/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-inset text-text-muted transition-colors group-hover:bg-brand-tint group-hover:text-brand">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-text-primary">{action.label}</p>
                  <p className="mt-0.5 text-[11px] text-text-muted">{action.description}</p>
                  {"exportReports" in action && action.exportReports ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      disabled={exporting}
                      onClick={exportReports}
                    >
                      {exporting ? "Exporting…" : "Export CSV"}
                    </Button>
                  ) : action.href ? (
                    <Link href={withBasePath(action.href)} className="mt-3 block">
                      <Button variant="outline" size="sm" className="w-full">
                        Open
                      </Button>
                    </Link>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
