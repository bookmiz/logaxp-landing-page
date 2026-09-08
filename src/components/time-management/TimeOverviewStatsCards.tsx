"use client";

import * as React from "react";
import { Activity, Clock, DollarSign, Timer } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import type {
  ApiResponse,
  TimeClockSummaryRow,
  TimeEntriesStatsResult,
  TimerRecord,
} from "@/logaxp/lib/time-management/timeManagement.types";
import { unwrapApi, normalizeTimeList, formatMinutes } from "./time.ui";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  entriesStats?: ApiResponse<TimeEntriesStatsResult> | null;
  clockSummary?: ApiResponse<any> | null; // flexible backend
  runningTimer?: ApiResponse<TimerRecord | null> | null;
  openClock?: ApiResponse<any> | Record<string, unknown> | null;
  loading?: boolean;
};

function sumClockMinutes(summary?: ApiResponse<any> | null): number {
  const raw = unwrapApi(summary as any);
  const { items } = normalizeTimeList<TimeClockSummaryRow>(raw as any);
  const rows = items.length ? items : (Array.isArray(raw) ? (raw as any) : []);
  return rows.reduce((acc: number, r: any) => acc + Number(r?.totalMinutes ?? 0), 0);
}

function StatCard({
  title,
  value,
  icon,
  hint,
  tone = "default",
  loading,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  hint?: string;
  tone?: "default" | "emerald" | "blue";
  loading?: boolean;
}) {
  return (
    <Card
      className={cx(
        "relative overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-950",
        "border-slate-200 dark:border-slate-800",
        tone === "emerald" && "ring-1 ring-emerald-100 dark:ring-emerald-900/30",
        tone === "blue" && "ring-1 ring-sky-100 dark:ring-sky-900/30"
      )}
    >
      <div
        className={cx(
          "pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl",
          tone === "emerald" && "bg-emerald-200/50 dark:bg-emerald-500/10",
          tone === "blue" && "bg-sky-200/50 dark:bg-sky-500/10",
          tone === "default" && "bg-slate-200/40 dark:bg-slate-700/10"
        )}
      />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</CardTitle>
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</div>
            {hint ? <div className="text-xs text-slate-500 dark:text-slate-400">{hint}</div> : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TimeOverviewStatsCards({
  entriesStats,
  clockSummary,
  runningTimer,
  openClock,
  loading,
}: Props) {
  const stats = unwrapApi(entriesStats);
  const running = unwrapApi(runningTimer);
  const open = unwrapApi(openClock);

  const totalEntries = Number(stats?.totalEntries ?? 0);
  const totalMinutes = Number(stats?.totalMinutes ?? 0);
  const billableMinutes = Number(stats?.billableMinutes ?? 0);
  const nonBillableMinutes = Number(stats?.nonBillableMinutes ?? 0);

  const attendanceMinutes = sumClockMinutes(clockSummary);

  const hasRunning = Boolean(running?.id && (running as any)?.isRunning !== false && !running?.stoppedAt);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tracked (Entries)"
        value={formatMinutes(totalMinutes)}
        hint={`${totalEntries} entr${totalEntries === 1 ? "y" : "ies"} in range`}
        icon={<Activity className="h-4 w-4" />}
        tone="blue"
        loading={loading}
      />

      <StatCard
        title="Billable"
        value={formatMinutes(billableMinutes)}
        hint={`Non-billable: ${formatMinutes(nonBillableMinutes)}`}
        icon={<DollarSign className="h-4 w-4" />}
        tone="emerald"
        loading={loading}
      />

      <StatCard
        title="Attendance (Clocks)"
        value={formatMinutes(attendanceMinutes)}
        hint={open ? "You have an open clock" : "No open clock detected"}
        icon={<Clock className="h-4 w-4" />}
        tone="default"
        loading={loading}
      />

      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/10" />
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Focus Timer</CardTitle>
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <Timer className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {loading ? (
            <div className="space-y-2">
              <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {hasRunning ? "Running" : "Idle"}
                </div>
                <Badge
                  variant="muted"
                  className={cx(
                    "rounded-full",
                    hasRunning && "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                  )}
                >
                  {hasRunning ? "LIVE" : "READY"}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {hasRunning ? "You have an active timer session." : "Start a timer to track focused work."}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
