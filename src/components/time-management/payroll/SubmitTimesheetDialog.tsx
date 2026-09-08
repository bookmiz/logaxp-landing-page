"use client";

import * as React from "react";
import { Save, Send } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import { PayPeriodPicker } from "@/logaxp/components/time-management/payroll/PayPeriodPicker";
import type { PayPeriod } from "@/logaxp/lib/time-management/timePayroll.types";

export function SubmitTimesheetDialog({
  open,
  onOpenChange,
  busy,
  defaultEmployeeId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  busy?: boolean;
  defaultEmployeeId: string | null;
  onSubmit: (dto: { employeeId: string; payPeriodId: string }) => void | Promise<void>;
}) {
  const [employeeId, setEmployeeId] = React.useState(defaultEmployeeId ?? "");
  const [payPeriodId, setPayPeriodId] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setEmployeeId(defaultEmployeeId ?? "");
    setPayPeriodId("");
    setError("");
  }, [open, defaultEmployeeId]);

  const submit = async () => {
    setError("");
    if (!employeeId.trim()) return setError("employeeId is required.");
    if (!payPeriodId.trim()) return setError("payPeriodId is required.");
    await onSubmit({ employeeId: employeeId.trim(), payPeriodId: payPeriodId.trim() });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Submit Timesheet"
      subtitle="Create/submit a timesheet for a specific employee and pay period."
      widthClassName="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Badge variant="muted" className="rounded-full">
          <Save className="h-3.5 w-3.5" />
          Payroll • Timesheets
        </Badge>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Employee ID</div>
          <input
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="employeeId…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
          />
          {defaultEmployeeId ? (
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Defaulted from session. You can override.
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Pay Period</div>
          <PayPeriodPicker
            valueId={payPeriodId || null}
            onChange={(pp: PayPeriod | null) => setPayPeriodId(pp?.id ?? "")}
            placeholder="Select pay period…"
          />
        </div>
      </div>
    </Modal>
  );
}