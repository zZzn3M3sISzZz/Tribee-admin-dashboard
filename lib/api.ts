import { withBasePath } from "./base-path";
import type {
  ActivityItem,
  GrowthStats,
  HostApplication,
  IdentityVerificationDetail,
  IdentityVerificationItem,
  ModerationInsights,
  OverviewStats,
  SafetyReport,
} from "./types";

async function tribeeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(withBasePath(`/api/tribee${path}`), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getOverview: () => tribeeFetch<OverviewStats>("/admin/overview"),

  getGrowth: (days: 7 | 30 | 90) =>
    tribeeFetch<GrowthStats>(`/admin/growth?days=${days}`),

  getActivity: (limit = 10) =>
    tribeeFetch<{ items: ActivityItem[] }>(`/admin/activity?limit=${limit}`),

  getModerationInsights: () =>
    tribeeFetch<ModerationInsights>("/admin/moderation-insights"),

  listIdentityVerifications: (params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString();
    return tribeeFetch<{ items: IdentityVerificationItem[] }>(
      `/admin/identity-verifications${query ? `?${query}` : ""}`
    );
  },

  getIdentityVerification: (submissionId: string) =>
    tribeeFetch<IdentityVerificationDetail>(
      `/admin/identity-verifications/${submissionId}`
    ),

  approveIdentity: (submissionId: string) =>
    tribeeFetch(`/admin/identity-verifications/${submissionId}/approve`, {
      method: "POST",
    }),

  rejectIdentity: (submissionId: string, reason: string) =>
    tribeeFetch(`/admin/identity-verifications/${submissionId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  listSafetyReports: (params?: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.category) qs.set("category", params.category);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    const query = qs.toString();
    return tribeeFetch<{ items: SafetyReport[]; total: number }>(
      `/admin/safety-reports${query ? `?${query}` : ""}`
    );
  },

  updateSafetyReportStatus: (reportId: string, status: string) =>
    tribeeFetch(`/admin/safety-reports/${reportId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  listHostApplications: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    const query = qs.toString();
    return tribeeFetch<{ items: HostApplication[] }>(
      `/admin/host-applications${query ? `?${query}` : ""}`
    );
  },

  approveHost: (hostId: string) =>
    tribeeFetch(`/admin/host-applications/${hostId}/approve`, { method: "POST" }),

  rejectHost: (hostId: string, reason?: string) =>
    tribeeFetch(`/admin/host-applications/${hostId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
