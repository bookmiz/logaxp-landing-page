"use client";

import type { BoardColumn } from "@/logaxp/lib/project-management/projectManagement.types";

export function KanbanPlaceholder({ columns }: { columns: BoardColumn[] }) {
  const cols = [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        Kanban
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Create work items and assign them to a board column.
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cols.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {String(c.name ?? "-")}
                </div>
                <div className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {String(c.key ?? "-")}
                </div>
              </div>
              {c.wipLimit != null ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                  WIP {c.wipLimit}
                </span>
              ) : null}
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No work items in this column.
            </div>
          </div>
        ))}

        {!cols.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            No columns yet — create one to start.
          </div>
        ) : null}
      </div>
    </div>
  );
}
