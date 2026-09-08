export type AnalyticsGroupBy = "day" | "week" | "month";

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type UserStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "SUSPENDED"
  | "DISABLED";

export type MembershipStatus =
  | "INVITED"
  | "ACTIVE"
  | "SUSPENDED"
  | "REMOVED";

export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export type ShowcaseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "LOGIN"
  | "LOGOUT"
  | "INVITE_SENT"
  | "INVITE_ACCEPTED"
  | "ROLE_GRANTED"
  | "ROLE_REVOKED"
  | "STATUS_CHANGED";

export interface SiteAdminAnalyticsDto {
  from?: string;
  to?: string;
  groupBy?: AnalyticsGroupBy;
}

export interface SiteAdminTenantListDto {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  status?: TenantStatus;
  q?: string;
}

export interface SiteAdminAuditListDto {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  action?: AuditAction;
  entityType?: string;
  tenantId?: string;
  actorUserId?: string;
  q?: string;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CountBucket {
  label: string;
  count: number;
}

export interface SiteAdminOverviewResponse {
  range: {
    from: string;
    to: string;
  };
  tenants: {
    total: number;
    active: number;
    suspended: number;
    deleted: number;
  };
  users: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    disabled: number;
  };
  memberships: {
    total: number;
    active: number;
    invited: number;
    suspended: number;
    removed: number;
  };
  employees: {
    total: number;
    active: number;
    onboarding: number;
    terminated: number;
  };
  invitations: {
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    revoked: number;
  };
  activity: {
    auditLogs: number;
  };
  showcases: {
    total: number;
    published: number;
  };
}

export interface SiteAdminGrowthResponse {
  groupBy: AnalyticsGroupBy;
  tenants: CountBucket[];
  users: CountBucket[];
  employees: CountBucket[];
  invitations: CountBucket[];
}

export interface TenantHealthCounts {
  memberships: number;
  employees: number;
  domains: number;
  projects: number;
  workItems: number;
  auditLogs: number;
}

export interface TenantHealthItem {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  timezone: string;
  locale: string;
  currency: string;
  _count: TenantHealthCounts;
  recentInvitations: number;
  recentAudits: number;
}

export interface SiteAdminTenantHealthResponse {
  items: TenantHealthItem[];
  meta: PageMeta;
}

export interface RecentAuditActivityItem {
  id: string;
  action: AuditAction | string;
  entityType: string;
  entityId?: string | null;
  tenantId?: string | null;
  actorUserId?: string | null;
  createdAt: string;
  route?: string | null;
  method?: string | null;
}

export interface RecentInvitationActivityItem {
  id: string;
  email: string;
  tenantId: string;
  status: InviteStatus;
  createdAt: string;
}

export interface RecentTenantActivityItem {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
}

export interface RecentUserActivityItem {
  id: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}

export interface SiteAdminRecentActivityResponse {
  audits: RecentAuditActivityItem[];
  invitations: RecentInvitationActivityItem[];
  tenants: RecentTenantActivityItem[];
  users: RecentUserActivityItem[];
}

export interface AuditTenantLite {
  id: string;
  name: string;
  slug: string;
}

export interface AuditActorUserLite {
  id: string;
  email: string;
}

export interface AuditActorMembershipLite {
  id: string;
  title?: string | null;
}

export interface SiteAdminAuditItem {
  id: string;
  tenantId?: string | null;
  actorUserId?: string | null;
  actorMembershipId?: string | null;
  action: AuditAction | string;
  entityType: string;
  entityId?: string | null;
  route?: string | null;
  method?: string | null;
  requestId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  diff?: unknown;
  createdAt: string;
  supportSessionId?: string | null;
  tenant?: AuditTenantLite | null;
  actorUser?: AuditActorUserLite | null;
  actorMembership?: AuditActorMembershipLite | null;
}

export interface SiteAdminAuditListResponse {
  items: SiteAdminAuditItem[];
  meta: PageMeta;
}