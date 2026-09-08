"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Board } from "@/logaxp/lib/project-management/projectManagement.types";
import { BoardTypePill } from "./BoardTypePill";
import { Button } from "@/logaxp/components/ui/button";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";

export function BoardsTable({
  rows,
  projectId,
  onEdit,
  onDelete,
  busy,
}: {
  rows: Board[];
  projectId?: string | null;
  busy?: boolean;
  onEdit: (b: Board) => void;
  onDelete: (b: Board) => void;
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Default</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((b) => (
              <tr key={b.id} className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{String(b.name ?? "Untitled")}</div>
                  {b.description ? (
                    <div className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {String(b.description)}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <BoardTypePill type={String(b.type ?? "")} />
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {b.isDefault ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" disabled={busy} onClick={() => onEdit(b)}>
                      Edit
                    </Button>
                    <Button variant="outline" disabled={busy} onClick={() => onDelete(b)}>
                      Delete
                    </Button>
                    <Link
                      href={withProjectId(
                        `/portal/boards/${encodeURIComponent(b.id)}`,
                        normalizeProjectId(b.projectId) || projectId
                      )}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/40"
                    >
                      Open <ChevronRight className="h-4 w-4" />
                    </Link>
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
