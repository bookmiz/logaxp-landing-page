"use client";

import * as React from "react";
import { CalendarDays, AlertTriangle } from "lucide-react";

import { Badge } from "@/logaxp/components/ui/badge";
import { cn } from "@/logaxp/lib/cn";

import type { LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { useLeaveCalendar } from "@/logaxp/hooks/leave/useLeaveRequests";

type Props = {
  from: string;
  to: string;
  employeeId?: string;
  enabled: boolean;
};

function parseDateOnly(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

function fmtDay(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeekMonday(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function overlapsDay(r: LeaveRequest, key: string) {
  const s = String((r as any).startDate ?? "").slice(0, 10);
  const e = String((r as any).endDate ?? "").slice(0, 10);
  return Boolean(s && e && s <= key && key <= e);
}

function nameFor(r: LeaveRequest) {
  const fn = (r as any).employee?.firstName ?? "";
  const ln = (r as any).employee?.lastName ?? "";
  const full = `${fn} ${ln}`.trim();
  return full || String((r as any).employeeId ?? "Employee");
}

export function LeaveCalendarPanel({ from, to, employeeId, enabled }: Props) {
  const calQ = useLeaveCalendar(
    {
      from,
      to,
      ...(employeeId ? { employeeId } : {}),
    } as any,
    enabled && Boolean(from && to)
  );

  const rows = React.useMemo(() => {
    const raw = calQ.data as any;
    if (!raw) return [];
    if (typeof raw === "object" && "data" in raw) {
      return Array.isArray(raw.data) ? (raw.data as LeaveRequest[]) : [];
    }
    return Array.isArray(raw) ? (raw as LeaveRequest[]) : [];
  }, [calQ.data]);

  const fromD = React.useMemo(() => (from ? parseDateOnly(from) : null), [from]);
  const toD = React.useMemo(() => (to ? parseDateOnly(to) : null), [to]);

  const weeks = React.useMemo(() => {
    if (!fromD || !toD) return [];
    const start = startOfWeekMonday(fromD);
    const out: Date[][] = [];
    let cur = start;

    while (cur <= toD) {
      out.push(Array.from({ length: 7 }, (_, i) => addDays(cur, i)));
      cur = addDays(cur, 7);
    }
    return out;
  }, [fromD, toD]);

  const byDay = React.useMemo(() => {
    const map: Record<string, LeaveRequest[]> = {};
    for (const w of weeks) {
      for (const d of w) map[dayKey(d)] = [];
    }
    for (const r of rows) {
      for (const key of Object.keys(map)) {
        if (overlapsDay(r, key)) map[key].push(r);
      }
    }
    return map;
  }, [rows, weeks]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <CalendarDays className="h-3.5 w-3.5" />
            Calendar
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium">{from || "—"}</span> → <span className="font-medium">{to || "—"}</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Approved leaves: <span className="font-medium">{rows.length}</span>
        </div>
      </div>

      {calQ.isLoading ? (
        <div className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading calendar…</div>
      ) : calQ.isError ? (
        <div className="p-6">
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Failed to load calendar.
          </div>
        </div>
      ) : !from || !to ? (
        <div className="p-6 text-sm text-slate-600 dark:text-slate-300">
          Pick a date range (From/To) to display the calendar.
        </div>
      ) : (
        <div className="p-4">
          <div className="grid gap-2">
            <div className="grid grid-cols-7 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="px-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid gap-2">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-2">
                  {week.map((d) => {
                    const key = dayKey(d);
                    const dayRows = byDay[key] ?? [];
                    return (
                      <div
                        key={key}
                        className={cn(
                          "min-h-[92px] rounded-xl border border-slate-200 bg-slate-50/40 p-2",
                          "dark:border-slate-800 dark:bg-slate-900/20"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                            {fmtDay(d)}
                          </div>
                          {dayRows.length ? (
                            <Badge variant="muted" className="rounded-full text-[10px]">
                              {dayRows.length}
                            </Badge>
                          ) : null}
                        </div>

                        <div className="mt-2 space-y-1">
                          {dayRows.slice(0, 3).map((r) => (
                            <div
                              key={String(r.id)}
                              className="truncate rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                              title={nameFor(r)}
                            >
                              {nameFor(r)}
                            </div>
                          ))}
                          {dayRows.length > 3 ? (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              +{dayRows.length - 3} more
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}