"use client";

import * as React from "react";
import { Button } from "@/logaxp/components/ui/button";
import { CopyButton } from "@/logaxp/components/time-management/feedback/CopyButton";
import type { ScheduleAssignment } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function AssignmentsTable({
  rows,
  busy,
  onEdit,
  onDelete,
}: {
  rows: ScheduleAssignment[];
  busy?: boolean;
  onEdit: (row: ScheduleAssignment) => void;
  onDelete: (row: ScheduleAssignment) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Assignment</th>
              <th className="px-4 py-3 text-left font-medium">Target</th>
              <th className="px-4 py-3 text-left font-medium">Effective</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    Template {r.templateId}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{r.id}</span>
                    <CopyButton value={r.id} label="ID" size="xs" />
                  </div>
                </td>

                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {r.employeeId ? `Employee ${r.employeeId}` : r.orgUnitId ? `OrgUnit ${r.orgUnitId}` : "—"}
                </td>

                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  <div className="text-xs">
                    From: {r.effectiveFrom ?? "—"}
                  </div>
                  <div className="text-xs">
                    To: {r.effectiveTo ?? "—"}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(r)} disabled={busy}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(r)} disabled={busy}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}