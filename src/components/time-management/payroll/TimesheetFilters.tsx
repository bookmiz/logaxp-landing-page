"use client";

import * as React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { PayPeriodPicker } from "@/logaxp/components/time-management/payroll/PayPeriodPicker";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export type TimesheetScope = "me" | "workspace";

export function TimesheetFilters({
  q,
  onQ,

  scope,
  onScope,
  canUseMeScope,

  status,
  onStatus,

  employeeId,
  onEmployeeId,

  payPeriodId,
  onPayPeriodId,

  onReset,
  right,
}: {
  q: string;
  onQ: (v: string) => void;

  scope: TimesheetScope;
  onScope: (v: TimesheetScope) => void;
  canUseMeScope: boolean;

  status: string;
  onStatus: (v: string) => void;

  employeeId: string;
  onEmployeeId: (v: string) => void;

  payPeriodId: string;
  onPayPeriodId: (id: string) => void;

  onReset: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 gap-3 lg:grid-cols-12">
          {/* Search */}
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Search id, employee, status…"
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>

          {/* Scope */}
          <div className="lg:col-span-2">
            <select
              value={scope}
              onChange={(e) => onScope(e.target.value as TimesheetScope)}
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            >
              <option value="workspace">Workspace</option>
              <option value="me" disabled={!canUseMeScope}>
                Me
              </option>
            </select>
          </div>

          {/* Status */}
          <div className="lg:col-span-2">
            <select
              value={status}
              onChange={(e) => onStatus(e.target.value)}
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            >
              <option value="">All statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {/* Employee (workspace only) */}
          <div className="lg:col-span-2">
            <input
              value={employeeId}
              onChange={(e) => onEmployeeId(e.target.value)}
              placeholder="employeeId…"
              disabled={scope === "me"}
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "disabled:opacity-60",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>

          {/* Pay period */}
          <div className="lg:col-span-2">
            <PayPeriodPicker
              valueId={payPeriodId || null}
              onPick={(id: string | null) => onPayPeriodId(id ?? "")}
              allowClear
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {right ? <div className="text-xs text-slate-500 dark:text-slate-400">{right}</div> : null}
    </div>
  );
}