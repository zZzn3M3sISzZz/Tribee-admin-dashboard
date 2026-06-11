export interface AuthResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface MeResponse {
  user: { id: string; status: string; verification_level: string };
  profile: { display_name: string; email?: string };
  roles: string[];
}

export interface IdentitySubmission {
  id: string;
  user_id: string;
  status: string;
  has_government_id: boolean;
  has_selfie: boolean;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface IdentityVerificationItem {
  submission: IdentitySubmission;
  display_name: string;
  user_verification_level: string;
}

export interface IdentityVerificationDetail extends IdentityVerificationItem {
  government_id_url?: string | null;
  selfie_url?: string | null;
  email?: string | null;
}

export interface SafetyReport {
  id: string;
  reported_user_id: string;
  reported_display_name: string;
  reporter_id: string;
  reporter_display_name: string;
  category: string;
  description: string | null;
  status: string;
  created_at: string;
}

export interface HostApplication {
  host_id: string;
  user_id: string;
  display_name: string;
  city_id: string;
  proposed_experience_title?: string | null;
  status: string;
  created_at: string;
  vouch_count: number;
}

export interface OverviewStats {
  total_members: number;
  active_hosts: number;
  open_safety_reports: number;
  pending_identity_verifications: number;
  pending_host_applications: number;
}

export interface GrowthPoint {
  label: string;
  members: number;
  hosts: number;
}

export interface GrowthStats {
  period_days: number;
  bucket: "day" | "week";
  points: GrowthPoint[];
}

export interface ActivityItem {
  kind: "identity_verification" | "safety_report" | "host_application";
  entity_id: string;
  display_name: string;
  status: string;
  category?: string | null;
  occurred_at: string;
}

export interface RepeatOffender {
  user_id: string;
  display_name: string;
  report_count: number;
}

export interface ReportCategoryCount {
  category: string;
  count: number;
}

export interface SafetyPulse {
  open_reports: number;
  investigating_reports: number;
  resolved_reports: number;
  total_reports: number;
  reports_last_7d: number;
  resolution_rate_percent: number;
  sla_target_percent: number;
}

export interface ModerationInsights {
  safety_pulse: SafetyPulse;
  repeat_offenders: RepeatOffender[];
  categories: ReportCategoryCount[];
}
