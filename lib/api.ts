import { withBasePath } from "./base-path";
import type {
  ActivityItem,
  AddEventParticipantsResponse,
  AdminEventImageSuggestion,
  AdminEventListItem,
  AdminUserSearchResult,
  AdminVenueListItem,
  CatalogItem,
  CreateAdminEventResponse,
  CreateVenueResponse,
  GrowthStats,
  HostApplication,
  IdentityVerificationDetail,
  IdentityVerificationItem,
  ModerationInsights,
  OverviewStats,
  SafetyInboxMessage,
  SafetyInboxThread,
  SafetyReport,
  TaxonomyKind,
  WeeklyMatchingSchedulerStatus,
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
    priority?: string;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.category) qs.set("category", params.category);
    if (params?.priority) qs.set("priority", params.priority);
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

  escalateSafetyReport: (
    reportId: string,
    body?: { ncmec_reported?: boolean; notes?: string },
  ) =>
    tribeeFetch(`/admin/safety-reports/${reportId}/escalate`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),

  suspendUser: (
    userId: string,
    body?: { report_id?: string; notes?: string },
  ) =>
    tribeeFetch(`/admin/users/${userId}/suspend`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),

  banUser: (userId: string, body?: { report_id?: string; notes?: string }) =>
    tribeeFetch(`/admin/users/${userId}/ban`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),

  listSafetyInbox: () =>
    tribeeFetch<{ items: SafetyInboxThread[] }>("/admin/safety-inbox"),

  getSafetyInboxThread: (threadId: string) =>
    tribeeFetch<SafetyInboxThread>(`/admin/safety-inbox/${threadId}`),

  listSafetyInboxMessages: (
    threadId: string,
    params?: { limit?: number; before?: string },
  ) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.before) qs.set("before", params.before);
    const query = qs.toString();
    return tribeeFetch<{ messages: SafetyInboxMessage[]; has_more: boolean }>(
      `/admin/safety-inbox/${threadId}/messages${query ? `?${query}` : ""}`,
    );
  },

  replySafetyInbox: (threadId: string, body: string) =>
    tribeeFetch<SafetyInboxMessage>(`/admin/safety-inbox/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),

  markSafetyInboxRead: (threadId: string) =>
    tribeeFetch(`/admin/safety-inbox/${threadId}/read`, { method: "POST" }),

  exportSafetyReport: (reportId: string) =>
    tribeeFetch<Record<string, unknown>>(`/admin/safety-reports/${reportId}/export`),

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

  listCatalog: (kind: TaxonomyKind) => {
    const path =
      kind === "interest"
        ? "/admin/catalog/interests"
        : kind === "comfort"
          ? "/admin/catalog/comfort-prefs"
          : "/admin/catalog/social-intents";
    return tribeeFetch<{ items: CatalogItem[] }>(path);
  },

  createCatalogItem: (
    kind: TaxonomyKind,
    body: { id: string; label: string; subtitle?: string; sort_order?: number }
  ) => {
    const path =
      kind === "interest"
        ? "/admin/catalog/interests"
        : kind === "comfort"
          ? "/admin/catalog/comfort-prefs"
          : "/admin/catalog/social-intents";
    return tribeeFetch<{ id: string; label: string }>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  createVenue: async (metadata: Record<string, unknown>, images: File[]) => {
    const form = new FormData();
    form.append("metadata", JSON.stringify(metadata));
    for (const image of images) {
      form.append("images", image, image.name);
    }
    const res = await fetch(withBasePath("/api/tribee/admin/venues"), {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<CreateVenueResponse>;
  },

  listAdminVenues: (limit = 100) =>
    tribeeFetch<{ items: AdminVenueListItem[]; total: number }>(
      `/admin/venues?limit=${limit}`
    ),

  getAdminVenue: (venueId: string) =>
    tribeeFetch<AdminVenueListItem>(`/admin/venues/${venueId}`),

  updateVenue: async (
    venueId: string,
    metadata: Record<string, unknown>,
    images?: File[]
  ) => {
    const form = new FormData();
    form.append("metadata", JSON.stringify(metadata));
    if (images) {
      for (const image of images) {
        form.append("images", image, image.name);
      }
    }
    const res = await fetch(withBasePath(`/api/tribee/admin/venues/${venueId}`), {
      method: "PATCH",
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<AdminVenueListItem>;
  },

  searchAdminUsers: (query: string) => {
    const qs = new URLSearchParams({ q: query });
    return tribeeFetch<{ items: AdminUserSearchResult[] }>(
      `/admin/users/search?${qs}`
    );
  },

  listAdminEvents: (limit = 50) =>
    tribeeFetch<{ items: AdminEventListItem[] }>(`/admin/events?limit=${limit}`),

  getAdminEventImageSuggestion: (experienceType: string, citySlug: string) => {
    const qs = new URLSearchParams({
      experience_type: experienceType,
      city_slug: citySlug,
    });
    return tribeeFetch<AdminEventImageSuggestion>(
      `/admin/events/image-suggestion?${qs}`
    );
  },

  createAdminEvent: async (
    metadata: {
      city_slug: string;
      experience_type?: string;
      scheduled_at: string;
      initial_state?: "confirmed" | "pending_confirmation";
      participant_user_ids?: string[];
      title?: string;
      subtitle?: string;
      venue_label?: string;
      source_image_catalog_id?: string;
    },
    image?: File | null
  ) => {
    const form = new FormData();
    form.append("metadata", JSON.stringify(metadata));
    if (image) {
      form.append("image", image, image.name);
    }
    const res = await fetch(withBasePath("/api/tribee/admin/events"), {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<CreateAdminEventResponse>;
  },

  addEventParticipants: (eventId: string, userIds: string[]) =>
    tribeeFetch<AddEventParticipantsResponse>(
      `/admin/events/${eventId}/participants`,
      {
        method: "POST",
        body: JSON.stringify({ user_ids: userIds }),
      }
    ),

  cancelAdminEvent: (eventId: string) =>
    tribeeFetch<{ event_id: string; state: string }>(
      `/admin/events/${eventId}/cancel`,
      { method: "POST" }
    ),

  getWeeklyMatchingScheduler: () =>
    tribeeFetch<WeeklyMatchingSchedulerStatus>("/admin/matching/scheduler"),

  setWeeklyMatchingScheduler: (enabled: boolean) =>
    tribeeFetch<WeeklyMatchingSchedulerStatus>("/admin/matching/scheduler", {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }),

  triggerWeeklyMatchingScheduler: () =>
    tribeeFetch<{ status: string; week: string }>("/admin/matching/scheduler/run", {
      method: "POST",
    }),
};
