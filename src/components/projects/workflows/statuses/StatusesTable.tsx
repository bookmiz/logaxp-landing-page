"use client";

import type { WorkflowStatus } from "@/logaxp/lib/project-management/projectManagement.types";
import { Button } from "@/logaxp/components/ui/button";

export function StatusesTable({
  rows,
  busy,
  onDelete,
}: {
  rows: WorkflowStatus[];
  busy?: boolean;
  onDelete: (s: WorkflowStatus) => void;
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Key</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Flags</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((s) => (
              <tr key={s.id} className="bg-white dark:bg-slate-950">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{String(s.order ?? "-")}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{String(s.key ?? "-")}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{String(s.name ?? "-")}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{String(s.category ?? "-")}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {s.isDefault ? "Default " : ""}
                  {s.isTerminal ? "Terminal" : ""}
                  {!s.isDefault && !s.isTerminal ? "-" : ""}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button variant="outline" disabled={busy} onClick={() => onDelete(s)}>
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