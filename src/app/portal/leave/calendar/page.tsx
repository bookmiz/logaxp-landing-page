"use client";

// src/app/portal/leave/calendar/page.tsx
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCcw, Calendar, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Skeleton } from "@/logaxp/components/ui/skeleton";

import { LeaveShell } from "@/logaxp/components/leave/LeaveShell";
import { LeaveCalendarBoard } from "@/logaxp/components/leave/LeaveCalendarBoard";

import { useLeaveCalendar } from "@/logaxp/hooks/leave/useLeaveRequests";
import { unwrapApi, type LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

import { cn } from "@/logaxp/lib/cn";

function todayIso() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function addDaysIso(baseIso: string, days: number) {
  const d = new Date(baseIso);
  if (Number.isNaN(d.getTime())) return baseIso;
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function PortalLeaveCalendarPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const [from, setFrom] = React.useState(todayIso());
  const [to, setTo] = React.useState(addDaysIso(todayIso(), 13)); // 2-week default view

  const q = useLeaveCalendar({ from, to }, true);

  const rows = (unwrapApi<LeaveRequest[]>(q.data as any) ?? []) as LeaveRequest[];

  const busy = q.isFetching || q.isLoading;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["leave", "calendar"] });
    toast({ tone: "success", title: "Calendar refreshed" });
  };

  // Quick presets (optional — very useful for calendars)
  const presets = [
    { label: "This week", days: 7 },
    { label: "Next 2 weeks", days: 14 },
    { label: "Next month", days: 30 },
  ];

  const applyPreset = (days: number) => {
    setFrom(todayIso());
    setTo(addDaysIso(todayIso(), days - 1));
  };

  return (
    <LeaveShell
      title="Leave Calendar"
      subtitle="See approved time off across the team — plan better, avoid overlaps."
      pill="Time & Leave • Calendar"
      requiredAnyPermissions={["leave.read"]}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => router.push("/portal/leave")} disabled={busy}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>

          <Button variant="outline" size="sm" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4 mr-2", busy && "animate-spin")} />
            Refresh
          </Button>
        </>
      }
    >
      {/* Hero / Filter Section */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-teal-950/30 border border-emerald-100/50 dark:border-emerald-900/30 shadow-xl">
        <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-800/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <div className="relative px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  From
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={cn(
                    "h-11 w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 text-sm shadow-sm",
                    "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100/70",
                    "dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950/40",
                    "backdrop-blur-sm transition-all"
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={cn(
                    "h-11 w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 text-sm shadow-sm",
                    "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100/70",
                    "dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950/40",
                    "backdrop-blur-sm transition-all"
                  )}
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <Button
                  key={p.label}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(p.days)}
                  className={cn(
                    "border-emerald-200/50 hover:bg-emerald-50/50 dark:border-emerald-800/50 dark:hover:bg-emerald-950/30",
                    "text-emerald-700 dark:text-emerald-300"
                  )}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status indicator */}
          {busy && (
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Updating calendar...
            </div>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      {q.isLoading || busy ? (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-900" />
              ))}
            </div>
          </div>
        </div>
      ) : q.isError ? (
        <Card className="rounded-3xl border border-red-200 bg-red-50/50 shadow-lg dark:border-red-900/40 dark:bg-red-950/20">
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
              Failed to load calendar
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-6">
              Please check your connection or try again later.
            </p>
            <Button onClick={refresh} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : rows.length ? (
        <div className="rounded-3xl border p-4 border-slate-200 bg-white shadow-xl overflow-hidden dark:border-slate-800 dark:bg-slate-950 transition-all hover:shadow-2xl">
          <LeaveCalendarBoard
            rows={rows}
            from={from}
            to={to}
            onOpen={(r) => router.push(`/portal/leave/${r.id}`)}
          />
        </div>
      ) : (
        <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-lg dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              No approved leave in this period
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
              Once leave requests are approved, they&apos;ll appear here so you can plan team coverage and avoid overlaps.
            </p>
            <Button
              onClick={() => router.push("/portal/leave")}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              View Leave Requests
            </Button>
          </CardContent>
        </Card>
      )}
    </LeaveShell>
  );
}