// src/lib/tenants/tenant.types.ts

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type TenantDomain = {
  id: string;
  tenantId: string;
  domain: string;
  isPrimary: boolean;
  verifiedAt: string | null;
  createdAt: string;
};

export type TenantSettings = {
  id: string;
  tenantId: string;

  enforceMfa: boolean;
  allowPasswordAuth: boolean;
  requireEmailVerify: boolean;

  passwordPolicy: Record<string, unknown> | null;
  featureFlags: Record<string, unknown> | null;
  branding: Record<string, unknown> | null;
  retentionPolicy: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;

  timezone: string;
  locale: string;
  currency: string;

  planKey?: string | null;
  metadata?: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  settings?: TenantSettings | null;
  domains?: TenantDomain[];
};

export type MembershipUser = {
  id: string;
  email: string;
  status: string;
};

export type Role = {
  id: string;
  tenantId: string;
  key: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
};

export type MembershipRoleRow = {
  id: string;
  roleId: string;
  assignedAt: string;
  role: Role;
};

export type Membership = {
  id: string;
  tenantId: string;
  userId: string;
  status: "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
  title?: string | null;

  isOwner: boolean;
  joinedAt?: string | null;
  invitedAt?: string | null;

  createdAt: string;
  updatedAt: string;

  user?: MembershipUser;
  roles?: MembershipRoleRow[];
};

export type Permission = {
  id: string;
  key: string;
  name: string;
  group?: string | null;
  description?: string | null;
  createdAt: string;
};

// -----------------------------
// Request DTO shapes (FE side)
// -----------------------------
export type CreateTenantInput = {
  name: string;
  slug: string;
  timezone?: string;
  locale?: string;
  currency?: string;
};

export type UpdateTenantInput = {
  name?: string;
  timezone?: string;
  locale?: string;
  currency?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateTenantSettingsInput = Partial<Pick<
  TenantSettings,
  | "enforceMfa"
  | "allowPasswordAuth"
  | "requireEmailVerify"
  | "passwordPolicy"
  | "featureFlags"
  | "branding"
  | "retentionPolicy"
>>;

export type AddTenantDomainInput = {
  domain: string;
  isPrimary?: boolean;
};

export type InviteMemberInput = {
  email: string;

  // optional convenience fields (your UI already uses these)
  title?: string;
  roleIds?: string[];

  // flexible payload for backend extensions
  payload?: Record<string, unknown>; // ex: { roles: ["tenant.admin"], employeeId: "..." }
};

// -----------------------------
// Shared list/pagination helpers
// -----------------------------
export type SortDirection = "asc" | "desc";

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
};

// -----------------------------
// Invitations
// -----------------------------
export type TenantInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REVOKED"
  | "EXPIRED"
  | "CANCELLED"
  | string;

export type InvitationInviterUser = {
  id: string;
  email: string;
  status?: string;
};

export type TenantInvitation = {
  id: string;
  tenantId: string;
  email: string;
  status: TenantInvitationStatus;

  tokenExpiresAt?: string | null;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  lastSentAt?: string | null;
  resendCount?: number | null;

  payload?: Record<string, unknown> | null;

  invitedByUserId?: string | null;
  invitedByUser?: InvitationInviterUser | null;

  createdAt: string;
  updatedAt: string;
};

export type TenantInvitationActionResponse = {
  ok?: boolean;
  message?: string;
  invitationId?: string;
  invitation?: TenantInvitation;
};

// -----------------------------
// List query DTOs (FE-side)
// -----------------------------
export type ListInvitationsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TenantInvitationStatus;
  sortBy?: "email" | "status" | "createdAt" | "updatedAt" | "tokenExpiresAt";
  sortDir?: SortDirection;
};

export type ListDomainsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  verified?: boolean;
  isPrimary?: boolean;
  sortBy?: "domain" | "isPrimary" | "verifiedAt" | "createdAt";
  sortDir?: SortDirection;
};

// ---------------------------------
// Create member (direct membership creation)
// ---------------------------------
export type CreateTenantMemberInput = {
  // one of these can be used depending on backend implementation
  userId?: string;
  email?: string;

  title?: string | null;
  roleIds?: string[];

  // extra data you may want to pass through
  payload?: Record<string, unknown>;
};

export type CreateTenantMemberResult = Membership;

// ---------------------------------
// Upload members (CSV/XLSX import)
// ---------------------------------
export type UploadTenantMembersInput = {
  file: File;
  dryRun?: boolean;
  sendInvites?: boolean;
  defaultRoleIds?: string[];
};

export type UploadTenantMembersResult = {
  ok?: boolean;
  message?: string;

  totalRows?: number;
  createdCount?: number;
  invitedCount?: number;
  skippedCount?: number;
  failedCount?: number;

  items?: Membership[];

  errors?: Array<{
    row?: number;
    email?: string;
    message: string;
  }>;
};