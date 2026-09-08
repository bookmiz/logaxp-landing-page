"use client";

import * as React from "react";
import { Activity, DollarSign, Hash } from "lucide-react";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import type { ApiResponse, TimeEntriesStatsResult } from "@/logaxp/lib/time-management/timeManagement.types";
import { unwrapApi, formatMinutes } from "@/logaxp/components/time-management/time.ui";

function Stat({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
        {loading ? (
          <div className="mt-1 h-6 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        ) : (
          <div className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50">{value}</div>
        )}
      </div>
    </div>
  );
}

export function TimeEntryStatsStrip({
  stats,
  loading,
}: {
  stats?: ApiResponse<TimeEntriesStatsResult> | null;
  loading?: boolean;
}) {
  const s = unwrapApi(stats);

  const totalEntries = Number(s?.totalEntries ?? 0);
  const totalMinutes = Number(s?.totalMinutes ?? 0);
  const billableMinutes = Number(s?.billableMinutes ?? 0);
  const nonBillableMinutes = Number(s?.nonBillableMinutes ?? 0);

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardContent className="grid gap-3 p-3 sm:grid-cols-3">
        <Stat
          label="Total tracked"
          value={formatMinutes(totalMinutes)}
          icon={<Activity className="h-4 w-4" />}
          loading={loading}
        />
        <Stat
          label="Billable / Non-billable"
          value={`${formatMinutes(billableMinutes)} / ${formatMinutes(nonBillableMinutes)}`}
          icon={<DollarSign className="h-4 w-4" />}
          loading={loading}
        />
        <Stat
          label="Entries"
          value={totalEntries}
          icon={<Hash className="h-4 w-4" />}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}