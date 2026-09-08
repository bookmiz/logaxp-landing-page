"use client";

import * as React from "react";
import { Calculator, Sparkles } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import type { OvertimeCalcResult } from "@/logaxp/lib/time-management/timeAdmin.types";
import { formatMinutes } from "@/logaxp/components/time-management/time.ui";

export function OvertimeCalcPanel({
  busy,
  onCalc,
  result,
}: {
  busy?: boolean;
  onCalc: (dto: { employeeId: string; from: string; to: string }) => void | Promise<void>;
  result: OvertimeCalcResult | null;
}) {
  const [employeeId, setEmployeeId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [error, setError] = React.useState("");

  const calc = async () => {
    setError("");
    if (!employeeId.trim()) return setError("employeeId is required.");
    if (!from.trim()) return setError("from is required (ISO).");
    if (!to.trim()) return setError("to is required (ISO).");
    await onCalc({ employeeId: employeeId.trim(), from: from.trim(), to: to.trim() });
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Overtime Calculator</CardTitle>
        <CardDescription>Run an official overtime calculation over a date range.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Payroll • Overtime
          </Badge>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Employee ID</div>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="employeeId…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">From (ISO)</div>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="2026-03-01T00:00:00.000Z"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">To (ISO)</div>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="2026-03-08T23:59:59.999Z"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={calc} disabled={busy}>
            <Calculator className="h-4 w-4" />
            Calculate
          </Button>
        </div>

        {result ? (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/30">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
              <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{formatMinutes(result.totalMinutes)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/30">
              <div className="text-xs text-slate-500 dark:text-slate-400">Regular</div>
              <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{formatMinutes(result.regularMinutes)}</div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/40 dark:bg-amber-950/25">
              <div className="text-xs text-amber-800/80 dark:text-amber-200/80">Overtime</div>
              <div className="mt-1 font-semibold text-amber-900 dark:text-amber-200">{formatMinutes(result.overtimeMinutes)}</div>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm dark:border-sky-900/40 dark:bg-sky-950/25">
              <div className="text-xs text-sky-800/80 dark:text-sky-200/80">Double Time</div>
              <div className="mt-1 font-semibold text-sky-900 dark:text-sky-200">{formatMinutes(result.doubleTimeMinutes)}</div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}