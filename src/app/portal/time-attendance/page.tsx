"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { TimeRangePicker } from "@/logaxp/components/time-management/TimeRangePicker";

import { TimeOverviewStatsCards } from "@/logaxp/components/time-management/TimeOverviewStatsCards";
import { TimeQuickActions } from "@/logaxp/components/time-management/TimeQuickActions";
import { TimeRecentActivity } from "@/logaxp/components/time-management/TimeRecentActivity";

import { useTimeRange } from "@/logaxp/hooks/time-management/useTimeRange";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import {
  toIsoStart,
  toIsoEnd,
} from "@/logaxp/components/time-management/time.ui";

import {
  useOpenTimeClock,
  useRunningTimer,
  useTimeClockSummary,
  useTimeClocksPreview,
  useTimeEntriesPreview,
  useTimeEntriesStats,
  useTimerHistoryPreview,
} from "@/logaxp/hooks/time-management/useTimeHubQueries";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function PortalTimeAttendancePage() {
  const qc = useQueryClient();
  const range = useTimeRange({ syncToUrl: true, defaultDaysBack: 7 });

  const membershipId = useAuthStore((s) => s.membership?.id ?? null);
  const employeeId = useAuthStore((s) => s.employee?.id ?? null);

  // ✅ normalize once (stable)
  const fromIso = React.useMemo(() => toIsoStart(range.from), [range.from]);
  const toIso = React.useMemo(() => toIsoEnd(range.to), [range.to]);
  const rangeOk = Boolean(fromIso && toIso);

  // ---------- Queries (Hub) ----------
  const statsQ = useTimeEntriesStats(
    { from: fromIso!, to: toIso!, membershipId: membershipId ?? undefined },
    rangeOk,
  );

  const summaryQ = useTimeClockSummary(
    {
      from: fromIso!,
      to: toIso!,
      employeeId: undefined,
      includeOpen: true,
      groupBy: "day",
    },
    rangeOk,
  );

  // ✅ gate properly
  const runningQ = useRunningTimer(membershipId, Boolean(membershipId));
  const openClockQ = useOpenTimeClock(employeeId, Boolean(employeeId));

  const recentEntriesQ = useTimeEntriesPreview(
    {
      from: fromIso!,
      to: toIso!,
      page: 1,
      pageSize: 5,
      membershipId: membershipId ?? undefined,
    },
    rangeOk,
  );

  const recentClocksQ = useTimeClocksPreview(
    {
      from: fromIso!,
      to: toIso!,
      page: 1,
      pageSize: 5,
      employeeId: employeeId ?? undefined,
    },
    rangeOk,
  );

  const recentTimersQ = useTimerHistoryPreview(
    {
      from: fromIso!,
      to: toIso!,
      page: 1,
      pageSize: 5,
      membershipId: membershipId ?? undefined,
    },
    Boolean(membershipId) && rangeOk,
  );

  const hubLoading =
    statsQ.isLoading ||
    summaryQ.isLoading ||
    runningQ.isLoading ||
    (Boolean(employeeId) && openClockQ.isLoading);

  const summaryError = statsQ.isError || summaryQ.isError || runningQ.isError || openClockQ.isError;
  const activityError = recentEntriesQ.isError || recentClocksQ.isError || recentTimersQ.isError;

  const refreshAll = async () => {
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  return (
    <TimeShell
      title="Time & Attendance"
      subtitle="Review recorded work, attendance, and focused time."
      pill="Time & Leave • Time"
      actions={
        <Button variant="outline" onClick={refreshAll} disabled={hubLoading}>
          <RefreshCcw className={cn("h-4 w-4", hubLoading && "animate-spin")} />
          Refresh
        </Button>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard
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

        {summaryError ? <div role="alert" className="rounded-xl border border-red-400/40 p-4"><p>Time summary is unavailable. Your records have not been changed.</p><Button variant="outline" onClick={refreshAll} className="mt-2">Retry summary</Button></div> : <TimeOverviewStatsCards
          entriesStats={statsQ.data ?? null}
          clockSummary={summaryQ.data ?? null}
          runningTimer={runningQ.data ?? null}
          openClock={openClockQ.data ?? null}
          loading={hubLoading}
        />}

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TimeQuickActions
              from={range.from}
              to={range.to}
              canClock={Boolean(employeeId)}
              hasOpenClock={Boolean(openClockQ.data?.id)}
            />
          </div>

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:col-span-2">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Review your time
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Use the date filters to review recorded work, attendance and
                recent activity. Open Time entries to add or correct a record
                before submitting your timesheet.
              </p>
            </CardContent>
          </Card>
        </div>

        {activityError ? <div role="alert" className="rounded-xl border border-red-400/40 p-4"><p>Recent activity could not be loaded.</p><Button variant="outline" onClick={refreshAll} className="mt-2">Retry activity</Button></div> : <TimeRecentActivity
          entries={recentEntriesQ.data ?? null}
          clocks={recentClocksQ.data ?? null}
          timers={recentTimersQ.data ?? null}
          loadingEntries={recentEntriesQ.isLoading}
          loadingClocks={recentClocksQ.isLoading}
          loadingTimers={recentTimersQ.isLoading}
        />}
      </div>
    </TimeShell>
  );
}
