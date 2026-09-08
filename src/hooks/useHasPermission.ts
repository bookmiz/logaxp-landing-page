// src/hooks/useHasPermission.ts
"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { getPermissions, getRoleKeys } from "@/logaxp/lib/auth/portalAuthz";

function isSiteAdminSession(tenant: any, membership: any, user: any) {
  if (!tenant && !membership) return true;
  if (user?.isSiteAdmin === true) return true;
  if (user?.role === "SITE_ADMIN") return true;
  if (Array.isArray(user?.roles) && user.roles.includes("SITE_ADMIN")) return true;
  return false;
}

export function useHasPermission(required?: string | string[]) {
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);
  const membership = useAuthStore((s) => s.membership);

  return useMemo(() => {
    if (!required) return true;

    if (isSiteAdminSession(tenant, membership, user)) return true;

    // ✅ owner always allowed
    if ((membership as any)?.isOwner) return true;

    // ✅ tenant.admin / tenant.owner can be treated as full access
    const roleKeys = getRoleKeys(membership);
    if (roleKeys.includes("tenant.admin") || roleKeys.includes("tenant.owner")) return true;

    const perms = getPermissions(membership);
    if (!perms.length) return false;

    const needed = Array.isArray(required) ? required : [required];
    return needed.every((k) => perms.includes(k));
  }, [required, tenant, membership, user]);
}