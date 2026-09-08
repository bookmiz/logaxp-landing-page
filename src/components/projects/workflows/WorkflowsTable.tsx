"use client";

import Link from "next/link";
import type { Workflow } from "@/logaxp/lib/project-management/projectManagement.types";
import { Button } from "@/logaxp/components/ui/button";
import { WorkflowSetDefaultButton } from "./WorkflowSetDefaultButton";
import { withProjectId } from "@/logaxp/lib/project-management/projectContext";

export function WorkflowsTable({
  rows,
  busy,
  onRename,
  onClone,
  onSetDefault,
  projectId,
}: {
  rows: Workflow[];
  busy?: boolean;
  onRename: (w: Workflow) => void;
  onClone: (w: Workflow) => void;
  onSetDefault: (w: Workflow) => void;
  projectId?: string | null;
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Default</th>
              <th className="px-4 py-3 text-left font-medium">Statuses</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((w) => {
              const count = Array.isArray(w.statuses) ? w.statuses.length : 0;

              return (
                <tr key={w.id} className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-50">{String(w.name ?? "Workflow")}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{w.id}</div>
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{w.isDefault ? "Yes" : "No"}</td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{count}</td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <WorkflowSetDefaultButton
                        isDefault={Boolean(w.isDefault)}
                        busy={busy}
                        onSetDefault={() => onSetDefault(w)}
                      />
                      <Button variant="outline" disabled={busy} onClick={() => onRename(w)}>
                        Rename
                      </Button>
                      <Button variant="outline" disabled={busy} onClick={() => onClone(w)}>
                        Duplicate
                      </Button>
                      <Link
                        href={withProjectId(`/portal/workflows/${encodeURIComponent(w.id)}`, projectId)}
                        className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/40"
                      >
                        Open
                      </Link>
                    </div>
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
