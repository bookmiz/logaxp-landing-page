"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { TimesheetStatusBadge } from "./TimesheetStatusBadge";
import { shortId } from "@/logaxp/components/time-management/time.ui";

type Mode = "approve" | "reject";

export function DecideTimesheetDialog({
  open,
  onOpenChange,
  mode,
  sheet,
  busy,
  onDecide,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  sheet: Timesheet | null;
  busy?: boolean;
  onDecide: (id: string, dto: { decisionNote?: string }) => void | Promise<void>;
}) {
  const [decisionNote, setDecisionNote] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setDecisionNote("");
  }, [open]);

  const submit = async () => {
    if (!sheet?.id) return;
    await onDecide(sheet.id, { decisionNote: decisionNote.trim() || undefined });
    onOpenChange(false);
  };

  const title = mode === "approve" ? "Approve Timesheet" : "Reject Timesheet";
  const Icon = mode === "approve" ? CheckCircle2 : XCircle;
  const payPeriodLabel =
    typeof sheet?.payPeriod?.label === "string" && sheet.payPeriod.label.trim()
      ? sheet.payPeriod.label
      : `PayPeriod ${shortId(sheet?.payPeriodId ?? null)}`;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={title}
      subtitle="Decision writes an audit trail and finalizes the timesheet state."
      widthClassName="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <Icon className="h-4 w-4" />
            {mode === "approve" ? "Approve" : "Reject"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Badge variant="muted" className="rounded-full">
          <Icon className="h-3.5 w-3.5" />
          Payroll • Timesheets
        </Badge>

        {sheet ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900 dark:text-slate-50">
                  {payPeriodLabel}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Sheet {shortId(sheet.id)} • Employee {shortId(sheet.employeeId)}
                </div>
              </div>
              <TimesheetStatusBadge status={sheet.status} />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Decision note (optional)</div>
          <textarea
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            rows={4}
            placeholder="Add context for audit trail…"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
          />
        </div>
      </div>
    </Modal>
  );
}
