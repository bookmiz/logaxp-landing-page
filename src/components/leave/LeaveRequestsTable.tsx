"use client";

import * as React from "react";
import type { LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { LeaveStatusBadge } from "@/logaxp/components/leave/LeaveStatusBadge";
import { LeaveTypeBadge } from "@/logaxp/components/leave/LeaveTypeBadge";
import { formatIsoDate, leaveEmployeeLabel, shortId } from "@/logaxp/lib/leave/leave.types";

export function LeaveRequestsTable({
  rows,
  onOpen,
}: {
  rows: LeaveRequest[];
  onOpen: (row: LeaveRequest) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Employee</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Dates</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    {leaveEmployeeLabel(r.employee)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    id: {shortId(r.id)}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <LeaveTypeBadge type={String(r.type)} />
                </td>

                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  <div className="text-[13px]">{formatIsoDate(r.startDate)}</div>
                  <div className="text-[13px]">{formatIsoDate(r.endDate)}</div>
                </td>

                <td className="px-4 py-3">
                  <LeaveStatusBadge status={String(r.status)} />
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(r)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}