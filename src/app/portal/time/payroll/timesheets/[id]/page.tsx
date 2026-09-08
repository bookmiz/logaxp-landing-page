"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeBanner } from "@/logaxp/components/time-management/feedback/TimeBanner";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { getPermissions } from "@/logaxp/lib/auth/portalAuthz";

import {
  useTimesheet,
  useApproveTimesheet,
  useRejectTimesheet,
} from "@/logaxp/hooks/time-management/useTimePayroll";

import { formatIsoDateTime, formatMinutes, shortId } from "@/logaxp/components/time-management/time.ui";

export default function TimesheetDetailPage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const id = typeof params.id === "string" ? params.id : "";

  const membership = useAuthStore((s) => s.membership);
  const perms = React.useMemo(() => getPermissions(membership), [membership]);
  const canDecide = perms.includes("time.admin");

  const q = useTimesheet(id, true);
  const busy = q.isFetching;

  const approveM = useApproveTimesheet();
  const rejectM = useRejectTimesheet();

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["timesheets", "get", id] });
    await qc.invalidateQueries({ queryKey: ["timesheets"] });
    await qc.invalidateQueries({ queryKey: ["pay-periods"] });
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  const t = (q.data?.data as any) ?? null;

  const confirmOrThrow = async (msg: string) => {
    const ok = window.confirm(msg);
    if (!ok) throw new Error("cancelled");
  };

  const decideBusy = approveM.isPending || rejectM.isPending;

  const onApprove = async () => {
    if (!t) return;
    try {
      await confirmOrThrow("Approve this timesheet?");
      await approveM.mutateAsync({ id: t.id, dto: {} as any });
      toast({ tone: "success", title: "Timesheet approved" });
      await refresh();
    } catch (e) {
      if ((e as any)?.message !== "cancelled") toast({ tone: "error", title: "Failed to approve timesheet" });
    }
  };

  const onReject = async () => {
    if (!t) return;
    try {
      await confirmOrThrow("Reject this timesheet?");
      // If your backend REQUIRES a reason/note, wire a dialog instead of {}.
      await rejectM.mutateAsync({ id: t.id, dto: {} as any });
      toast({ tone: "success", title: "Timesheet rejected" });
      await refresh();
    } catch (e) {
      if ((e as any)?.message !== "cancelled") toast({ tone: "error", title: "Failed to reject timesheet" });
    }
  };

  return (
    <TimeShell
      title="Timesheet Detail"
      subtitle="Audit-friendly view of a single timesheet."
      pill="Time • Payroll • Timesheets"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy || decideBusy}>
            <RefreshCcw className={busy || decideBusy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>

          {canDecide && t ? (
            <>
              <Button
                variant="outline"
                onClick={onReject}
                disabled={busy || decideBusy || String(t.status) !== "SUBMITTED"}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={onApprove}
                disabled={busy || decideBusy || String(t.status) !== "SUBMITTED"}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            </>
          ) : null}
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/portal/time/payroll/timesheets"
            className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timesheets
          </Link>

          {t ? (
            <Badge variant="muted" className="rounded-full">
              {shortId(t.id)}
            </Badge>
          ) : null}
        </div>

        {t && String(t.status) === "REJECTED" && t.decisionNote ? (
          <TimeBanner tone="warning" title="Rejected">
            {t.decisionNote}
          </TimeBanner>
        ) : null}

        {q.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading timesheet…</CardContent>
          </Card>
        ) : q.isError || !t ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load timesheet.</CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Summary</CardTitle>
              <CardDescription>
                Employee: {shortId(t.employeeId)} • PayPeriod: {shortId(t.payPeriodId)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <div>
                Status: <span className="font-medium">{String(t.status)}</span>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
                  <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">
                    {formatMinutes(t.totalMinutes)}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Regular</div>
                  <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">
                    {formatMinutes(t.regularMinutes)}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/25">
                  <div className="text-xs text-amber-800/80 dark:text-amber-200/80">Overtime</div>
                  <div className="mt-1 font-semibold text-amber-900 dark:text-amber-200">
                    {formatMinutes(t.overtimeMinutes)}
                  </div>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-900/40 dark:bg-sky-950/25">
                  <div className="text-xs text-sky-800/80 dark:text-sky-200/80">Double Time</div>
                  <div className="mt-1 font-semibold text-sky-900 dark:text-sky-200">
                    {formatMinutes(t.doubleTimeMinutes)}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div>Submitted: {t.submittedAt ? formatIsoDateTime(t.submittedAt) : "—"}</div>
                <div>Decided: {t.decidedAt ? formatIsoDateTime(t.decidedAt) : "—"}</div>
              </div>

              {t.decisionNote ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Decision note</div>
                  <div className="mt-1 text-slate-700 dark:text-slate-200">{t.decisionNote}</div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </TimeShell>
  );
}
