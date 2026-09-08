"use client";

import * as React from "react";
import { Clock, Users, Building2, MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/logaxp/components/ui/badge";
import { cn } from "@/logaxp/lib/cn";
import type { Shift } from "@/logaxp/lib/scheduling/scheduleManagement.types";

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function calculateDuration(start?: string | null, end?: string | null): string {
  if (!start || !end) return "?";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function getShiftStatusColor(status?: string): string {
  switch (status?.toUpperCase()) {
    case "PUBLISHED": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
    case "DRAFT":     return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40";
    case "CANCELED":  return "bg-red-100 text-red-800 border-red-200 line-through opacity-70 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40";
    default:          return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/40";
  }
}

interface ShiftsCalendarWeekProps {
  fromIso: string;
  rows: Shift[];
  onSelect: (shift: Shift) => void;
  onDayClick?: (date: string) => void; // optional: navigate to day view
}

export function ShiftsCalendarWeek({
  fromIso,
  rows,
  onSelect,
  onDayClick,
}: ShiftsCalendarWeekProps) {
  const anchor = React.useMemo(() => startOfWeek(new Date(fromIso)), [fromIso]);
  const days = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(anchor, i)),
    [anchor]
  );

  const shiftsByDay = React.useMemo(() => {
    const map: Record<string, Shift[]> = {};
    rows.forEach((shift) => {
      const key = shift.startAt ? dayKey(new Date(shift.startAt)) : "unknown";
      map[key] = map[key] ?? [];
      map[key].push(shift);
    });

    // Sort shifts by start time
    Object.values(map).forEach((list) =>
      list.sort((a, b) =>
        (a.startAt ?? "").localeCompare(b.startAt ?? "")
      )
    );

    return map;
  }, [rows]);

  const today = dayKey(new Date());

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b bg-muted/40 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Weekly Schedule View
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-7 md:divide-x md:divide-y-0 bg-muted/20">
        {days.map((day) => {
          const dateKey = dayKey(day);
          const isToday = dateKey === today;
          const dayShifts = shiftsByDay[dateKey] ?? [];
          const shiftCount = dayShifts.length;

          return (
            <div
              key={dateKey}
              className={cn(
                "flex min-h-[180px] flex-col bg-card transition-colors",
                isToday && "bg-accent/30",
                shiftCount > 0 && "hover:bg-accent/40"
              )}
            >
              {/* Day Header */}
              <button
                type="button"
                onClick={() => onDayClick?.(dateKey)}
                disabled={!onDayClick}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 border-b bg-muted/50",
                  onDayClick && "hover:bg-muted/70 cursor-pointer group"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday ? "text-primary" : "text-foreground"
                    )}
                  >
                    {formatDayHeader(day)}
                  </span>
                  {isToday && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                      Today
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 min-w-[1.8rem] text-center"
                  >
                    {shiftCount}
                  </Badge>
                  {onDayClick && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </button>

              {/* Shifts List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                {shiftCount === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground/70 italic">
                    No shifts
                  </div>
                ) : (
                  dayShifts.slice(0, 10).map((shift) => {
                    const duration = calculateDuration(shift.startAt, shift.endAt);
                    const statusStyle = getShiftStatusColor(shift.status);

                    return (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={() => onSelect(shift)}
                        className={cn(
                          "group relative w-full rounded-lg border p-2.5 text-left transition-all hover:shadow-sm hover:-translate-y-0.5",
                          statusStyle
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm leading-tight">
                            {formatTime(shift.startAt)} – {formatTime(shift.endAt)}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-5 font-normal bg-background/80"
                          >
                            {duration}
                          </Badge>
                        </div>

                        <div className="mt-1.5 text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                          {shift.employeeId && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Emp {shift.employeeId.slice(0, 6)}
                            </div>
                          )}
                          {shift.orgUnitId && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              Org {shift.orgUnitId.slice(0, 6)}
                            </div>
                          )}
                          {shift.locationId && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {shift.locationId.slice(0, 6)}
                            </div>
                          )}
                        </div>

                        {/* Status pill in corner */}
                        {shift.status && shift.status !== "PUBLISHED" && (
                          <div className="absolute top-1.5 right-1.5">
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 h-4 opacity-90"
                            >
                              {shift.status}
                            </Badge>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}

                {shiftCount > 10 && (
                  <div className="text-center text-xs text-muted-foreground py-1">
                    +{shiftCount - 10} more shifts
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}