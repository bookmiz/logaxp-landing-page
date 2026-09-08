"use client";

import * as React from "react";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { LeaveEmployeePicker } from "@/logaxp/components/leave/pickers/EmployeePicker";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export type LeaveView = "all" | "me" | "pending";

type LeaveFiltersProps = {
  view: LeaveView;

  q: string;
  onQ: (v: string) => void;

  employeeId: string;
  onEmployeeId: (v: string) => void;

  status: string;
  onStatus: (v: string) => void;

  type: string;
  onType: (v: string) => void;

  from: string;
  onFrom: (v: string) => void;

  to: string;
  onTo: (v: string) => void;

  pageSize: number;
  onPageSize: (n: number) => void;

  onReset: () => void;
  right?: React.ReactNode;
};

export function LeaveFilters({
  view,

  q,
  onQ,

  employeeId,
  onEmployeeId,

  status,
  onStatus,

  type,
  onType,

  from,
  onFrom,

  to,
  onTo,

  pageSize,
  onPageSize,

  onReset,
  right,
}: LeaveFiltersProps) {
  const showEmployeePicker = view !== "me";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-3 lg:grid-cols-12">
        {/* Search */}
        <div className={cx(showEmployeePicker ? "lg:col-span-3" : "lg:col-span-4")}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Search requests..."
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>
        </div>

        {/* Employee */}
        {showEmployeePicker ? (
          <div className="lg:col-span-3">
            <LeaveEmployeePicker
              valueId={employeeId || null}
              valueLabel={employeeId ? `Employee ${employeeId.slice(0, 6)}` : null}
              onPick={(id) => onEmployeeId(id ?? "")}
              allowClear
            />
          </div>
        ) : null}

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
            <option value="REQUESTED">REQUESTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>

        {/* Type */}
        <div className="lg:col-span-2">
          <input
            value={type}
            onChange={(e) => onType(e.target.value)}
            placeholder="Type (e.g. VACATION)"
            className={cx(
              "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
              "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
              "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            )}
          />
        </div>

        {/* From */}
        <div className="lg:col-span-2">
          <input
            type="date"
            value={from}
            onChange={(e) => onFrom(e.target.value)}
            className={cx(
              "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
              "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
              "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            )}
          />
        </div>

        {/* To */}
        <div className="lg:col-span-2">
          <input
            type="date"
            value={to}
            onChange={(e) => onTo(e.target.value)}
            className={cx(
              "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
              "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
              "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            )}
          />
        </div>

        {/* Page size */}
        <div className="lg:col-span-1">
          <select
            value={String(pageSize)}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className={cx(
              "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
              "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
              "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            )}
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Reset / right content */}
        <div className="lg:col-span-12 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          <div className="text-xs text-slate-500 dark:text-slate-400">{right}</div>
        </div>
      </div>
    </div>
  );
}