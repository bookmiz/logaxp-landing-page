// src/app/portal/time/payroll/page.tsx
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw, Plus, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Badge } from "@/logaxp/components/ui/badge";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { TimeRangePicker } from "@/logaxp/components/time-management/TimeRangePicker";
import { TimeBanner } from "@/logaxp/components/time-management/feedback/TimeBanner";

import { useTimeRange } from "@/logaxp/hooks/time-management/useTimeRange";
import { toIsoStart, toIsoEnd, formatMinutes } from "@/logaxp/components/time-management/time.ui";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";
import type { TimesheetScope } from "@/logaxp/components/time-management/payroll/TimesheetFilters";

import type { PayPeriod, Timesheet, OvertimeCalcResult } from "@/logaxp/lib/time-management/timePayroll.types";
import { normalizePayPeriodsList, normalizeTimesheetsList } from "@/logaxp/components/time-management/payroll/payroll.ui";

import {
  usePayPeriods,
  useGeneratePayPeriods,
  useLockPayPeriod,
  useUnlockPayPeriod,
  useTimesheets,
  useSubmitTimesheet,
  useApproveTimesheet,
  useRejectTimesheet,
  useOvertimePolicy,
  useCalcOvertime,
} from "@/logaxp/hooks/time-management/useTimePayroll";

import { PayPeriodFilters } from "@/logaxp/components/time-management/payroll/PayPeriodFilters";
import { PayPeriodsTable } from "@/logaxp/components/time-management/payroll/PayPeriodsTable";
import { TimesheetFilters } from "@/logaxp/components/time-management/payroll/TimesheetFilters";
import { TimesheetsTable } from "@/logaxp/components/time-management/payroll/TimesheetsTable";

