"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import type { OvertimePolicy, UpdateOvertimePolicyDto, OvertimeBasis, OvertimeRateMode } from "@/logaxp/lib/time-management/timeAdmin.types";

function num(v: string, def: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function OvertimePolicyForm({
  value,
  busy,
  onSave,
}: {
  value: OvertimePolicy;
  busy?: boolean;
  onSave: (dto: UpdateOvertimePolicyDto) => void | Promise<void>;
}) {
  const [enabled, setEnabled] = React.useState(Boolean(value.enabled));
  const [basis, setBasis] = React.useState<OvertimeBasis>(value.basis);
  const [rateMode, setRateMode] = React.useState<OvertimeRateMode>(value.rateMode);

  const [weeklyThresholdMinutes, setWeeklyThresholdMinutes] = React.useState(String(value.weeklyThresholdMinutes ?? 2400));
  const [dailyThresholdMinutes, setDailyThresholdMinutes] = React.useState(String(value.dailyThresholdMinutes ?? 480));

  const [overtimeMultiplier, setOvertimeMultiplier] = React.useState(String(value.overtimeMultiplier ?? 1.5));

  const [doubleTimeEnabled, setDoubleTimeEnabled] = React.useState(Boolean(value.doubleTimeEnabled));
  const [doubleTimeThresholdMinutes, setDoubleTimeThresholdMinutes] = React.useState(String(value.doubleTimeThresholdMinutes ?? 720));
  const [doubleTimeMultiplier, setDoubleTimeMultiplier] = React.useState(String(value.doubleTimeMultiplier ?? 2));

  React.useEffect(() => {
    setEnabled(Boolean(value.enabled));
    setBasis(value.basis);
    setRateMode(value.rateMode);

    setWeeklyThresholdMinutes(String(value.weeklyThresholdMinutes ?? 2400));
    setDailyThresholdMinutes(String(value.dailyThresholdMinutes ?? 480));

    setOvertimeMultiplier(String(value.overtimeMultiplier ?? 1.5));

    setDoubleTimeEnabled(Boolean(value.doubleTimeEnabled));
    setDoubleTimeThresholdMinutes(String(value.doubleTimeThresholdMinutes ?? 720));
    setDoubleTimeMultiplier(String(value.doubleTimeMultiplier ?? 2));
  }, [value]);

  const submit = async () => {
    await onSave({
      enabled,
      basis,
      rateMode,
      weeklyThresholdMinutes: Math.max(0, Math.trunc(num(weeklyThresholdMinutes, 2400))),
      dailyThresholdMinutes: Math.max(0, Math.trunc(num(dailyThresholdMinutes, 480))),
      overtimeMultiplier: Math.max(1, num(overtimeMultiplier, 1.5)),
      doubleTimeEnabled,
      doubleTimeThresholdMinutes: Math.max(0, Math.trunc(num(doubleTimeThresholdMinutes, 720))),
      doubleTimeMultiplier: Math.max(1, num(doubleTimeMultiplier, 2)),
    });
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Overtime Policy</CardTitle>
        <CardDescription>Defines how overtime and double-time minutes are computed for payroll.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Enable overtime
          </label>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Basis</div>
            <select
              value={basis}
              onChange={(e) => setBasis(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              disabled={!enabled}
            >
              <option value="WEEKLY">WEEKLY</option>
              <option value="DAILY">DAILY</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Rate Mode</div>
            <select
              value={rateMode}
              onChange={(e) => setRateMode(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              disabled={!enabled}
            >
              <option value="MULTIPLIER">MULTIPLIER</option>
              <option value="MINUTES_ONLY">MINUTES_ONLY</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Weekly threshold (minutes)</div>
            <input
              type="number"
              min={0}
              value={weeklyThresholdMinutes}
              onChange={(e) => setWeeklyThresholdMinutes(e.target.value)}
              disabled={!enabled || basis !== "WEEKLY"}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Daily threshold (minutes)</div>
            <input
              type="number"
              min={0}
              value={dailyThresholdMinutes}
              onChange={(e) => setDailyThresholdMinutes(e.target.value)}
              disabled={!enabled || basis !== "DAILY"}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Overtime multiplier</div>
            <input
              type="number"
              step="0.1"
              min={1}
              value={overtimeMultiplier}
              onChange={(e) => setOvertimeMultiplier(e.target.value)}
              disabled={!enabled}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <input type="checkbox" checked={doubleTimeEnabled} onChange={(e) => setDoubleTimeEnabled(e.target.checked)} disabled={!enabled} />
            Enable double time
          </label>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Double time threshold (minutes)</div>
            <input
              type="number"
              min={0}
              value={doubleTimeThresholdMinutes}
              onChange={(e) => setDoubleTimeThresholdMinutes(e.target.value)}
              disabled={!enabled || !doubleTimeEnabled}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Double time multiplier</div>
            <input
              type="number"
              step="0.1"
              min={1}
              value={doubleTimeMultiplier}
              onChange={(e) => setDoubleTimeMultiplier(e.target.value)}
              disabled={!enabled || !doubleTimeEnabled}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={submit} disabled={busy}>
            <Save className="h-4 w-4" />
            Save policy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}