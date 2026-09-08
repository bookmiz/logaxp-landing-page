"use client";

import * as React from "react";
import { Clock, Coffee, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";
import type { TimeClock } from "@/logaxp/lib/time-management/timeManagement.types";
import { formatIsoDateTime, shortId } from "@/logaxp/components/time-management/time.ui";
import { computeClockDurationMinutes } from "./clock.utils";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function ClockStatusCard({
  openClock,
  canClock,
  busy,
  onClockInClick,
  onClockOutClick,
  onAddBreakClick,
  onSetBreakClick,
  onAdjustClick,
}: {
  openClock?: TimeClock | null;
  canClock: boolean;
  busy?: boolean;
  onClockInClick: () => void;
  onClockOutClick: (clock: TimeClock) => void;
  onAddBreakClick: (clock: TimeClock) => void;
  onSetBreakClick: (clock: TimeClock) => void;
  onAdjustClick: (clock: TimeClock) => void;
}) {
  const clock = openClock ?? null;

  const isOpen = Boolean(clock?.id && (clock?.status === "OPEN" || !clock?.clockOutAt));
  const net = computeClockDurationMinutes(
    clock?.clockInAt ?? null,
    clock?.clockOutAt ?? null,
    clock?.breakMinutes ?? 0
  );

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

      <CardHeader className="relative pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              Attendance • Live Status
            </div>

            <CardTitle className="mt-2 flex items-center gap-2 text-base">
              {isOpen ? "Clocked In" : "Not Clocked In"}
              <Badge
                variant="muted"
                className={cx(
                  "rounded-full",
                  isOpen && "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                )}
              >
                {isOpen ? "OPEN" : "IDLE"}
              </Badge>
            </CardTitle>

            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {isOpen
                ? "You have an open clock. Breaks and clock-out actions are available."
                : "Clock in to begin tracking attendance."}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onClockInClick} disabled={busy || !canClock || isOpen} title={!canClock ? "No employee context" : ""}>
              <LogIn className="h-4 w-4" />
              Clock in
            </Button>

            <Button
              variant="outline"
              disabled={busy || !isOpen}
              onClick={() => clock && onAddBreakClick(clock)}
            >
              <Coffee className="h-4 w-4" />
              Add break
            </Button>

            <Button
              variant="outline"
              disabled={busy || !isOpen}
              onClick={() => clock && onSetBreakClick(clock)}
            >
              <Coffee className="h-4 w-4" />
              Set break
            </Button>

            <Button
              variant="outline"
              disabled={busy || !isOpen}
              onClick={() => clock && onClockOutClick(clock)}
              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" />
              Clock out
            </Button>

            <Button
              variant="outline"
              disabled={busy || !clock?.id}
              onClick={() => clock && onAdjustClick(clock)}
            >
              <ShieldCheck className="h-4 w-4" />
              Adjust
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {isOpen ? (
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs text-slate-500 dark:text-slate-400">Clock in</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {formatIsoDateTime(clock?.clockInAt ?? null)}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Break: <span className="font-medium">{Number(clock?.breakMinutes ?? 0)}m</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs text-slate-500 dark:text-slate-400">Net minutes (approx)</div>
              <div className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-50">{net ?? 0}</div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Updates live while open.</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs text-slate-500 dark:text-slate-400">Clock ID</div>
              <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{shortId(clock?.id)}</div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Employee: <span className="font-medium">{shortId(clock?.employeeId)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            No open clock detected.
          </div>
        )}
      </CardContent>
    </Card>
  );
}