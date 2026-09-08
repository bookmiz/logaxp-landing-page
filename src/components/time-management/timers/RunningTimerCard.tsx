"use client";

import * as React from "react";
import { GitMerge, PauseCircle, Play, Timer } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";

import type { ApiResponse, TimerRecord } from "@/logaxp/lib/time-management/timeManagement.types";
import { unwrapApi, formatIsoDateTime, formatMinutes, shortId } from "@/logaxp/components/time-management/time.ui";
import { formatElapsedMs, safeDate, workLabel, minutesBetween } from "./timer.utils";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  running?: ApiResponse<TimerRecord | null> | null;
  membershipId: string | null;
  busy?: boolean;

  onStartClick: () => void;
  onSwitchClick: () => void;

  onStopRunning: (payload: { membershipId: string; billable?: boolean; notes?: string | null }) => void | Promise<void>;
};

export function RunningTimerCard({
  running,
  membershipId,
  busy,
  onStartClick,
  onSwitchClick,
  onStopRunning,
}: Props) {
  const rec = unwrapApi(running);
  const startedAt = rec?.startedAt ?? null;
  const startedDate = safeDate(startedAt);

  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!rec?.id || !startedDate || rec?.stoppedAt) return;
    const t = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(t);
  }, [rec?.id, startedDate, rec?.stoppedAt]);

  const hasRunning = Boolean(rec?.id && !rec?.stoppedAt && (rec as any)?.isRunning !== false);
  const elapsedMs = startedDate ? Date.now() - startedDate.getTime() : 0;

  const [billable, setBillable] = React.useState(Boolean(rec?.billable ?? false));
  const [notes, setNotes] = React.useState(String(rec?.notes ?? ""));

  React.useEffect(() => {
    setBillable(Boolean(rec?.billable ?? false));
    setNotes(String(rec?.notes ?? ""));
  }, [rec?.id]);

  const computedMinutes = hasRunning
    ? minutesBetween(rec?.startedAt ?? null, new Date().toISOString()) ?? rec?.durationMinutes ?? 0
    : (rec?.durationMinutes ?? 0);

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

      <CardHeader className="relative pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <Timer className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              Timers • Console
            </div>

            <CardTitle className="mt-2 flex items-center gap-2 text-base">
              Running Timer
              <Badge
                className={cx(
                  "rounded-full",
                  hasRunning
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                    : ""
                )}
                variant="muted"
              >
                {hasRunning ? "LIVE" : "IDLE"}
              </Badge>
            </CardTitle>

            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {hasRunning ? "Timer is active and tracking." : "No active timer. Start one to begin tracking focused work."}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onStartClick} disabled={busy || !membershipId}>
              <Play className="h-4 w-4" />
              Start
            </Button>

            <Button variant="outline" onClick={onSwitchClick} disabled={busy || !membershipId || !hasRunning}>
              <GitMerge className="h-4 w-4" />
              Switch
            </Button>

            <Button
              variant="outline"
              onClick={() => membershipId && onStopRunning({ membershipId, billable, notes: notes.trim() || null })}
              disabled={busy || !membershipId || !hasRunning}
              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
            >
              <PauseCircle className="h-4 w-4" />
              Stop
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {hasRunning ? (
          <>
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs text-slate-500 dark:text-slate-400">Elapsed</div>
                <div className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                  {formatElapsedMs(elapsedMs)}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Approx: <span className="font-medium">{formatMinutes(computedMinutes)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs text-slate-500 dark:text-slate-400">Work</div>
                <div className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {workLabel(rec?.projectId as any, rec?.workItemId as any)}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Started: <span className="font-medium">{formatIsoDateTime(rec?.startedAt ?? null)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs text-slate-500 dark:text-slate-400">Timer ID</div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{shortId(rec?.id)}</div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Membership: <span className="font-medium">{shortId(rec?.membershipId ?? "")}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Billable</div>
                <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} />
                  Mark when stopping
                </label>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Billable flag is applied on <span className="font-medium">Stop</span> / <span className="font-medium">Switch</span>.
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Notes (applied on stop)</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes about this timer session…"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            No running timer detected for your membership.
          </div>
        )}
      </CardContent>
    </Card>
  );
}