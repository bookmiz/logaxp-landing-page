"use client";

import * as React from "react";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { hasAnyCapability } from "@/logaxp/lib/auth/portalAuthz";

export type TimeGuardResult =
  | { state: "loading"; allowed: false; reason?: string }
  | { state: "blocked"; allowed: false; reason: string }
  | { state: "allowed"; allowed: true };

const DEFAULT_CAPS = ["portal.time"] as const;

export function useTimeGuard(
  requiredAnyCapabilities: readonly string[] = DEFAULT_CAPS
): TimeGuardResult {
  // ✅ NO object selector → no getSnapshot caching warning
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const membership = useAuthStore((s) => s.membership);

  // ✅ avoid deps on array identity (TimeShell passes array literals)
  const caps = requiredAnyCapabilities;

  return React.useMemo(() => {
    if (!isHydrated) return { state: "loading", allowed: false };

    if (!membership) {
      return {
        state: "blocked",
        allowed: false,
        reason: "No workspace selected. Choose a workspace to access Time & Attendance.",
      };
    }

    const ok = hasAnyCapability(membership, caps);
    if (!ok) {
      return {
        state: "blocked",
        allowed: false,
        reason: "You don’t have access to Time & Attendance for this workspace.",
      };
    }

    return { state: "allowed", allowed: true };
  }, [isHydrated, membership, caps]);
}
