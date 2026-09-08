"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import type {
  ChangeEmployeeStatusDto,
  EmployeeDetail,
  EmployeeStatus,
} from "@/logaxp/lib/employee-management/employee-management.types";
import { EMPLOYEE_STATUS_VALUES } from "@/logaxp/lib/employee-management/employee-management.types";
import { fullName, human } from "./employee-detail.utils";

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
      >
        {children}
      </select>
    </div>
  );
}

export function EmployeeStatusDialog({
  open,
  onOpenChange,
  employee,
  busyAny,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeDetail | null;
  busyAny: boolean;
  onSubmit: (dto: ChangeEmployeeStatusDto) => Promise<void> | void;
}) {
  const current = String(employee?.status ?? "ACTIVE") as EmployeeStatus;

  const [status, setStatus] = React.useState<EmployeeStatus>(current);
  const [terminationDate, setTerminationDate] = React.useState("");
  const [terminationReason, setTerminationReason] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const cur = String(employee?.status ?? "ACTIVE") as EmployeeStatus;
    setStatus(cur);
    setTerminationDate("");
    setTerminationReason("");
  }, [open, employee]);

  const needsTermination = status === "TERMINATED";
  const canSave = !busyAny && (!needsTermination || Boolean(terminationDate.trim()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Change employee status</DialogTitle>
          <DialogDescription>
            Update status for <span className="font-semibold">{fullName(employee)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <SelectField label="Status" value={status} onChange={(v) => setStatus(v as EmployeeStatus)}>
            {EMPLOYEE_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {human(s)}
              </option>
            ))}
          </SelectField>

          {needsTermination ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Termination date *
                </label>
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                />
                <div className="text-[11px] text-slate-500">Required when terminating.</div>
              </div>

              <Input
                label="Reason (optional)"
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                placeholder="e.g. Resignation"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              void onSubmit({
                status,
                ...(needsTermination
                  ? { terminationDate, terminationReason: terminationReason || undefined }
                  : {}),
              })
            }
            disabled={!canSave}
          >
            <ShieldCheck className="h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}