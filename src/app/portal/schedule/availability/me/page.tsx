"use client";

import * as React from "react";
import { RefreshCcw, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Badge } from "@/logaxp/components/ui/badge";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

import { useAvailability } from "@/logaxp/hooks/scheduling/useAvailability";
import { useCreateAvailabilityRule } from "@/logaxp/hooks/scheduling/useAvailabilityMutations";
import type { AvailabilityRule } from "@/logaxp/lib/scheduling/availability.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PortalMyAvailabilityPage() {
  const qc = useQueryClient();
  const employeeId = useAuthStore((s) => s.employee?.id ?? null);

  const listQ = useAvailability(
    { employeeId: employeeId ?? undefined, includeInactive: false, page: 1, pageSize: 200 },
    Boolean(employeeId)
  );

  const createM = useCreateAvailabilityRule();
  const busy = listQ.isFetching || createM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["schedule", "availability"] as any });
  };

  const items = (listQ.data?.data?.items ?? []) as AvailabilityRule[];

  const quickAdd = async () => {
    if (!employeeId) return;
    await createM.mutateAsync({
      employeeId,
      dayOfWeek: 1,
      kind: "AVAILABLE",
      startTime: "09:00",
      endTime: "17:00",
      notes: "My availability",
    });
    await refresh();
  };

  return (
    <TimeShell
      title="My Availability"
      subtitle="Set when you can work (used by scheduling and approvals)."
      pill="Scheduling • My Availability"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          <Button onClick={quickAdd} disabled={busy || !employeeId}>
            <Plus className="h-4 w-4" />
            Quick add
          </Button>
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard
          title="My Availability"
          description="Batch 2 adds a weekly editor with copy week and templates."
          right={
            <Badge variant="muted" className="rounded-full">
              Rules: {items.length}
            </Badge>
          }
        />

        {!employeeId ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No employee context"
                description="Your session doesn't include an employeeId. Wire employee into auth payload to enable self-service availability."
              />
            </CardContent>
          </Card>
        ) : listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading…</CardContent>
          </Card>
        ) : items.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((r) => (
              <Card key={r.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {DOW[r.dayOfWeek] ?? `D${r.dayOfWeek}`} • {r.startTime}–{r.endTime}
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {String(r.kind ?? "AVAILABLE")}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {r.notes ? String(r.notes) : "—"}
                      </div>
                    </div>

                    <Badge variant="muted" className="rounded-full">
                      {String(r.status ?? "ACTIVE")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No rules yet"
                description="Use Quick add now, or wait for Batch 2 weekly editor."
                action={<Button onClick={quickAdd}>Quick add</Button>}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </TimeShell>
  );
}