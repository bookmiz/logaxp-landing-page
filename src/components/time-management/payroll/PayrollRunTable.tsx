"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { shortId, formatMinutes } from "@/logaxp/components/time-management/time.ui";
import { CopyButton } from "@/logaxp/components/time-management/feedback/CopyButton";

export function PayrollRunTable({ rows }: { rows: Timesheet[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Employee</th>
              <th className="px-4 py-3 text-left font-medium">Timesheet</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Regular</th>
              <th className="px-4 py-3 text-right font-medium">OT</th>
              <th className="px-4 py-3 text-right font-medium">DT</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{shortId(r.employeeId)}</div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    PayPeriod {shortId(r.payPeriodId)}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{shortId(r.id)}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>ID</span>
                    <CopyButton value={r.id} label="ID" size="xs" />
                  </div>
                </td>

                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                  {formatMinutes(r.totalMinutes)}
                </td>

                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                  {formatMinutes(r.regularMinutes)}
                </td>

                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                  {formatMinutes(r.overtimeMinutes)}
                </td>

                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                  {formatMinutes(r.doubleTimeMinutes)}
                </td>

                <td className="px-4 py-3">
                  <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                    {String(r.status ?? "APPROVED")}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}