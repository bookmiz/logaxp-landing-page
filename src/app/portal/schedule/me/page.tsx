"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { TimeRangePicker } from "@/logaxp/components/time-management/TimeRangePicker";
import { useTimeRange } from "@/logaxp/hooks/time-management/useTimeRange";
import { toIsoStart, toIsoEnd } from "@/logaxp/components/time-management/time.ui";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import type { Shift } from "@/logaxp/lib/scheduling/scheduleManagement.types";
import { normalizeTimeList } from "@/logaxp/components/time-management/time.ui";

import { useShifts } from "@/logaxp/hooks/scheduling/useShifts";
import { ShiftsCalendarWeekDnd } from "@/logaxp/components/scheduling/shifts/ShiftsCalendarWeekDnd";
import { useShiftConflictsMap } from "@/logaxp/hooks/scheduling/useShiftConflictsMap";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function PortalMySchedulePage() {
  const qc = useQueryClient();
  const range = useTimeRange({ syncToUrl: true, defaultDaysBack: 7 });

  const employeeId = useAuthStore((s) => s.employee?.id ?? null);

  const fromIso = React.useMemo(() => toIsoStart(range.from), [range.from]);
  const toIso = React.useMemo(() => toIsoEnd(range.to), [range.to]);
  const rangeOk = Boolean(fromIso && toIso && employeeId);

  const listQ = useShifts(
    {
      from: fromIso!,
      to: toIso!,
      employeeId: employeeId ?? undefined,
      page: 1,
      pageSize: 500,
    } as any,
    rangeOk
  );

  const { items } = normalizeTimeList<Shift>(listQ.data ?? null);

  const conflicts = useShiftConflictsMap(
    { from: fromIso!, to: toIso!, employeeId: employeeId ?? undefined },
    rangeOk
  );

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["schedule"] as any });
  };

  return (
    <TimeShell
      title="My Schedule"
      subtitle="Your upcoming shifts (self-service)."
      pill="Scheduling • My Schedule"
      actions={
        <Button variant="outline" onClick={refresh} disabled={listQ.isFetching}>
          <RefreshCcw className={cn("h-4 w-4", listQ.isFetching && "animate-spin")} />
          Refresh
        </Button>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard
          title="My Schedule"
          description="View your assigned shifts in a week calendar."
          right={
            <TimeRangePicker
              from={range.from}
              to={range.to}
              onChange={(v) => {
                range.setFrom(v.from);
                range.setTo(v.to);
              }}
              onLast7={() => range.setLastNDays(7)}
              onLast30={() => range.setLastNDays(30)}
              onThisMonth={() => range.setThisMonth()}
              compact
            />
          }
        />

        {!employeeId ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No employee context"
                description="Your session doesn’t have an employeeId. Wire employee into membership payload for self-service scheduling."
              />
            </CardContent>
          </Card>
        ) : listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading shifts…</CardContent>
          </Card>
        ) : items.length ? (
          <ShiftsCalendarWeekDnd
            anchorFromIso={fromIso!}
            rows={items}
            conflictMap={conflicts.conflictMap}
            selectedIds={undefined}
            onSelect={() => {}}
            canEdit={false} // self-service view = read-only
            onMove={async () => {}}
          />
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState title="No shifts found" description="Try a wider date range." />
            </CardContent>
          </Card>
        )}
      </div>
    </TimeShell>
  );
}