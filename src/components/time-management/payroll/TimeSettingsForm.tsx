"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import type { TimeSettings, UpdateTimeSettingsDto, WeekStartDay } from "@/logaxp/lib/time-management/timeAdmin.types";

function num(v: string, def: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function TimeSettingsForm({
  value,
  busy,
  onSave,
}: {
  value: TimeSettings;
  busy?: boolean;
  onSave: (dto: UpdateTimeSettingsDto) => void | Promise<void>;
}) {
  const [timezone, setTimezone] = React.useState(value.timezone ?? "");
  const [weekStartDay, setWeekStartDay] = React.useState<WeekStartDay>(value.weekStartDay);
  const [defaultBreakMinutes, setDefaultBreakMinutes] = React.useState(String(value.defaultBreakMinutes ?? 0));
  const [roundingMinutes, setRoundingMinutes] = React.useState(String(value.roundingMinutes ?? 0));
  const [allowFutureClockIns, setAllowFutureClockIns] = React.useState(Boolean(value.allowFutureClockIns));
  const [allowManualTimeEntries, setAllowManualTimeEntries] = React.useState(Boolean(value.allowManualTimeEntries));

  React.useEffect(() => {
    setTimezone(value.timezone ?? "");
    setWeekStartDay(value.weekStartDay);
    setDefaultBreakMinutes(String(value.defaultBreakMinutes ?? 0));
    setRoundingMinutes(String(value.roundingMinutes ?? 0));
    setAllowFutureClockIns(Boolean(value.allowFutureClockIns));
    setAllowManualTimeEntries(Boolean(value.allowManualTimeEntries));
  }, [value]);

  const submit = async () => {
    await onSave({
      timezone: timezone.trim() || null,
      weekStartDay,
      defaultBreakMinutes: Math.max(0, num(defaultBreakMinutes, 0)),
      roundingMinutes: Math.max(0, num(roundingMinutes, 0)),
      allowFutureClockIns,
      allowManualTimeEntries,
    });
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Time Settings</CardTitle>
        <CardDescription>These settings affect attendance UX and payroll boundaries.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Timezone (optional)</div>
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/Chicago"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Week start day</div>
            <select
              value={weekStartDay}
              onChange={(e) => setWeekStartDay(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            >
              <option value="SUNDAY">SUNDAY</option>
              <option value="MONDAY">MONDAY</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Default break minutes</div>
            <input
              type="number"
              min={0}
              value={defaultBreakMinutes}
              onChange={(e) => setDefaultBreakMinutes(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Used to prefill break dialogs; does not force breaks.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Rounding minutes</div>
            <select
              value={roundingMinutes}
              onChange={(e) => setRoundingMinutes(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            >
              <option value="0">0 (no rounding)</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Recommended: 5 or 15 depending on policy.
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <input type="checkbox" checked={allowFutureClockIns} onChange={(e) => setAllowFutureClockIns(e.target.checked)} />
            Allow future clock-ins
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <input type="checkbox" checked={allowManualTimeEntries} onChange={(e) => setAllowManualTimeEntries(e.target.checked)} />
            Allow manual time entries
          </label>
        </div>

        <div className="flex justify-end">
          <Button onClick={submit} disabled={busy}>
            <Save className="h-4 w-4" />
            Save settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}