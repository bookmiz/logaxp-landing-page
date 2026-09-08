"use client";

import type { BoardColumn } from "@/logaxp/lib/project-management/projectManagement.types";
import { Button } from "@/logaxp/components/ui/button";

export function BoardColumnsTable({
  rows,
  busy,
  onEdit,
  onRemove,
}: {
  rows: BoardColumn[];
  busy?: boolean;
  onEdit: (c: BoardColumn) => void;
  onRemove: (c: BoardColumn) => void;
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
              <th className="px-4 py-3 text-left font-medium">WIP</th>
              <th className="px-4 py-3 text-left font-medium">Flags</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((c) => (
              <tr key={c.id} className="bg-white dark:bg-slate-950">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{String(c.order ?? "-")}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{String(c.key ?? "-")}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{String(c.name ?? "-")}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{c.wipLimit ?? "-"}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {c.isBacklog ? "Backlog " : ""}
                  {c.isDone ? "Done" : ""}
                  {!c.isBacklog && !c.isDone ? "-" : ""}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" disabled={busy} onClick={() => onEdit(c)}>Edit</Button>
                    <Button variant="outline" disabled={busy} onClick={() => onRemove(c)}>Remove</Button>
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