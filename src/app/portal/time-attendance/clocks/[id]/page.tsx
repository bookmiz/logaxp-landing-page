"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Clock3,
  MapPin,
  RefreshCcw,
  TimerReset,
  User2,
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type { TimeClock } from "@/logaxp/lib/time-management/timeManagement.types";
import { formatIsoDateTime, shortId } from "@/logaxp/components/time-management/time.ui";
import { computeClockDurationMinutes } from "@/logaxp/components/time-management/clocks/clock.utils";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function normalizeClock(raw: unknown): TimeClock | null {
  if (!raw) return null;
  if (typeof raw === "object" && raw !== null && "data" in (raw as any)) {
    return ((raw as any).data ?? null) as TimeClock | null;
  }
  return raw as TimeClock;
}

function getEmployeeName(clock: TimeClock | null) {
  const employee = (clock as any)?.employee;
  if (!employee) return shortId(clock?.employeeId);
  const full = [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" ").trim();
  return full || employee.preferredName || shortId(clock?.employeeId);
}

function getEmployeeMeta(clock: TimeClock | null) {
  const employee = (clock as any)?.employee;
  if (!employee) return shortId(clock?.employeeId);
  return employee.employeeNumber || employee.workEmail || employee.personalEmail || shortId(clock?.employeeId);
}

function getLocationLabel(clock: TimeClock | null) {
  const location = (clock as any)?.location;
  if (location?.name) return location.name;
  if (location?.code) return location.code;
  if (clock?.locationId) return shortId(clock.locationId);
  return "No location assigned";
}

function StatCard({
  title,
  value,
  hint,
  tone = "default",
}: {
  title: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "success";
}) {
  return (
    <Card
      className={cx(
        "rounded-3xl border shadow-sm",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      )}
    >
      <CardContent className="p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</div>
        {hint ? <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

export default function TimeClockDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();

  const clockId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const listHref = "/portal/time-attendance/clocks";

  const query = useQuery({
    queryKey: ["time", "clocks", "detail", clockId],
    enabled: Boolean(clockId),
    queryFn: () => timeManagementService.clocks.get(String(clockId)),
  });

  const clock = React.useMemo(() => normalizeClock(query.data), [query.data]);

  const isOpen = Boolean(clock?.id && (clock?.status === "OPEN" || !clock?.clockOutAt));
  const netMinutes = computeClockDurationMinutes(
    clock?.clockInAt ?? null,
    clock?.clockOutAt ?? null,
    clock?.breakMinutes ?? 0
  ) ?? 0;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(listHref);
  };

  return (
    <TimeShell
      title="Clock Detail"
      subtitle={clock?.id ? `Detailed record for ${shortId(clock.id)}` : "Detailed attendance record"}
      pill={isOpen ? "Open" : "Record"}
      requiredAnyCapabilities={["portal.time"]}
      actions={
        <>
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button variant="outline" onClick={refresh} disabled={query.isFetching}>
            <RefreshCcw className={cx("h-4 w-4", query.isFetching && "animate-spin")} />
            Refresh
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {query.isLoading ? (
          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
              Loading clock detail…
            </CardContent>
          </Card>
        ) : query.isError ? (
          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="Clock not found"
                description="The requested clock record could not be loaded."
                action={
                  <Button onClick={goBack} variant="outline">
                    Go back
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : !clock ? (
          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No record found"
                description="This clock record is unavailable."
                action={
                  <Button onClick={goBack} variant="outline">
                    Go back
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
              <div className="pointer-events-none absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

              <CardContent className="relative p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="muted"
                        className={cx(
                          "rounded-full",
                          isOpen
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                            : "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        )}
                      >
                        {isOpen ? "OPEN" : String(clock.status ?? "CLOSED")}
                      </Badge>

                      <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                        Clock #{shortId(clock.id)}
                      </div>
                    </div>

                    <div>
                      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                        {getEmployeeName(clock)}
                      </h1>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {getEmployeeMeta(clock)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {getLocationLabel(clock)}
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-slate-400" />
                        Created {formatIsoDateTime(clock.createdAt ?? null)}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                    <StatCard
                      title="Clock In"
                      value={formatIsoDateTime(clock.clockInAt ?? null)}
                      hint="Recorded start time"
                    />
                    <StatCard
                      title="Clock Out"
                      value={clock.clockOutAt ? formatIsoDateTime(clock.clockOutAt) : "Still open"}
                      hint="Recorded end time"
                    />
                    <StatCard
                      title="Break Minutes"
                      value={`${Number(clock.breakMinutes ?? 0)}m`}
                      hint="Total deducted break"
                    />
                    <StatCard
                      title="Net Minutes"
                      value={`${netMinutes}m`}
                      hint={isOpen ? "Live open clock total" : "Net worked duration"}
                      tone="success"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 xl:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    Attendance Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Clock in event
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {formatIsoDateTime(clock.clockInAt ?? null)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      The employee started attendance tracking at this time.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Clock out event
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {clock.clockOutAt ? formatIsoDateTime(clock.clockOutAt) : "Not yet clocked out"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {clock.clockOutAt
                        ? "This attendance record has been completed."
                        : "This record is still active and available for clock-out or break updates."}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <TimerReset className="h-3.5 w-3.5" />
                      Notes
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                      {clock.notes ? String(clock.notes) : "No notes were recorded for this clock entry."}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User2 className="h-4 w-4 text-slate-500" />
                      Employee Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Employee</div>
                      <div className="mt-1 font-medium text-slate-900 dark:text-slate-50">{getEmployeeName(clock)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Reference</div>
                      <div className="mt-1 text-slate-700 dark:text-slate-200">{getEmployeeMeta(clock)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Employee ID</div>
                      <div className="mt-1 text-slate-700 dark:text-slate-200">{shortId(clock.employeeId)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      Record Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Clock ID</div>
                      <div className="mt-1 break-all text-slate-700 dark:text-slate-200">{clock.id}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Tenant ID</div>
                      <div className="mt-1 break-all text-slate-700 dark:text-slate-200">
                        {shortId((clock as any)?.tenantId)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Location</div>
                      <div className="mt-1 text-slate-700 dark:text-slate-200">{getLocationLabel(clock)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Created</div>
                      <div className="mt-1 text-slate-700 dark:text-slate-200">{formatIsoDateTime(clock.createdAt ?? null)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Updated</div>
                      <div className="mt-1 text-slate-700 dark:text-slate-200">{formatIsoDateTime(clock.updatedAt ?? null)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </TimeShell>
  );
}