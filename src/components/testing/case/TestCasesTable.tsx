"use client";

import * as React from "react";
import {
  ArchiveRestore,
  Clipboard,
  Eye,
  Link2,
  Pencil,
  ShieldCheck,
  Tags,
  Trash2,
} from "lucide-react";

import type { TestCase, TestSuite } from "@/logaxp/lib/testing/testing.types";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function countSteps(tc: TestCase) {
  return Array.isArray(tc.steps) ? tc.steps.length : 0;
}

function countRefs(tc: TestCase) {
  return Array.isArray(tc.references) ? tc.references.length : 0;
}

function countTags(tc: TestCase) {
  return Array.isArray(tc.tags) ? tc.tags.length : 0;
}

function suiteName(suitesById: Record<string, TestSuite>, suiteId?: string | null) {
  if (!suiteId) return "—";
  return suitesById[suiteId]?.name ?? suiteId;
}

export function TestCasesTable({
  rows,
  suitesById,
  busy,
  onView,
  onEdit,
  onCoverage,
  onDelete,
  onRestore,
}: {
  rows: TestCase[];
  suitesById: Record<string, TestSuite>;
  busy?: boolean;
  onView?: (row: TestCase) => void;
  onEdit: (row: TestCase) => void;
  onCoverage: (row: TestCase) => void;
  onDelete: (row: TestCase) => void;
  onRestore: (row: TestCase) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">Suite</th>
            <th className="px-4 py-3 text-left font-medium">Priority</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Meta</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((tc) => {
            const deleted = Boolean(tc.deletedAt);
            const steps = countSteps(tc);
            const refs = countRefs(tc);
            const tags = countTags(tc);

            return (
              <tr
                key={tc.id}
                className={cn(
                  "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/40",
                  deleted && "opacity-80"
                )}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{tc.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{tc.id}</div>
                  {tc.description ? (
                    <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                      {tc.description}
                    </div>
                  ) : null}
                </td>

                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  <span className="text-xs">{suiteName(suitesById, tc.suiteId ?? null)}</span>
                </td>

                <td className="px-4 py-3">
                  <Badge variant="muted" className="rounded-full">
                    {tc.priority}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  {deleted ? (
                    <Badge variant="destructive">Deleted</Badge>
                  ) : tc.status === "ACTIVE" ? (
                    <Badge className="rounded-full">
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      ACTIVE
                    </Badge>
                  ) : (
                    <Badge variant="muted" className="rounded-full">
                      {tc.status}
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-950">
                      <Clipboard className="h-3.5 w-3.5" />
                      {steps} steps
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-950">
                      <Link2 className="h-3.5 w-3.5" />
                      {refs} refs
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-950">
                      <Tags className="h-3.5 w-3.5" />
                      {tags} tags
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {onView ? (
                      <Button variant="outline" size="sm" onClick={() => onView(tc)} disabled={busy}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    ) : null}

                    <Button variant="outline" size="sm" onClick={() => onEdit(tc)} disabled={busy}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => onCoverage(tc)} disabled={busy}>
                      Coverage
                    </Button>

                    {deleted ? (
                      <Button variant="outline" size="sm" onClick={() => onRestore(tc)} disabled={busy}>
                        <ArchiveRestore className="h-4 w-4" />
                        Restore
                      </Button>
                    ) : (
                      <Button variant="destructive" size="sm" onClick={() => onDelete(tc)} disabled={busy}>
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
              <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                No test cases
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}