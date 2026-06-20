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
  reported_user_id: string | null;
  reported_display_name: string;
  reporter_id: string;
  reporter_display_name: string;
  category: string;
  description: string | null;
  status: string;
  priority: string;
  escalated_at: string | null;
  ncmec_reported_at: string | null;
  created_at: string;
}

export interface SafetyInboxThread {
  thread_id: string;
  member_id: string;
  member_display_name: string;
  last_message_body: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface SafetyInboxMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  image_url: string | null;
  created_at: string;
  is_safety_team: boolean;
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

export type TaxonomyKind = "interest" | "comfort" | "motive";

export interface CatalogItem {
  id: string;
  label: string;
  subtitle?: string | null;
  sort_order: number;
  user_count: number;
}

export interface CreateVenueResponse {
  venue_id: string;
  name: string;
  image_count: number;
  image_urls: string[];
}

export interface AdminVenueListItem {
  venue_id: string;
  name: string;
  city_id: string;
  city_slug: string | null;
  budget_tier: string;
  max_tables: number;
  typical_spend_per_head_inr: number;
  description: string | null;
  address: string | null;
  venue_type: string | null;
  image_count: number;
  primary_image_url: string | null;
  image_urls?: string[];
  created_at: string;
}

export interface AdminUserSearchResult {
  user_id: string;
  display_name: string;
  verification_level: string;
  status: string;
  avatar_url: string | null;
  matched_by: "email" | "name" | string;
}

export interface AdminEventListItem {
  event_id: string;
  experience_type: string;
  title?: string | null;
  image_url?: string | null;
  state: string;
  scheduled_at: string;
  participant_count: number;
  source?: "manual" | "auto_matched" | "venue_public" | string;
  matching_week?: string | null;
  city_id?: string | null;
  series_id?: string | null;
  schedule_kind?: "single" | "recurring" | string | null;
  venue_label?: string | null;
}

export interface AdminEventDetail {
  event_id: string;
  catalog_id?: string | null;
  experience_type: string;
  title?: string | null;
  subtitle?: string | null;
  state: string;
  scheduled_at: string;
  capacity?: number | null;
  venue_id?: string | null;
  venue_label?: string | null;
  city_slug?: string | null;
  source: string;
  is_venue_public: boolean;
  series_id?: string | null;
  participant_count: number;
  price_label?: string | null;
}

export interface AdminEventImageSuggestion {
  catalog_id: string | null;
  title: string;
  subtitle: string;
  image_url: string | null;
  has_image: boolean;
}

export interface CreateAdminEventResponse {
  event_id: string;
  catalog_id: string;
  group_id: string;
  title: string;
  image_url: string | null;
  state: string;
  scheduled_at: string;
  participant_count: number;
}

export interface CreateVenuePublicProgramResponse {
  series_id: string;
  schedule_kind: "single" | "recurring" | string;
  occurrence_count: number;
  first_scheduled_at: string;
  catalog_ids: string[];
}

export interface AddEventParticipantsResponse {
  event_id: string;
  added: string[];
  skipped: string[];
  participant_count: number;
}

export interface AdminEventParticipant {
  user_id: string;
  display_name: string;
  verification_level: string;
  avatar_url: string | null;
  attendance_status: string;
  user_confirmed: boolean;
}

export interface RemoveEventParticipantResponse {
  event_id: string;
  user_id: string;
  participant_count: number;
}

export interface WeeklyMatchingSchedulerStatus {
  enabled: boolean;
  schedule_label: string;
  updated_at?: string | null;
}
