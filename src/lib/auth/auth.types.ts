// src/lib/auth/auth.types.ts

export type AuthMembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";

export type AuthUser = {
  id: string;
  email: string;
  status?: string;
  isSiteAdmin?: boolean;
};

export type AuthTenant = {
  id: string;
  slug: string;
  name: string;
};

export type AuthEmployee = {
  id: string;
  employeeNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status?: string | null;
  employmentType?: string | null;
  profilePhotoFileId?: string | null;
};

export type AuthMembership = {
  id: string;
  tenantId: string;
  userId?: string;
  status: AuthMembershipStatus;
  isOwner: boolean;
  title?: string | null;
  roleKeys: string[];
  permissions: string[];
  capabilities: string[];
};

export type TenantSelectionResponse = {
  requiresTenantSelection: true;
  tenants: Array<{
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
  }>;
};

export type LoginInput = {
  email: string;
  password: string;
  tenantSlug?: string;
};

export type RegisterInput = {
  email: string;
  password: string;
};

export type SignupTenantInput = {
  tenantName: string;
  tenantSlug: string;
  ownerEmail: string;
  ownerPassword: string;
};

export type SignupTenantResponse = {
  tenant?: AuthTenant | null;
  verifyToken?: string;
};

export type VerifyEmailInput = {
  token: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type AcceptInviteInput = {
  token: string;
  password?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
};

export type AcceptInviteResponse = {
  ok: boolean;
  userId: string;
  membershipId: string;
  employeeId?: string | null;
  requiresEmailVerification?: boolean;
};

export type ResendVerifyEmailInput = {
  email: string;
};

export type ResendVerifyEmailWithPasswordInput = {
  email: string;
  password: string;
  tenantSlug?: string;
};

export type LoginOk = {
  accessToken: string;
  refreshToken?: string | null;
  user: AuthUser;
  tenant: AuthTenant | null;
  membership: AuthMembership | null;
  employee?: AuthEmployee | null;
};

export type LoginResponse = LoginOk | TenantSelectionResponse;

export type RefreshResponse =
  | {
      accessToken: string;
      refreshToken?: string | null;
    }
  | TenantSelectionResponse;

export type MeResponse = {
  userId?: string;
  email?: string;
  status?: string;
  isSiteAdmin?: boolean;
  tenant?: AuthTenant | null;
  membership?: Partial<AuthMembership> | null;
  membershipId?: string | null;
  employee?: AuthEmployee | null;
  user?: Partial<AuthUser> | null;
};
