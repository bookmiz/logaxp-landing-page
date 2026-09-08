"use client";

import * as React from "react";
import { Clock, Layers, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import type { ApiResponse, TimeClockSummaryRow, ListData } from "@/logaxp/lib/time-management/timeManagement.types";
import { unwrapApi, normalizeTimeList, formatMinutes } from "@/logaxp/components/time-management/time.ui";

function Stat({
  title,
  value,
  hint,
  icon,
  loading,
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</CardTitle>
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
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

export function TimeClockSummaryCards({
  summary,
  loading,
  hasOpenClock,
}: {
  summary?: ApiResponse<ListData<TimeClockSummaryRow> | Record<string, unknown>> | null;
  loading?: boolean;
  hasOpenClock?: boolean;
}) {
  const raw = unwrapApi(summary as any);
  const { items } = normalizeTimeList<TimeClockSummaryRow>(raw as any);

  const totalMinutes = items.reduce((acc, r: any) => acc + Number(r?.totalMinutes ?? 0), 0);
  const totalBreak = items.reduce((acc, r: any) => acc + Number(r?.breakMinutes ?? 0), 0);
  const count = items.reduce((acc, r: any) => acc + Number(r?.clockCount ?? 0), 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Stat
        title="Attendance Hours"
        value={formatMinutes(totalMinutes)}
        hint={hasOpenClock ? "Open clock detected" : "No open clock"}
        icon={<Clock className="h-4 w-4" />}
        loading={loading}
      />
      <Stat
        title="Break Minutes"
        value={`${Math.max(0, totalBreak)}m`}
        hint="Sum across summary rows"
        icon={<Timer className="h-4 w-4" />}
        loading={loading}
      />
      <Stat
        title="Clock Records"
        value={count}
        hint="Clock count in range"
        icon={<Layers className="h-4 w-4" />}
        loading={loading}
      />
    </div>
  );
}