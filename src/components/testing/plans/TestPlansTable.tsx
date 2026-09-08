"use client";

import * as React from "react";
import { ArchiveRestore, Eye, Pencil, Trash2, Layers, Link2 } from "lucide-react";
import type { TestPlan } from "@/logaxp/lib/testing/testing.types";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function countCases(p: TestPlan) {
  if (Array.isArray(p.cases)) return p.cases.length;
  return Array.isArray(p.testCaseIds) ? p.testCaseIds.length : 0;
}

export function TestPlansTable({
  rows,
  busy,
  onView,
  onEdit,
  onManageCases,
  onDelete,
  onRestore,
}: {
  rows: TestPlan[];
  busy?: boolean;
  onView?: (row: TestPlan) => void;
  onEdit: (row: TestPlan) => void;
  onManageCases: (row: TestPlan) => void;
  onDelete: (row: TestPlan) => void;
  onRestore: (row: TestPlan) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Plan</th>
            <th className="px-4 py-3 text-left font-medium">Cases</th>
            <th className="px-4 py-3 text-left font-medium">Meta</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((p) => {
            const deleted = Boolean(p.deletedAt);
            const casesCount = countCases(p);

            return (
              <tr
                key={p.id}
                className={cn(
                  "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/40",
                  deleted && "opacity-80"
                )}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{p.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{p.id}</div>
                  {p.description ? (
                    <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                      {p.description}
                    </div>
                  ) : null}
                </td>

                <td className="px-4 py-3">
                  <Badge variant="muted" className="rounded-full">
                    <Layers className="mr-1 h-3.5 w-3.5" />
                    {casesCount} case{casesCount === 1 ? "" : "s"}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  {deleted ? (
                    <Badge variant="destructive">Deleted</Badge>
                  ) : (
                    <Badge variant="muted" className="rounded-full">
                      <Link2 className="mr-1 h-3.5 w-3.5" />
                      Ready for runs
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {onView ? (
                      <Button variant="outline" size="sm" onClick={() => onView(p)} disabled={busy}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    ) : null}

                    <Button variant="outline" size="sm" onClick={() => onEdit(p)} disabled={busy}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => onManageCases(p)} disabled={busy}>
                      Manage cases
                    </Button>

                    {deleted ? (
                      <Button variant="outline" size="sm" onClick={() => onRestore(p)} disabled={busy}>
                        <ArchiveRestore className="h-4 w-4" />
                        Restore
                      </Button>
                    ) : (
                      <Button variant="destructive" size="sm" onClick={() => onDelete(p)} disabled={busy}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                No test plans
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
