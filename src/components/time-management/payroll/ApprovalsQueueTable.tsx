"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { formatMinutes, shortId } from "@/logaxp/components/time-management/time.ui";

export function ApprovalsQueueTable({
  rows,
  busy,
  selected,
  onToggle,
  onToggleAll,
}: {
  rows: Timesheet[];
  busy?: boolean;
  selected: Record<string, boolean>;
  onToggle: (id: string, v: boolean) => void;
  onToggleAll: (v: boolean) => void;
}) {
  const allChecked = rows.length > 0 && rows.every((r) => selected[r.id]);
  const someChecked = rows.some((r) => selected[r.id]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = !allChecked && someChecked;
                    }}
                    onChange={(e) => onToggleAll(e.target.checked)}
                    disabled={busy}
                  />
                  Select
                </label>
              </th>
              <th className="px-4 py-3 text-left font-medium">Employee</th>
              <th className="px-4 py-3 text-left font-medium">Timesheet</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[r.id])}
                    onChange={(e) => onToggle(r.id, e.target.checked)}
                    disabled={busy}
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{shortId(r.employeeId)}</div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    PayPeriod {shortId(r.payPeriodId)}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{shortId(r.id)}</div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Submitted: {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}
                  </div>
                </td>

                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                  {formatMinutes(r.totalMinutes)}
                </td>

                <td className="px-4 py-3">
                  <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200">
                    {String(r.status ?? "SUBMITTED")}
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