import { GeneratePayPeriodsDialog } from "@/logaxp/components/time-management/payroll/GeneratePayPeriodsDialog";
import { OvertimePolicyDialog } from "@/logaxp/components/time-management/payroll/OvertimePolicyDialog";
import { CalcOvertimeDialog } from "@/logaxp/components/time-management/payroll/CalcOvertimeDialog";
import { DecideTimesheetDialog } from "@/logaxp/components/time-management/payroll/DecideTimesheetDialog";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function numFromQs(v: string | null, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

function Spark() {
  return <span className="inline-block h-4 w-4 rounded-full bg-emerald-200 dark:bg-emerald-900/40" />;
}

export default function PortalTimePayrollPage() {
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const tenant = useAuthStore((s) => s.tenant);

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const range = useTimeRange({ syncToUrl: true, defaultDaysBack: 30 });
  const fromIso = React.useMemo(() => toIsoStart(range.from), [range.from]);
  const toIso = React.useMemo(() => toIsoEnd(range.to), [range.to]);
  const rangeOk = Boolean(fromIso && toIso);

  // session context
  const membership = useAuthStore((s) => s.membership);
  const employeeIdMe = useAuthStore((s) => s.employee?.id ?? null);

  // ----------------------------
  // URL state: Pay periods
  // ----------------------------
  const ppPage0 = numFromQs(sp.get("ppPage"), 1);
  const ppPageSize0 = numFromQs(sp.get("ppPageSize"), 20);
  const ppStatus0 = sp.get("ppStatus") ?? "";
  const ppFrom0 = sp.get("ppFrom") ?? "";
  const ppTo0 = sp.get("ppTo") ?? "";

  const [ppPage, setPpPage] = React.useState(ppPage0);
  const [ppPageSize, setPpPageSize] = React.useState(ppPageSize0);
  const [ppStatus, setPpStatus] = React.useState(ppStatus0);
  const [ppFrom, setPpFrom] = React.useState(ppFrom0);
  const [ppTo, setPpTo] = React.useState(ppTo0);

  // ----------------------------
  // URL state: Timesheets
  // ----------------------------
  const tsPage0 = numFromQs(sp.get("tsPage"), 1);
  const tsPageSize0 = numFromQs(sp.get("tsPageSize"), 20);
  const tsStatus0 = sp.get("tsStatus") ?? "";
  const tsEmployeeId0 = sp.get("tsEmployeeId") ?? "";
  const tsPayPeriodId0 = sp.get("tsPayPeriodId") ?? "";

  const [tsPage, setTsPage] = React.useState(tsPage0);
  const [tsPageSize, setTsPageSize] = React.useState(tsPageSize0);
  const [tsStatus, setTsStatus] = React.useState(tsStatus0);
  const [tsEmployeeId, setTsEmployeeId] = React.useState(tsEmployeeId0);
  const [tsPayPeriodId, setTsPayPeriodId] = React.useState(tsPayPeriodId0);
  const [tsQ, setTsQ] = React.useState("");
  const [tsScope, setTsScope] = React.useState<TimesheetScope>("workspace");

  // ----------------------------
  // Tab
  // ----------------------------
  const tab0 = (sp.get("tab") ?? "periods") as "periods" | "timesheets" | "overtime";
  const [tab, setTab] = React.useState(tab0);

  // keep URL in sync
  React.useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));

    next.set("tab", tab);

    // pay periods
    next.set("ppPage", String(ppPage));
    next.set("ppPageSize", String(ppPageSize));
    setOrDel("ppStatus", ppStatus.trim());
    setOrDel("ppFrom", ppFrom.trim());
    setOrDel("ppTo", ppTo.trim());

    // timesheets
    next.set("tsPage", String(tsPage));
    next.set("tsPageSize", String(tsPageSize));
    setOrDel("tsStatus", tsStatus.trim());
    setOrDel("tsEmployeeId", tsEmployeeId.trim());
    setOrDel("tsPayPeriodId", tsPayPeriodId.trim());

    const nextQs = next.toString();
    if (nextQs !== sp.toString()) router.replace(`${pathname}?${nextQs}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tab,
    ppPage,
    ppPageSize,
    ppStatus,
    ppFrom,
    ppTo,
    tsPage,
    tsPageSize,
    tsStatus,
    tsEmployeeId,
    tsPayPeriodId,
  ]);

  React.useEffect(() => setPpPage(1), [ppStatus, ppFrom, ppTo]);
  React.useEffect(() => setTsPage(1), [tsStatus, tsEmployeeId, tsPayPeriodId]);

  // ----------------------------
  // Queries
  // ----------------------------
  const payPeriodsQ = usePayPeriods(
    {
      page: ppPage,
      pageSize: ppPageSize,
      status: ppStatus || undefined,
      from: ppFrom || undefined,
      to: ppTo || undefined,
    } as any,
    tab === "periods"
  );

  const timesheetsQ = useTimesheets(
    {
      page: tsPage,
      pageSize: tsPageSize,
      employeeId: tsEmployeeId || undefined,
      payPeriodId: tsPayPeriodId || undefined,
      status: tsStatus || undefined,
    } as any,
    tab === "timesheets"
  );

  const overtimePolicyQ = useOvertimePolicy(); // ok to keep always; cheap + cached
  const calcOvertimeM = useCalcOvertime(); // ✅ mutation

  const { items: payPeriods, meta: ppMeta } = normalizePayPeriodsList(payPeriodsQ.data ?? null);
  const { items: timesheets, meta: tsMeta } = normalizeTimesheetsList(timesheetsQ.data ?? null);

  // ----------------------------
  // Mutations
  // ----------------------------
  const genPayPeriodsM = useGeneratePayPeriods();
  const lockPayPeriodM = useLockPayPeriod();
  const unlockPayPeriodM = useUnlockPayPeriod();

  const submitTimesheetM = useSubmitTimesheet();
  const approveTimesheetM = useApproveTimesheet();
  const rejectTimesheetM = useRejectTimesheet();

  // ----------------------------
  // Busy + refresh
  // ----------------------------
  const busy =
    payPeriodsQ.isFetching ||
    timesheetsQ.isFetching ||
    overtimePolicyQ.isFetching ||
    genPayPeriodsM.isPending ||
    lockPayPeriodM.isPending ||
    unlockPayPeriodM.isPending ||
    submitTimesheetM.isPending ||
    approveTimesheetM.isPending ||
    rejectTimesheetM.isPending ||
    calcOvertimeM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["time"] as any });
    await qc.invalidateQueries({ queryKey: ["pay-periods"] as any });
    await qc.invalidateQueries({ queryKey: ["timesheets"] as any });
    toast({ tone: "success", title: "Refreshed" });
  };

  // ----------------------------
  // Dialogs
  // ----------------------------
  const [genOpen, setGenOpen] = React.useState(false);
  const [policyOpen, setPolicyOpen] = React.useState(false);
  const [calcOpen, setCalcOpen] = React.useState(false);

  const [decideOpen, setDecideOpen] = React.useState(false);
  const [decideMode, setDecideMode] = React.useState<"approve" | "reject">("approve");
  const [activeTimesheet, setActiveTimesheet] = React.useState<Timesheet | null>(null);

  // overtime result (local)
  const [lastOvertime, setLastOvertime] = React.useState<OvertimeCalcResult | null>(null);

  return (
    <TimeShell
      title="Payroll"
      subtitle="Pay periods, timesheets, and overtime — approval-ready and lock-safe."
      pill="Time & Leave • Payroll"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          {tab === "periods" ? (
            <Button onClick={() => setGenOpen(true)} disabled={busy}>
              <Plus className="h-4 w-4" />
              Generate pay periods
            </Button>
          ) : null}

          {tab === "overtime" ? (
            <>
              <Button variant="outline" onClick={() => setPolicyOpen(true)} disabled={busy}>
                <Spark />
                Overtime policy
              </Button>
              <Button onClick={() => setCalcOpen(true)} disabled={busy}>
                Calculate overtime
              </Button>
            </>
          ) : null}
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard
          title="Payroll Center"
          description="Lock pay periods, submit/approve timesheets, and calculate overtime."
          right={
            <TimeRangePicker
              from={range.from}
              to={range.to}
              onChange={(v) => {
                range.setFrom(v.from);
                range.setTo(v.to);
              }}
              onLast7={() => range.setLastNDays(7)}
              onLast30={() => range.setLastNDays(30)}
              onThisMonth={() => range.setThisMonth()}
              compact
            />
          }
        />

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("periods")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              tab === "periods"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            )}
          >
            Pay periods
          </button>

          <button
            type="button"
            onClick={() => setTab("timesheets")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              tab === "timesheets"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            )}
          >
            Timesheets
          </button>

          <button
            type="button"
            onClick={() => setTab("overtime")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              tab === "overtime"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            )}
          >
            Overtime
          </button>

          <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
            Workspace:{" "}
           <span className="font-medium">{tenant?.name ?? membership?.tenantId ?? "—"}</span>
          </div>
        </div>

        {/* ---------------- Pay Periods ---------------- */}
        {tab === "periods" ? (
          <>
            <PayPeriodFilters
              status={ppStatus}
              onStatus={setPpStatus}
              from={ppFrom}
              onFrom={setPpFrom}
              to={ppTo}
              onTo={setPpTo}
              pageSize={ppPageSize}
              onPageSize={setPpPageSize}
              onReset={() => {
                setPpStatus("");
                setPpFrom("");
                setPpTo("");
                setPpPageSize(20);
              }}
              right={
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Range helper: <span className="font-medium">{range.from}</span> →{" "}
                  <span className="font-medium">{range.to}</span>
                </div>
              }
            />

            {payPeriodsQ.isLoading ? (
              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
                  Loading pay periods…
                </CardContent>
              </Card>
            ) : payPeriodsQ.isError ? (
              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
                  Failed to load pay periods.
                </CardContent>
              </Card>
            ) : payPeriods.length ? (
              <PayPeriodsTable
                rows={payPeriods as PayPeriod[]}
                total={ppMeta.total}
                page={ppPage}
                pageSize={ppPageSize}
                onPage={setPpPage}
                busy={busy}
                onLock={async (id: string) => {
                  await lockPayPeriodM.mutateAsync(id);
                  toast({ tone: "success", title: "Pay period locked" });
                  await refresh();
                }}
                onUnlock={async (id: string) => {
                  await unlockPayPeriodM.mutateAsync(id);
                  toast({ tone: "success", title: "Pay period unlocked" });
                  await refresh();
                }}
              />
            ) : (
              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-6">
                  <EmptyState
                    title="No pay periods"
                    description="Generate pay periods to enable timesheets and payroll locking."
                    action={
                      <Button onClick={() => setGenOpen(true)} disabled={busy}>
                        <Plus className="h-4 w-4" />
                        Generate
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            )}
          </>
        ) : null}

        {/* ---------------- Timesheets ---------------- */}
        {tab === "timesheets" ? (
          <>
            {!tsPayPeriodId ? (
              <TimeBanner tone="warning" title="Tip">
                Select a pay period (from the Pay periods tab) to manage timesheets. You can still list by employee/status.
              </TimeBanner>
            ) : null}

            <TimesheetFilters
              q={tsQ}
              onQ={setTsQ}
              scope={tsScope}
              onScope={setTsScope}
              canUseMeScope={Boolean(employeeIdMe)}
              status={tsStatus}
              onStatus={setTsStatus}
              employeeId={tsEmployeeId}
              onEmployeeId={setTsEmployeeId}
              payPeriodId={tsPayPeriodId}
              onPayPeriodId={setTsPayPeriodId}
              onReset={() => {
                setTsStatus("");
                setTsEmployeeId("");
                setTsPayPeriodId("");
                setTsQ("");
                setTsScope("workspace");
              }}
            />

            {timesheetsQ.isLoading ? (
              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
                  Loading timesheets…
                </CardContent>
              </Card>
            ) : timesheetsQ.isError ? (
              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
                  Failed to load timesheets.
                </CardContent>
              </Card>
            ) : timesheets.length ? (
              <TimesheetsTable
                  rows={timesheets as Timesheet[]}
                  page={tsPage}
                  pageSize={tsPageSize}
                  total={tsMeta.total}
                  onPage={setTsPage}
                  busy={busy}
                  canSubmit={true /* compute from perms later */}
                  canDecide={true /* compute from perms later */}
                  onSubmit={async (row) => {
                    await submitTimesheetM.mutateAsync({ employeeId: row.employeeId, payPeriodId: row.payPeriodId });
                    toast({ tone: "success", title: "Timesheet submitted" });
                    await refresh();
                  }}
                  onApprove={(row) => {
                    setActiveTimesheet(row);
                    setDecideMode("approve");
                    setDecideOpen(true);
                  }}
                  onReject={(row) => {
                    setActiveTimesheet(row);
                    setDecideMode("reject");
                    setDecideOpen(true);
                  }}
                />
            ) : (
              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-6">
                  <EmptyState
                    title="No timesheets"
                    description="Once pay periods exist, employees can submit timesheets and supervisors can approve them."
                    action={
                      <Button variant="outline" onClick={() => setTab("periods")}>
                        Go to pay periods
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            )}
          </>
        ) : null}

        {/* ---------------- Overtime ---------------- */}
        {tab === "overtime" ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Overtime</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Configure policy and calculate overtime for an employee.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setPolicyOpen(true)} disabled={busy}>
                    Edit policy
                  </Button>
                  <Button onClick={() => setCalcOpen(true)} disabled={busy}>
                    Calculate
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <InfoCard
                  label="Weekly threshold"
                  value={`${(overtimePolicyQ.data as any)?.data?.weeklyThresholdHours ?? "—"}h`}
                />
                <InfoCard
                  label="Daily threshold"
                  value={`${(overtimePolicyQ.data as any)?.data?.dailyThresholdHours ?? "—"}h`}
                />
                <InfoCard
                  label="Multiplier"
                  value={`${(overtimePolicyQ.data as any)?.data?.multiplier ?? "—"}x`}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {employeeIdMe ? (
                  <Badge variant="muted" className="rounded-full">
                    Me: {employeeIdMe}
                  </Badge>
                ) : (
                  <Badge variant="muted" className="rounded-full">
                    No employee context in session
                  </Badge>
                )}
              </div>

              {lastOvertime ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <div className="font-medium">Overtime result</div>
                  <div className="mt-1">
  Regular: <span className="font-semibold">{formatMinutes(lastOvertime.totals.regularMinutes)}</span>{" "}
  • OT: <span className="font-semibold">{formatMinutes(lastOvertime.totals.overtimeMinutes)}</span>{" "}
  • DT: <span className="font-semibold">{formatMinutes(lastOvertime.totals.doubleTimeMinutes)}</span>
</div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {/* dialogs */}
        <GeneratePayPeriodsDialog
          open={genOpen}
          onOpenChange={setGenOpen}
          busy={genPayPeriodsM.isPending}
          onGenerate={async (dto) => {
            await genPayPeriodsM.mutateAsync(dto);
            toast({ tone: "success", title: "Pay periods generated" });
            await refresh();
          }}
        />

        <OvertimePolicyDialog
          open={policyOpen}
          onOpenChange={setPolicyOpen}
          policy={overtimePolicyQ.data ?? null}
          busy={busy}
          onSaved={async () => {
            toast({ tone: "success", title: "Overtime policy updated" });
            await refresh();
          }}
        />

        <CalcOvertimeDialog
          open={calcOpen}
          onOpenChange={setCalcOpen}
          defaultEmployeeId={employeeIdMe}
          defaultFrom={fromIso || ""}
          defaultTo={toIso || ""}
          busy={busy}
          onCalc={async ({ employeeId, from, to }) => {
            const res = await calcOvertimeM.mutateAsync({ employeeId, from, to } as any);
            const result = (res as any)?.data ?? (res as any)?.data?.data ?? null;
            if (result) setLastOvertime(result as OvertimeCalcResult);
            toast({ tone: "success", title: "Overtime calculated" });
          }}
        />

       <DecideTimesheetDialog
          open={decideOpen}
          onOpenChange={setDecideOpen}
          mode={decideMode}
          sheet={activeTimesheet}
          busy={busy}
          onDecide={async (id, dto) => {
            if (!id) return;

            const decisionNote = dto?.decisionNote ?? undefined;

            if (decideMode === "approve") {
              await approveTimesheetM.mutateAsync({ id, dto: { decisionNote } });
              toast({ tone: "success", title: "Timesheet approved" });
            } else {
              await rejectTimesheetM.mutateAsync({ id, dto: { decisionNote } });
              toast({ tone: "success", title: "Timesheet rejected" });
            }

            await refresh();
          }}
        />
      </div>
    </TimeShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/20">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{value}</div>
    </div>
  );
}