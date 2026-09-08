"use client";

import * as React from "react";
import { RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { PayrollNavCards } from "@/logaxp/components/time-management/payroll/PayrollNavCards";

import { PayPeriodPicker } from "@/logaxp/components/time-management/payroll/PayPeriodPicker";
import { ApprovalsQueueTable } from "@/logaxp/components/time-management/payroll/ApprovalsQueueTable";
import { BulkDecisionDialog } from "@/logaxp/components/time-management/payroll/BulkDecisionDialog";

import { useTimesheets, useApproveTimesheet, useRejectTimesheet } from "@/logaxp/hooks/time-management/useTimePayroll";
import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { normalizeList } from "@/logaxp/lib/time-management/timePayroll.types";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function ApprovalsQueuePage() {
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const [payPeriodId, setPayPeriodId] = React.useState<string | null>(null);
  const [employeeId, setEmployeeId] = React.useState("");
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const listQ = useTimesheets(
    {
      payPeriodId: payPeriodId ?? undefined,
      employeeId: employeeId.trim() || undefined,
      status: "SUBMITTED" as any,
    },
    Boolean(payPeriodId)
  );

  const approveM = useApproveTimesheet();
  const rejectM = useRejectTimesheet();

  const { items } = normalizeList(listQ.data ?? null);
  const rows = items as Timesheet[];

  const busy = listQ.isFetching || approveM.isPending || rejectM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["timesheets"] });
    await qc.invalidateQueries({ queryKey: ["pay-periods"] });
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  const selectedIds = React.useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  React.useEffect(() => {
    // reset selections when list changes (keep only still-visible selections)
    const next: Record<string, boolean> = {};
    for (const r of rows) if (selected[r.id]) next[r.id] = true;
    setSelected(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  // dialogs
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [bulkMode, setBulkMode] = React.useState<"approve" | "reject">("approve");

  const doBulk = async (mode: "approve" | "reject", decisionNote?: string | null) => {
    const note = decisionNote ?? undefined;

    for (const id of selectedIds) {
      if (mode === "approve") await approveM.mutateAsync({ id, dto: { decisionNote: note } });
      else await rejectM.mutateAsync({ id, dto: { decisionNote: note } });
    }

    toast({
      tone: "success",
      title: mode === "approve" ? "Timesheets approved" : "Timesheets rejected",
      description: `${selectedIds.length} processed`,
    });

    setSelected({});
    await refresh();
  };

  return (
    <TimeShell
      title="Approvals Queue"
      subtitle="Submitted timesheets awaiting supervisor/HR decision."
      pill="Time • Payroll • Approvals"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          <Button
            disabled={busy || selectedIds.length === 0}
            onClick={() => {
              setBulkMode("approve");
              setBulkOpen(true);
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Bulk approve
          </Button>

          <Button
            variant="outline"
            disabled={busy || selectedIds.length === 0}
            onClick={() => {
              setBulkMode("reject");
              setBulkOpen(true);
            }}
          >
            <XCircle className="h-4 w-4" />
            Bulk reject
          </Button>
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard title="Approvals" description="High-trust approvals with selection + audit notes." />
        <PayrollNavCards />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Pay Period</div>

            {/* ✅ FIX: PayPeriodPicker expects onPick, not onChange */}
            <PayPeriodPicker valueId={payPeriodId} onPick={setPayPeriodId} allowClear />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Employee ID (optional)</div>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="employeeId…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>
        </div>

        {!payPeriodId ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState title="Select a pay period" description="Approvals are managed per pay period." />
            </CardContent>
          </Card>
        ) : listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
              Loading submitted timesheets…
            </CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load approvals queue.</CardContent>
          </Card>
        ) : rows.length ? (
          <ApprovalsQueueTable
            rows={rows}
            busy={busy}
            selected={selected}
            onToggle={(id: string, v) => setSelected((s) => ({ ...s, [id]: v }))}
            onToggleAll={(v) => {
              const next: Record<string, boolean> = {};
              for (const r of rows) next[r.id] = v;
              setSelected(next);
            }}
          />
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState title="No submitted timesheets" description="Nothing to approve in this pay period." />
            </CardContent>
          </Card>
        )}

        <BulkDecisionDialog
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          mode={bulkMode}
          count={selectedIds.length}
          busy={approveM.isPending || rejectM.isPending}
          onSubmit={async ({ decisionNote }: { decisionNote?: string | null }) => {
            await doBulk(bulkMode, decisionNote ?? null);
          }}
        />
      </div>
    </TimeShell>
  );
}