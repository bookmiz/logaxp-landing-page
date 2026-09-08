"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { PayrollNavCards } from "@/logaxp/components/time-management/payroll/PayrollNavCards";

import { PayPeriodPicker } from "@/logaxp/components/time-management/payroll/PayPeriodPicker";
import { PayrollRunHeaderCard } from "@/logaxp/components/time-management/payroll/PayrollRunHeaderCard";
import { PayrollRunTable } from "@/logaxp/components/time-management/payroll/PayrollRunTable";
import { PayrollExportMenu } from "@/logaxp/components/time-management/payroll/PayrollExportMenu";

import { useTimesheets, usePayPeriods } from "@/logaxp/hooks/time-management/useTimePayroll";
import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { normalizeList } from "@/logaxp/lib/time-management/timePayroll.types";

import { toCsv, downloadCsv, type CsvColumn } from "@/logaxp/components/time-management/export/exportCsv";
import { fetchAllPages } from "@/logaxp/components/time-management/export/exportFetchAll";
import { timePayrollService } from "@/logaxp/lib/time-management/timePayrollService";
import { formatIsoDateTime, shortId } from "@/logaxp/components/time-management/time.ui";
import { TimeBanner } from "@/logaxp/components/time-management/feedback/TimeBanner";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const PAYROLL_COLUMNS: CsvColumn<Timesheet>[] = [
  { header: "timesheetId", value: (r) => r.id },
  { header: "employeeId", value: (r) => r.employeeId },
  { header: "payPeriodId", value: (r) => r.payPeriodId },
  { header: "status", value: (r) => String(r.status ?? "") },
  { header: "totalMinutes", value: (r) => r.totalMinutes ?? 0 },
  { header: "regularMinutes", value: (r) => r.regularMinutes ?? 0 },
  { header: "overtimeMinutes", value: (r) => r.overtimeMinutes ?? 0 },
  { header: "doubleTimeMinutes", value: (r) => r.doubleTimeMinutes ?? 0 },
  { header: "submittedAt", value: (r) => r.submittedAt ?? "" },
  { header: "approvedAt", value: (r) => r.decidedAt ?? "" },
  { header: "approvedByUserId", value: (r) => r.decidedByUserId ?? "" },
];

export default function PayrollRunPage() {
  const qc = useQueryClient();

  const [payPeriodId, setPayPeriodId] = React.useState<string | null>(null);
  const [exportBusy, setExportBusy] = React.useState(false);
  const [exportNote, setExportNote] = React.useState("");

  // Period metadata for header
  const periodsQ = usePayPeriods({ page: 1, pageSize: 50 }, true);
  const periods = normalizeList(periodsQ.data ?? null).items;
  const activePeriod = periods.find((p) => p.id === payPeriodId) ?? null;

  // Approved sheets for selected period
  const listQ = useTimesheets(
    {
      payPeriodId: payPeriodId ?? undefined,
      status: payPeriodId ? ("APPROVED" as any) : undefined,
    },
    Boolean(payPeriodId)
  );

  const { items } = normalizeList(listQ.data ?? null);
  const rows = React.useMemo(() => [...(items as Timesheet[])], [items]);

  const busy = listQ.isFetching || periodsQ.isFetching;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["pay-periods"] });
    await qc.invalidateQueries({ queryKey: ["timesheets"] });
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  const exportPage = async () => {
    setExportNote("");
    if (!payPeriodId) return;
    downloadCsv(
      `payroll_${shortId(payPeriodId)}_APPROVED_page.csv`,
      toCsv(rows, PAYROLL_COLUMNS)
    );
  };

  const exportAll = async () => {
    if (!payPeriodId) return;
    setExportBusy(true);
    setExportNote("");
    try {
      const { items: all, truncated } = await fetchAllPages<Timesheet>({
        fetchPage: ({ page, pageSize }) =>
          timePayrollService.timesheets.list({
            payPeriodId,
            status: "APPROVED" as any,
            // backend list doesn’t paginate in your controller signature;
            // if you later add pagination, this will still work.
            page,
            pageSize,
          } as any),
        pageSize: 200,
        maxRows: 5000,
        hardMaxPages: 50,
      });

      downloadCsv(
        `payroll_${shortId(payPeriodId)}_APPROVED_ALL.csv`,
        toCsv(all, PAYROLL_COLUMNS)
      );

      if (truncated) setExportNote("Export truncated at 5,000 rows. Narrow filters.");
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <TimeShell
      title="Payroll Run"
      subtitle="Select pay period → export approved time (regular + OT + DT)."
      pill="Time • Payroll • Run"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy || exportBusy}>
            <RefreshCcw className={cn("h-4 w-4", (busy || exportBusy) && "animate-spin")} />
            Refresh
          </Button>

          <PayrollExportMenu
            disabled={!payPeriodId || busy}
            busy={exportBusy}
            onExportPage={exportPage}
            onExportAll={exportAll}
            hint="All export capped at 5,000 rows."
          />
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        {exportNote ? (
          <TimeBanner tone="warning" title="Export notice">
            {exportNote}
          </TimeBanner>
        ) : null}

        <TimeHeroCard title="Payroll" description="This is your payroll-ready export surface." />
        <PayrollNavCards />

        <PayrollRunHeaderCard
          left={
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Pay Period
              </div>
              <PayPeriodPicker valueId={payPeriodId} onPick={setPayPeriodId} allowClear />
            </div>
          }
          right={
            activePeriod ? (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Window:{" "}
                <span className="font-medium">
                  {formatIsoDateTime(activePeriod.startAt)} → {formatIsoDateTime(activePeriod.endAt)}
                </span>
                <div className="mt-1">
                  Status: <span className="font-medium">{String(activePeriod.status ?? "OPEN")}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Choose a pay period to load approved timesheets.
              </div>
            )
          }
        />

        {!payPeriodId ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="Select a pay period"
                description="Payroll exports are scoped to one pay period."
              />
            </CardContent>
          </Card>
        ) : listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
              Loading approved timesheets…
            </CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
              Failed to load payroll run items.
            </CardContent>
          </Card>
        ) : rows.length ? (
          <PayrollRunTable rows={rows} />
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No approved timesheets"
                description="Approve submitted timesheets for this pay period before export."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </TimeShell>
  );
}