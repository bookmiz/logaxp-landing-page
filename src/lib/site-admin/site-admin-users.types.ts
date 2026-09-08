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

export type TokenKind =
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET"
  | "MAGIC_LINK";

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

export type SortOrder = "asc" | "desc";
export type UserSortBy =
  | "createdAt"
  | "email"
  | "status"
  | "lastLoginAt"
  | "updatedAt";

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserProfileLite {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  timezone?: string | null;
  locale?: string | null;
  avatarFileId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantLite {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone?: string;
  locale?: string;
  currency?: string;
}

export interface RoleLite {
  id: string;
  key: string;
  name: string;
}

export interface MembershipRoleLite {
  id: string;
  assignedAt?: string;
  assignedByUserId?: string | null;
  role: RoleLite;
}

export interface EmployeeLite {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  workEmail?: string | null;
  personalEmail?: string | null;
  accessStatus?: string | null;
}

export interface MembershipLite {
  id: string;
  tenantId: string;
  userId: string;
  status: MembershipStatus;
  title?: string | null;
  isOwner?: boolean;
  joinedAt?: string | null;
  invitedAt?: string | null;
  invitedByUserId?: string | null;
  lastSeenAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tenant?: TenantLite;
  roles?: MembershipRoleLite[];
  employee?: EmployeeLite | null;
}

export interface RefreshTokenLite {
  id: string;
  userId?: string;
  familyId?: string;
  tokenHash?: string;
  tenantId?: string | null;
  membershipId?: string | null;
  issuedAt: string;
  expiresAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  replacedById?: string | null;
  isActive?: boolean;
}

export interface VerificationTokenLite {
  id: string;
  userId: string;
  kind: TokenKind;
  tokenHash?: string;
  expiresAt: string;
  consumedAt?: string | null;
  createdAt: string;
  isActive?: boolean;
}

export interface UserSecurityEventLite {
  id: string;
  userId: string;
  type: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogLite {
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
}

export interface SupportSessionLite {
  id: string;
  tenantId: string;
  actorUserId: string;
  reason?: string | null;
  startedAt: string;
  expiresAt: string;
  endedAt?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface UserCountSummary {
  memberships: number;
  refreshTokens: number;
  tokens: number;
  securityEvents: number;
  auditLogs?: number;
}

export interface SiteAdminUserListItem {
  id: string;
  email: string;
  emailNormalized: string;
  phone?: string | null;
  status: UserStatus;
  authProvider: string;
  isSiteAdmin: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  profile?: UserProfileLite | null;
  memberships?: MembershipLite[];
  refreshTokens?: Array<{ id: string }>;
  _count: UserCountSummary;
  activeSessionsCount: number;
}

export interface SiteAdminUserDetails {
  id: string;
  email: string;
  emailNormalized: string;
  phone?: string | null;
  status: UserStatus;
  authProvider: string;
  isSiteAdmin: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  profile?: UserProfileLite | null;
  memberships: MembershipLite[];
  refreshTokens: RefreshTokenLite[];
  _count: UserCountSummary;
  activeSessionsCount: number;
}

export interface SiteAdminListUsersDto {
  q?: string;
  status?: UserStatus;
  isSiteAdmin?: boolean;
  includeDeleted?: boolean;
  tenantId?: string;
  membershipStatus?: MembershipStatus;
  loggedInOnly?: boolean;
  sortBy?: UserSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface SiteAdminLoggedInUsersDto {
  q?: string;
  tenantId?: string;
  page?: number;
  pageSize?: number;
}

export interface SiteAdminUserSessionsDto {
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SiteAdminUserSecurityDto {
  limit?: number;
}

export interface SiteAdminListVerificationTokensDto {
  kind?: TokenKind;
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ResolvePasswordIssueDto {
  revokeAllSessions?: boolean;
  clearPasswordResetTokens?: boolean;
  issueNewPasswordResetToken?: boolean;
  markEmailVerified?: boolean;
  activateUser?: boolean;
  reason?: string;
}

export interface IssuePasswordResetDto {
  ttlMinutes?: number;
}

export interface UpdateUserStatusDto {
  reason?: string;
}

export interface RevokeSessionDto {
  reason?: string;
}

export interface PaginatedUsersResponse {
  items: SiteAdminUserListItem[];
  meta: PageMeta;
}

export interface PaginatedSessionsResponse {
  items: RefreshTokenLite[];
  meta: PageMeta;
}

export interface PaginatedVerificationTokensResponse {
  items: VerificationTokenLite[];
  meta: PageMeta;
}

export interface UserSecurityResponse {
  securityEvents: UserSecurityEventLite[];
  recentAuditLogs: AuditLogLite[];
  supportSessions: SupportSessionLite[];
}

export interface RevokeAllSessionsResponse {
  userId: string;
  revokedSessions: number;
}

export interface RevokeSingleSessionResponse {
  sessionId: string;
  revoked: boolean;
  message?: string;
}

export interface IssuePasswordResetResponse {
  userId: string;
  email: string;
  verificationTokenId: string;
  expiresAt: string;
  resetToken?: string;
  message: string;
}

export interface ResolvePasswordIssueResponse {
  userId: string;
  actions: string[];
  revokedSessions?: number;
  clearedPasswordResetTokens?: number;
  passwordReset?: IssuePasswordResetResponse;
}