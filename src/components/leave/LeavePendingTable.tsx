"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import type { LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { LeaveStatusBadge } from "@/logaxp/components/leave/LeaveStatusBadge";
import { LeaveTypeBadge } from "@/logaxp/components/leave/LeaveTypeBadge";
import { leaveEmployeeLabel, formatIsoDate, shortId } from "@/logaxp/lib/leave/leave.types";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function LeavePendingTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  onOpen,
}: {
  rows: LeaveRequest[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onOpen: (row: LeaveRequest) => void;
}) {
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(String(r.id)));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="w-12 px-3 py-3 text-left font-medium">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => onToggleAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 text-left font-medium">Request</th>
              <th className="px-4 py-3 text-left font-medium">Employee</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Dates</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Open</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => {
              const id = String(r.id);
              return (
                <tr key={id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(id)}
                      onChange={() => onToggle(id)}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-50">{shortId(id, 10)}</div>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">id: {shortId(id)}</div>
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {leaveEmployeeLabel(r.employee)}
                  </td>

                  <td className="px-4 py-3">
                    <LeaveTypeBadge type={r.type as any} />
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    <div className="text-[13px]">{formatIsoDate(r.startDate)}</div>
                    <div className="text-[13px]">{formatIsoDate(r.endDate)}</div>
                  </td>

                  <td className="px-4 py-3">
                    <LeaveStatusBadge status={r.status as any} />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpen(r)}
                      className={cx(
                        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-sm",
                        "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                        "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                      )}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}