"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, FileText, Timer } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import type {
  ApiResponse,
  TimeEntry,
  TimeClock,
  TimerRecord,
  ListData,
} from "@/logaxp/lib/time-management/timeManagement.types";
import { unwrapApi, normalizeTimeList, formatIsoDateTime, formatMinutes, shortId } from "./time.ui";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function MiniList({
  title,
  icon,
  description,
  href,
  loading,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  href: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function TimeRecentActivity({
  entries,
  clocks,
  timers,
  loadingEntries,
  loadingClocks,
  loadingTimers,
}: {
  entries?: ApiResponse<ListData<TimeEntry>> | null;
  clocks?: ApiResponse<ListData<TimeClock>> | null;
  timers?: ApiResponse<ListData<TimerRecord>> | null;
  loadingEntries?: boolean;
  loadingClocks?: boolean;
  loadingTimers?: boolean;
}) {
  const entriesList = normalizeTimeList<TimeEntry>(entries);
  const clocksList = normalizeTimeList<TimeClock>(clocks);
  const timersList = normalizeTimeList<TimerRecord>(timers);

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <MiniList
        title="Recent Entries"
        icon={<FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />}
        description="Latest logged time entries."
        href="/portal/time-attendance/entries"
        loading={loadingEntries}
      >
        {entriesList.items.length ? (
          entriesList.items.slice(0, 5).map((e) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate font-medium text-slate-900 dark:text-slate-50">
                    {e.workItemId ? `WorkItem ${shortId(e.workItemId)}` : e.projectId ? `Project ${shortId(e.projectId)}` : "Time Entry"}
                  </div>
                  {e.billable ? (
                    <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                      Billable
                    </Badge>
                  ) : (
                    <Badge variant="muted" className="rounded-full">
                      Non-billable
                    </Badge>
                  )}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatIsoDateTime(e.createdAt)} • Source: {String(e.source ?? "—")}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-semibold text-slate-900 dark:text-slate-50">{formatMinutes(e.durationMinutes)}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{shortId(e.id)}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            No entries found in this range.
          </div>
        )}
      </MiniList>

      <MiniList
        title="Recent Clocks"
        icon={<Clock className="h-4 w-4 text-sky-600 dark:text-sky-300" />}
        description="Latest attendance clock records."
        href="/portal/time-attendance/clocks"
        loading={loadingClocks}
      >
        {clocksList.items.length ? (
          clocksList.items.slice(0, 5).map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate font-medium text-slate-900 dark:text-slate-50">
                    {c.status ?? "CLOCK"}
                  </div>
                  <Badge variant="muted" className="rounded-full">
                    {c.clockOutAt ? "Closed" : "Open"}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  In: {formatIsoDateTime(c.clockInAt)}{" "}
                  {c.clockOutAt ? <>• Out: {formatIsoDateTime(c.clockOutAt)}</> : null}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-semibold text-slate-900 dark:text-slate-50">
                  {formatMinutes(Number(c.breakMinutes ?? 0) * -1) === "0h" ? "—" : `${c.breakMinutes}m break`}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{shortId(c.id)}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            No clocks found in this range.
          </div>
        )}
      </MiniList>

      <MiniList
        title="Recent Timers"
        icon={<Timer className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />}
        description="Latest timer sessions."
        href="/portal/time-attendance/timers"
        loading={loadingTimers}
      >
        {timersList.items.length ? (
          timersList.items.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate font-medium text-slate-900 dark:text-slate-50">
                    {t.workItemId ? `WorkItem ${shortId(String(t.workItemId))}` : t.projectId ? `Project ${shortId(String(t.projectId))}` : "Timer session"}
                  </div>
                  <Badge variant="muted" className="rounded-full">
                    {t.stoppedAt ? "Stopped" : "Running"}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Start: {formatIsoDateTime(t.startedAt)} {t.stoppedAt ? <>• Stop: {formatIsoDateTime(t.stoppedAt)}</> : null}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-semibold text-slate-900 dark:text-slate-50">{formatMinutes(t.durationMinutes)}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{shortId(t.id)}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            No timer sessions found in this range.
          </div>
        )}
      </MiniList>
    </div>
  );
}