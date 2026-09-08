"use client";

import * as React from "react";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

function hasAnyPermission(perms: string[] | undefined | null, required: string[] | undefined) {
  if (!required?.length) return true;
  const set = new Set((perms ?? []).map(String));
  return required.some((p) => set.has(p));
}

export function LeaveShell({
  title,
  subtitle,
  pill,
  actions,
  children,
  requiredAnyPermissions,
}: {
  title: string;
  subtitle?: string;
  pill?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  requiredAnyPermissions?: string[];
}) {
  const membership = useAuthStore((s) => s.membership as any);
  const perms = (membership?.permissions ?? []) as string[];

  const allowed = hasAnyPermission(perms, requiredAnyPermissions);

  return (
    <TimeShell
      title={title}
      subtitle={subtitle}
      pill={pill ?? "Time & Leave • Leave"}
      actions={actions}
      // if you already gate via capabilities elsewhere, leave it empty:
      requiredAnyCapabilities={["portal.time"]}
    >
      {!allowed ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <EmptyState
              title="Access restricted"
              description="You don’t have permission to view this area."
            />
          </CardContent>
        </Card>
      ) : (
        children
      )}
    </TimeShell>
  );
}