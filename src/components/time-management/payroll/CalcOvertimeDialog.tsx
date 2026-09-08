// src/logaxp/components/time-management/payroll/CalcOvertimeDialog.tsx
"use client";

import * as React from "react";
import { Calculator, Play } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";

import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import { AsyncSelect } from "@/logaxp/components/time-management/pickers/AsyncSelect";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type { ApiResponse } from "@/logaxp/lib/time-management/timePayroll.types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  defaultEmployeeId?: string | null;
  defaultFrom?: string; // ISO
  defaultTo?: string; // ISO

  busy?: boolean;

  onCalc: (v: { employeeId: string; from: string; to: string }) => void | Promise<void>;
};

type PickerItem = { id: string; label: string };

function asItems(rows: any[], label: (r: any) => string): PickerItem[] {
  return (rows ?? []).map((r) => ({ id: String(r.id), label: label(r) }));
}

async function fetchEmployees(q: string): Promise<PickerItem[]> {
  // Uses your existing EmployeesController: GET /employees?search=... or q=...
  // We'll try both patterns; your apiClient will ignore unknown params server-side.
  const res = await (timeManagementService as any).employees?.list?.({ search: q, q, page: 1, pageSize: 20 } as any);
  const items = res?.data?.items ?? res?.data ?? [];
  return asItems(items, (e: any) => `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || `Employee ${e.id}`);
}

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function toDateInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // yyyy-mm-dd
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromDateInputToIso(v: string, endOfDay?: boolean) {
  // tenant timezone conversion can come later; this is safe and deterministic
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return "";
  const yyyy = Number(m[1]);
  const mm = Number(m[2]) - 1;
  const dd = Number(m[3]);
  const d = endOfDay
    ? new Date(Date.UTC(yyyy, mm, dd, 23, 59, 59, 999))
    : new Date(Date.UTC(yyyy, mm, dd, 0, 0, 0, 0));
  return d.toISOString();
}

export function CalcOvertimeDialog({
  open,
  onOpenChange,
  defaultEmployeeId,
  defaultFrom,
  defaultTo,
  busy,
  onCalc,
}: Props) {
  const { toast } = useTimeToast();

  const [employeeId, setEmployeeId] = React.useState<string>(String(defaultEmployeeId ?? ""));
  const [fromDay, setFromDay] = React.useState<string>(toDateInput(defaultFrom));
  const [toDay, setToDay] = React.useState<string>(toDateInput(defaultTo));
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setError("");
    setEmployeeId(String(defaultEmployeeId ?? ""));
    setFromDay(toDateInput(defaultFrom));
    setToDay(toDateInput(defaultTo));
  }, [open, defaultEmployeeId, defaultFrom, defaultTo]);

  const submitting = Boolean(busy);

  const submit = async () => {
    setError("");

    if (!employeeId) {
      setError("Select an employee.");
      return;
    }
    if (!fromDay || !toDay) {
      setError("Select a date range.");
      return;
    }

    const fromIso = fromDateInputToIso(fromDay, false);
    const toIso = fromDateInputToIso(toDay, true);

    if (!fromIso || !toIso) {
      setError("Invalid date range.");
      return;
    }
    if (new Date(toIso) < new Date(fromIso)) {
      setError("End date must be after start date.");
      return;
    }

    try {
      await onCalc({ employeeId, from: fromIso, to: toIso });
      toast({ tone: "success", title: "Overtime calculation requested" });
      onOpenChange(false);
    } catch (e: any) {
      const msg = String(e?.message ?? "Failed to calculate overtime");
      setError(msg);
      toast({ tone: "error", title: "Overtime calc failed", description: msg });
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Calculate Overtime"
      subtitle="Run overtime calculation for an employee over a date range."
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            <Play className="h-4 w-4" />
            Calculate
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Calculator className="h-3.5 w-3.5" />
            Overtime
          </Badge>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Employee</div>
          <AsyncSelect
            valueId={employeeId || null}
            valueLabel={employeeId ? `Employee ${employeeId}` : null}
            placeholder="Search employee…"
            fetcher={fetchEmployees}
            onSelect={(it) => setEmployeeId(it?.id ?? "")}
            allowClear
          />
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Uses <code>/employees</code> list to search employees.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">From</div>
            <input
              type="date"
              value={fromDay}
              onChange={(e) => setFromDay(e.target.value)}
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">To</div>
            <input
              type="date"
              value={toDay}
              onChange={(e) => setToDay(e.target.value)}
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-700 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-200">
          We convert dates to ISO as UTC start/end-of-day for deterministic results.
          If you want strict tenant timezone alignment, we can wire that in next.
        </div>
      </div>
    </Modal>
  );
}