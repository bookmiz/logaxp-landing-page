"use client";

import type { AuthMembership } from "@/logaxp/lib/auth/auth.types";
import { getRoleKeys } from "@/logaxp/lib/auth/portalAuthz";

export type TimeScopeDefault = "workspace" | "me";

export function defaultTimeScope(m: AuthMembership | null | undefined): TimeScopeDefault {
  if (!m) return "workspace";

  // Owners + tenant admins see "workspace" by default
  if ((m as any)?.isOwner) return "workspace";
  const roles = getRoleKeys(m);

  if (roles.includes("tenant.admin") || roles.includes("hr.manager") || roles.includes("project.manager")) {
    return "workspace";
  }

  // Everyone else defaults to "me" (safer + less noisy)
  return "me";
}