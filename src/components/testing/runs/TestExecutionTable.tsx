"use client";

import * as React from "react";
import { Bug, ExternalLink, Paperclip, Pencil } from "lucide-react";
import type { TestCase, TestExecution, TestExecutionStatusInput } from "@/logaxp/lib/testing/testing.types";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { executionStatusLabel, normalizeExecutionStatus } from "@/logaxp/components/testing/testing.ui";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function statusBadge(s: TestExecutionStatusInput | string) {
  const v = normalizeExecutionStatus(s);
  if (v === "PASS") return <Badge className="rounded-full">Passed</Badge>;
  if (v === "FAIL") return <Badge variant="destructive">Failed</Badge>;
  if (v === "BLOCKED") return <Badge variant="destructive">Blocked</Badge>;
  return <Badge variant="muted">Not started</Badge>;
}

export function TestExecutionTable({
  rows,
  casesById,
  busy,
  onEdit,
  onEvidence,
  onCreateBug,
}: {
  rows: TestExecution[];
  casesById: Record<string, TestCase>;
  busy?: boolean;
  onEdit: (e: TestExecution) => void;
  onEvidence: (e: TestExecution) => void;
  onCreateBug: (e: TestExecution) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Test case</th>
            <th className="px-4 py-3 text-left font-medium">Result</th>
            <th className="px-4 py-3 text-left font-medium">Notes</th>
            <th className="px-4 py-3 text-left font-medium">Evidence</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((e) => {
            const tc = e.testCase ?? casesById[e.testCaseId];
            const title = tc?.title ?? e.testCaseId;
            const evidence = Array.isArray(e.evidence) ? e.evidence : Array.isArray(e.evidenceFiles) ? e.evidenceFiles : [];
            const evCount = evidence.length;
            const notes = String(e.notes ?? "");
            const status = normalizeExecutionStatus(e.status);
            const bad = status === "FAIL" || status === "BLOCKED";
            const hasBug = Boolean(e.defectWorkItemId ?? e.createdBugWorkItemId);

            return (
              <tr key={e.id} className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <div className={cn("font-medium", bad ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-slate-50")}>
                    {title}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">Execution: {e.id} • Case: {e.testCaseId}</div>
                  {hasBug ? (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                      <Bug className="h-3.5 w-3.5" /> Bug linked
                    </div>
                  ) : null}
                </td>

                <td className="px-4 py-3">
                  {statusBadge(e.status)}
                  <div className="mt-1 text-xs text-slate-500">{executionStatusLabel(e.status)}</div>
                </td>

                <td className="px-4 py-3">
                  {notes ? <div className="line-clamp-2 text-xs text-slate-700 dark:text-slate-200">{notes}</div> : <div className="text-xs text-slate-500">-</div>}
                  {typeof e.durationMs === "number" ? <div className="mt-1 text-xs text-slate-500">{Math.round(e.durationMs / 1000)}s</div> : null}
                </td>

                <td className="px-4 py-3">
                  <Badge variant="muted" className="rounded-full">{evCount} item{evCount === 1 ? "" : "s"}</Badge>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(e)} disabled={busy}>
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEvidence(e)} disabled={busy}>
                      <Paperclip className="h-4 w-4" /> Evidence
                    </Button>
                    <Button size="sm" onClick={() => onCreateBug(e)} disabled={busy || hasBug || (status !== "FAIL" && status !== "BLOCKED")}>
                      {hasBug ? <ExternalLink className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
                      {hasBug ? "Linked" : "Create bug"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}

          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No executions</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
