// src/hooks/useHasCapability.ts
"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { hasAnyCapability } from "@/logaxp/lib/auth/portalAuthz";

function isSiteAdminSession(tenant: any, membership: any, user: any) {
  if (!tenant && !membership) return true;
  if (user?.isSiteAdmin === true) return true;
  if (user?.role === "SITE_ADMIN") return true;
  if (Array.isArray(user?.roles) && user.roles.includes("SITE_ADMIN")) return true;
  return false;
}

export function useHasCapability(required?: string | string[]) {
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);
  const membership = useAuthStore((s) => s.membership);

  return useMemo(() => {
    if (!required) return true;
    if (isSiteAdminSession(tenant, membership, user)) return true;

    const list = Array.isArray(required) ? required : [required];
    return hasAnyCapability(membership, list);
  }, [required, tenant, membership, user]);
}