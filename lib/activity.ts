import { withBasePath } from "./base-path";
import type { ActivityItem } from "./types";
import { formatDate } from "./utils";

export function activityHref(item: ActivityItem): string {
  switch (item.kind) {
    case "identity_verification":
      return withBasePath("/user-approvals");
    case "host_application":
      return withBasePath("/host-applications");
    case "safety_report":
      return withBasePath("/reports");
    default:
      return withBasePath("/dashboard");
  }
}

export function activityTitle(item: ActivityItem): string {
  switch (item.kind) {
    case "identity_verification":
      return "Identity verification";
    case "host_application":
      return "Host application";
    case "safety_report":
      return item.category ? `${item.category} report` : "Safety report";
    default:
      return "Activity";
  }
}

export function activityDetail(item: ActivityItem): string {
  const when = formatDate(item.occurred_at);
  switch (item.kind) {
    case "identity_verification":
      return `${item.display_name} · ${item.status} · ${when}`;
    case "host_application":
      return `${item.display_name} · ${item.status} · ${when}`;
    case "safety_report":
      return `Against ${item.display_name} · ${item.status} · ${when}`;
    default:
      return when;
  }
}

export function activityTone(item: ActivityItem): string {
  if (item.kind === "safety_report" && item.status === "open") {
    return "text-red-600";
  }
  if (item.status === "pending" || item.status === "pending_review") {
    return "text-brand";
  }
  return "text-brand-dark";
}
