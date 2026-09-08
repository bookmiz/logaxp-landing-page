"use client";

import * as React from "react";
import { RotateCcw, Trash2, Pencil } from "lucide-react";
import type { TestSuite } from "@/logaxp/lib/testing/testing.types";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";

export function TestSuitesTable({
  rows,
  busy,
  onEdit,
  onDelete,
  onRestore,
}: {
  rows: TestSuite[];
  busy?: boolean;
  onEdit: (row: TestSuite) => void;
  onDelete: (row: TestSuite) => void;
  onRestore: (row: TestSuite) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-left font-medium">Sort</th>
            <th className="px-4 py-3 text-left font-medium">State</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((r) => {
            const deleted = Boolean(r.deletedAt);
            return (
              <tr key={r.id} className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {r.description || <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3">{r.sortOrder ?? <span className="text-slate-400">—</span>}</td>
                <td className="px-4 py-3">
                  {deleted ? <Badge variant="destructive">Deleted</Badge> : <Badge variant="muted">Active</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(r)} disabled={busy}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    {deleted ? (
                      <Button variant="outline" size="sm" onClick={() => onRestore(r)} disabled={busy}>
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                    ) : (
                      <Button variant="destructive" size="sm" onClick={() => onDelete(r)} disabled={busy}>
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
              <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                No suites
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}