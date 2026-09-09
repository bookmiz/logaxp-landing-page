"use client";

// src/components/leave/LeaveCalendarBoard.tsx
import * as React from "react";
import { format, startOfWeek, startOfMonth, addMonths, subMonths, addWeeks, subWeeks, isToday, isWeekend } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import { Badge } from "@/logaxp/components/ui/badge";
import { Avatar, AvatarFallback } from "@/logaxp/components/ui/avatar";
import { Button } from "@/logaxp/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/logaxp/components/ui/tooltip";
import { cn } from "@/logaxp/lib/cn";

import type { LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { formatIsoDate, leaveCalendarDate, leaveEmployeeLabel, shortId } from "@/logaxp/lib/leave/leave.types";
import { LeaveTypeBadge } from "./LeaveTypeBadge";

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function parseToDate(s: string) {
  return leaveCalendarDate(s);
}

function eachDayInclusive(fromIso: string, toIso: string) {
  const from = parseToDate(fromIso);
  const to = parseToDate(toIso);
  if (!from || !to) return [];
  const out: Date[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type ViewMode = "week" | "month";
const STORAGE_KEY = "leave-calendar-view-mode";

export function LeaveCalendarBoard({
  rows,
  from: initialFrom,
  to: initialTo,
  onOpen,
}: {
  rows: LeaveRequest[];
  from: string;
  to: string;
  onOpen: (row: LeaveRequest) => void;
}) {
  const [viewMode, setViewMode] = React.useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as ViewMode) || "week";
    }
    return "week";
  });

  const [currentStart, setCurrentStart] = React.useState(() => parseToDate(initialFrom) || new Date());

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  const [from, to] = React.useMemo(() => {
    let start: Date;
    let end: Date;

    if (viewMode === "month") {
      start = startOfMonth(currentStart);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else {
      start = startOfWeek(currentStart, { weekStartsOn: 1 });
      end = new Date(start);
      end.setDate(end.getDate() + 13); // 2 weeks
    }

    return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
  }, [viewMode, currentStart]);

  const byDay = React.useMemo(() => {
    const map = new Map<string, LeaveRequest[]>();
    rows.forEach((r) => {
      const days = eachDayInclusive(r.startDate, r.endDate);
      days.forEach((d) => {
        const k = dayKey(d);
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(r);
      });
    });
    return map;
  }, [rows]);

  const days = React.useMemo(() => eachDayInclusive(from, to), [from, to]);

  const goPrev = () => {
    setCurrentStart(viewMode === "month" ? subMonths(currentStart, 1) : subWeeks(currentStart, 1));
  };

  const goNext = () => {
    setCurrentStart(viewMode === "month" ? addMonths(currentStart, 1) : addWeeks(currentStart, 1));
  };

  const goToday = () => setCurrentStart(new Date());

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {viewMode === "month"
              ? format(parseToDate(from)!, "MMMM yyyy")
              : `${format(parseToDate(from)!, "MMM d")} – ${format(parseToDate(to)!, "MMM d, yyyy")}`}
          </h2>

          {/* View Toggle */}
          <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("week")}
              className={cn(
                "rounded-l-md px-4 text-sm",
                viewMode === "week" && "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
              )}
            >
              Week
            </Button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-600" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("month")}
              className={cn(
                "rounded-r-md px-4 text-sm",
                viewMode === "month" && "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
              )}
            >
              Month
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="gap-2">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goNext} className="h-9 w-9">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {days.map((d) => {
          const k = dayKey(d);
          const list = byDay.get(k) ?? [];
          const isCurrentDay = isToday(d);
          const isWeekendDay = isWeekend(d);

          return (
            <div
              key={k}
              className={cn(
                "group rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:shadow-md hover:border-slate-300",
                "dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-600",
                isCurrentDay && "border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20",
                isWeekendDay && "bg-slate-50 dark:bg-slate-900/60"
              )}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-base font-semibold",
                      isCurrentDay ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100",
                      isWeekendDay && "text-slate-500 dark:text-slate-500"
                    )}
                  >
                    {format(d, "d")}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {format(d, "EEE")}
                  </span>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-0.5 font-normal",
                    list.length === 0
                      ? "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      : "text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  )}
                >
                  {list.length} off
                </Badge>
              </div>

              {/* Leave Items */}
              <div className="p-3">
                {list.length > 0 ? (
                  <div className="space-y-2">
                    {list.slice(0, 4).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onOpen(r)}
                        className={cn(
                          "group/item flex w-full items-start gap-3 rounded-lg border border-transparent p-2.5 text-left transition-all hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-900/40",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {getInitials(leaveEmployeeLabel(r.employee))}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                              {leaveEmployeeLabel(r.employee)}
                            </p>
                            <div className="scale-90">
                              <LeaveTypeBadge type={r.type as any} />
                            </div>
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {formatIsoDate(r.startDate)} → {formatIsoDate(r.endDate)}
                          </div>
                        </div>
                      </button>
                    ))}

                    {list.length > 4 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                              +{list.length - 4} more
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="space-y-1 text-xs">
                              {list.slice(4).map((r) => (
                                <div key={r.id}>
                                  {leaveEmployeeLabel(r.employee)} • {r.type}
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500 italic">
                    No leave scheduled
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
