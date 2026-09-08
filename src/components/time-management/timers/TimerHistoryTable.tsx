"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { TimerRecord, ListMeta } from "@/logaxp/lib/time-management/timeManagement.types";
import { formatIsoDateTime, formatMinutes, shortId } from "@/logaxp/components/time-management/time.ui";
import { minutesBetween, workLabel } from "./timer.utils";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total?: number;
  onPage: (p: number) => void;
}) {
  const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : undefined;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Page <span className="font-medium">{page}</span>
        {totalPages ? <> of <span className="font-medium">{totalPages}</span></> : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <button
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          onClick={() => onPage(page + 1)}
          disabled={totalPages ? page >= totalPages : false}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function TimerHistoryTable({
  rows,
  meta,
  page,
  pageSize,
  onPage,
  busy,
}: {
  rows: TimerRecord[];
  meta?: ListMeta;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  busy?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-100 p-3 dark:border-slate-800">
        <Pagination page={page} pageSize={pageSize} total={meta?.total} onPage={onPage} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Work</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Duration</th>
              <th className="px-4 py-3 text-left font-medium">Start</th>
              <th className="px-4 py-3 text-left font-medium">Stop</th>
              <th className="px-4 py-3 text-left font-medium">Notes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => {
              const running = !r.stoppedAt;
              const computed =
                r.durationMinutes ??
                (running
                  ? minutesBetween(r.startedAt ?? null, new Date().toISOString())
                  : minutesBetween(r.startedAt ?? null, r.stoppedAt ?? null)) ??
                0;

              return (
                <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {workLabel(r.projectId as any, r.workItemId as any)}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{shortId(r.id)}</div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant="muted"
                      className={cx(
                        "rounded-full",
                        running && "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                      )}
                    >
                      {running ? "Running" : "Stopped"}
                    </Badge>

                    {r.billable ? (
                      <div className="mt-2">
                        <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                          Billable
                        </Badge>
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                    {formatMinutes(computed)}
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {formatIsoDateTime(r.startedAt ?? null)}
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {r.stoppedAt ? formatIsoDateTime(r.stoppedAt) : "—"}
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    <div className="max-w-[320px] truncate">{String(r.notes ?? "—")}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <Pagination page={page} pageSize={pageSize} total={meta?.total} onPage={onPage} />
      </div>
    </div>
  );
}