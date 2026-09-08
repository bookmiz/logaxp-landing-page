"use client";

import type {
  AuthEmployee,
  AuthMembership,
  AuthMembershipStatus,
  AuthTenant,
  AuthUser,
  MeResponse,
} from "@/logaxp/lib/auth/auth.types";

export type AuthIdentity = {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  membership: AuthMembership | null;
  employee: AuthEmployee | null;
};

function normalizeMembershipStatus(value: unknown): AuthMembershipStatus {
  const status = String(value ?? "ACTIVE").toUpperCase();
  return status === "INVITED" || status === "ACTIVE" || status === "SUSPENDED" || status === "REMOVED"
    ? (status as AuthMembershipStatus)
    : "ACTIVE";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function mapMeResponseToIdentity(data: MeResponse | null | undefined): AuthIdentity {
  const userShape = data?.user && typeof data.user === "object" ? data.user : null;
  const userId = nullableString(data?.userId) ?? nullableString(userShape?.id);
  const email = nullableString(data?.email) ?? nullableString(userShape?.email) ?? "";
  const status = nullableString(data?.status) ?? nullableString(userShape?.status) ?? "";

  const isSiteAdmin =
    typeof data?.isSiteAdmin === "boolean"
      ? data.isSiteAdmin
      : typeof userShape?.isSiteAdmin === "boolean"
      ? userShape.isSiteAdmin
      : false;

  const user: AuthUser | null = userId
    ? {
        id: userId,
        email,
        status,
        isSiteAdmin,
      }
    : null;

  const tenant =
    data?.tenant && typeof data.tenant === "object" && data.tenant.id
      ? {
          id: String(data.tenant.id),
          slug: String(data.tenant.slug ?? ""),
          name: String(data.tenant.name ?? ""),
        }
      : null;

  const membershipShape = data?.membership && typeof data.membership === "object" ? data.membership : null;
  const tenantId = nullableString(membershipShape?.tenantId) ?? tenant?.id ?? null;

  const membership =
    membershipShape?.id && tenantId
      ? {
          id: String(membershipShape.id),
          tenantId,
          userId: nullableString(membershipShape.userId) ?? userId ?? undefined,
          status: normalizeMembershipStatus(membershipShape.status),
          isOwner: Boolean(membershipShape.isOwner),
          title: nullableString(membershipShape.title),
          roleKeys: stringArray(membershipShape.roleKeys),
          permissions: stringArray(membershipShape.permissions),
          capabilities: stringArray(membershipShape.capabilities),
        }
      : data?.membershipId && tenantId
      ? {
          id: String(data.membershipId),
          tenantId,
          userId: userId ?? undefined,
          status: "ACTIVE" as AuthMembershipStatus,
          isOwner: false,
          title: null,
          roleKeys: [],
          permissions: [],
          capabilities: [],
        }
      : null;

  const employeeShape = data?.employee && typeof data.employee === "object" ? data.employee : null;
  const employee =
    employeeShape?.id
      ? {
          id: String(employeeShape.id),
          employeeNumber: nullableString(employeeShape.employeeNumber),
          firstName: nullableString(employeeShape.firstName),
          lastName: nullableString(employeeShape.lastName),
          status: nullableString(employeeShape.status),
          employmentType: nullableString(employeeShape.employmentType),
          profilePhotoFileId: nullableString(employeeShape.profilePhotoFileId),
        }
      : null;

  return { user, tenant, membership, employee };
}
