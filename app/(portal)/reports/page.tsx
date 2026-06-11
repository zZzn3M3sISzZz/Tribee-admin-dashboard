"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { downloadCsv } from "@/lib/export";
import { formatDate, initials } from "@/lib/utils";
import type { ModerationInsights, SafetyReport } from "@/lib/types";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "Investigating", value: "investigating" },
  { label: "Resolved", value: "resolved" },
] as const;

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles =
    normalized === "open"
      ? "bg-red-100 text-red-700"
      : normalized === "investigating"
        ? "bg-status-mint text-brand-dark"
        : "bg-surface-inset text-text-muted";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${styles}`}>
      {status}
    </span>
  );
}

export default function ReportsPage() {
  const [items, setItems] = useState<SafetyReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [insights, setInsights] = useState<ModerationInsights | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listSafetyReports({
        limit: 50,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  const loadInsights = useCallback(async () => {
    try {
      const res = await api.getModerationInsights();
      setInsights(res);
    } catch {
      setInsights(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const updateStatus = async (reportId: string, status: string) => {
    try {
      await api.updateSafetyReportStatus(reportId, status);
      toast.success(`Report marked ${status}`);
      load();
      loadInsights();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const exportLogs = async () => {
    try {
      const res = await api.listSafetyReports({
        limit: 100,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
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
    }
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      !q ||
      item.reported_display_name.toLowerCase().includes(q) ||
      item.reporter_display_name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  const pulse = insights?.safety_pulse;
  const slaProgress = pulse
    ? Math.min(100, (pulse.resolution_rate_percent / pulse.sla_target_percent) * 100)
    : 0;

  return (
    <>
      <Header
        placeholder="Search reports, users or IDs..."
        value={search}
        onChange={setSearch}
      />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Safety &amp; Moderation Hub</h1>
            <p className="mt-2 text-text-secondary">
              Review and manage reported incidents across the offScreen community.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.message("Manual flagging is handled in-app by members and hosts.")
              }
            >
              <Flag className="h-4 w-4" />
              Manual Flag
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-card border border-surface-border bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b border-surface-border px-6 py-4 text-sm">
              <span className="font-semibold uppercase tracking-wider text-text-secondary">
                Status:
              </span>
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full px-3 py-1 ${
                    statusFilter === filter.value
                      ? "bg-brand-tint text-brand"
                      : "bg-surface-inset text-text-muted"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              {insights?.categories.length ? (
                <>
                  <span className="font-semibold uppercase tracking-wider text-text-secondary">
                    Category:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("")}
                    className={`rounded-full px-3 py-1 ${
                      !categoryFilter
                        ? "bg-brand-tint text-brand"
                        : "bg-surface-inset text-text-muted"
                    }`}
                  >
                    All
                  </button>
                  {insights.categories.map((cat) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setCategoryFilter(cat.category)}
                      className={`rounded-full px-3 py-1 ${
                        categoryFilter === cat.category
                          ? "bg-brand-tint text-brand"
                          : "bg-surface-inset text-text-muted"
                      }`}
                    >
                      {cat.category} ({cat.count})
                    </button>
                  ))}
                </>
              ) : null}
            </div>

            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-border text-xs uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="px-6 py-4">Reported User</th>
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-text-secondary">
                      No safety reports found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-surface-border last:border-0 hover:bg-surface-inset/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                            {initials(item.reported_display_name)}
                          </div>
                          <span className="font-medium">{item.reported_display_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        @{item.reporter_display_name.replace(/\s+/g, "_")}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{item.category}</td>
                      <td className="px-6 py-4 text-text-secondary">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        {item.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(item.id, "investigating")}
                          >
                            Investigate
                          </Button>
                        )}
                        {item.status === "investigating" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(item.id, "resolved")}
                          >
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="border-t border-surface-border px-6 py-4 text-xs text-text-secondary">
              Showing {filtered.length} of {total} reports
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-card border border-surface-border bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-brand-dark">Repeat Offenders</h2>
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  CRITICAL
                </span>
              </div>
              {insights?.repeat_offenders.length ? (
                <div className="space-y-3">
                  {insights.repeat_offenders.map((offender) => (
                    <div
                      key={offender.user_id}
                      className="rounded-lg border border-surface-border p-3"
                    >
                      <p className="font-medium text-brand-dark">{offender.display_name}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {offender.report_count} reports filed
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  No users with multiple reports yet.
                </p>
              )}
            </div>
            <div className="rounded-card bg-brand p-5 text-white">
              <h2 className="font-semibold">Safety Pulse</h2>
              <p className="mt-2 text-sm text-white/80">
                {pulse
                  ? `${pulse.open_reports} open · ${pulse.investigating_reports} investigating · ${pulse.reports_last_7d} new this week`
                  : "Loading moderation metrics…"}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-status-mint transition-all"
                  style={{ width: `${slaProgress}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-white/60">
                Resolution rate: {pulse?.resolution_rate_percent ?? 0}% · Target:{" "}
                {pulse?.sla_target_percent ?? 90}%
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
