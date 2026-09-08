"use client";

import * as React from "react";
import { Ban, CheckCircle2, Eye, Play, RotateCcw, Rocket, Trash2 } from "lucide-react";
import type { TestRun } from "@/logaxp/lib/testing/testing.types";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { runOutcome, runOutcomeLabel } from "@/logaxp/components/testing/testing.ui";

function statusBadge(status: string) {
  const s = String(status ?? "").toUpperCase();
  if (s === "RUNNING") return <Badge className="rounded-full">Running</Badge>;
  if (s === "COMPLETED") return <Badge className="rounded-full">Completed</Badge>;
  if (s === "CANCELED") return <Badge variant="destructive">Canceled</Badge>;
  return <Badge variant="muted">Planned</Badge>;
}

function outcomeBadge(run: TestRun) {
  const outcome = runOutcome(run);
  return (
    <Badge variant={outcome === "FAILED" || outcome === "BLOCKED" ? "destructive" : outcome === "PASSED" ? "default" : "muted"} className="rounded-full">
      {runOutcomeLabel(outcome)}
    </Badge>
  );
}

export function TestRunsTable({
  rows,
  busy,
  onView,
  onStart,
  onComplete,
  onCancel,
  onPublish,
  onDelete,
  onRestore,
}: {
  rows: TestRun[];
  busy?: boolean;
  onView: (r: TestRun) => void;
  onStart: (r: TestRun) => void | Promise<void>;
  onComplete: (r: TestRun) => void | Promise<void>;
  onCancel: (r: TestRun) => void | Promise<void>;
  onPublish: (r: TestRun) => void | Promise<void>;
  onDelete: (r: TestRun) => void | Promise<void>;
  onRestore?: (r: TestRun) => void | Promise<void>;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Run</th>
            <th className="px-4 py-3 text-left font-medium">Lifecycle</th>
            <th className="px-4 py-3 text-left font-medium">Outcome</th>
            <th className="px-4 py-3 text-left font-medium">Plan</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((r) => {
            const st = String(r.status ?? "").toUpperCase();
            const deleted = Boolean(r.deletedAt);
            const canStart = !deleted && st === "PLANNED";
            const canComplete = !deleted && st === "RUNNING";
            const canCancel = !deleted && (st === "RUNNING" || st === "PLANNED");
            const canPublish = !deleted && st === "COMPLETED";

            return (
              <tr key={r.id} className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-50">{r.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{r.id}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {r.startedAt ? `Started: ${new Date(r.startedAt).toLocaleString()}` : "Not started"}
                    {r.completedAt ? ` • Completed: ${new Date(r.completedAt).toLocaleString()}` : ""}
                  </div>
                  {deleted ? <Badge variant="muted" className="mt-2 rounded-full">Deleted</Badge> : null}
                </td>

                <td className="px-4 py-3">{statusBadge(st)}</td>
                <td className="px-4 py-3">{outcomeBadge(r)}</td>

                <td className="px-4 py-3">
                  {r.plan?.name || r.planId ? <Badge variant="muted" className="rounded-full">{r.plan?.name ?? r.planId}</Badge> : <span className="text-xs text-slate-500">No plan</span>}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView(r)} disabled={busy || deleted}>
                      <Eye className="h-4 w-4" /> View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void onStart(r)} disabled={busy || !canStart}>
                      <Play className="h-4 w-4" /> Start
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void onComplete(r)} disabled={busy || !canComplete}>
                      <CheckCircle2 className="h-4 w-4" /> Complete
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void onCancel(r)} disabled={busy || !canCancel}>
                      <Ban className="h-4 w-4" /> Cancel
                    </Button>
                    <Button size="sm" onClick={() => void onPublish(r)} disabled={busy || !canPublish}>
                      <Rocket className="h-4 w-4" /> Publish
                    </Button>
                    {deleted ? (
                      <Button variant="outline" size="sm" onClick={() => void onRestore?.(r)} disabled={busy || !onRestore}>
                        <RotateCcw className="h-4 w-4" /> Restore
                      </Button>
                    ) : (
                      <Button variant="destructive" size="sm" onClick={() => void onDelete(r)} disabled={busy}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No runs</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
