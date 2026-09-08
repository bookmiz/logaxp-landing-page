"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { TimeEntry, ListMeta } from "@/logaxp/lib/time-management/timeManagement.types";
import { formatIsoDateTime, formatMinutes, shortId } from "@/logaxp/components/time-management/time.ui";
import { TimeEntryRowActions } from "./TimeEntryRowActions";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  rows: TimeEntry[];
  meta?: ListMeta;
  busy?: boolean;

  onEdit: (row: TimeEntry) => void;
  onSoftDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;

  page: number;
  pageSize: number;
  total?: number;
  onPage: (p: number) => void;
};

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

export function TimeEntriesTable({
  rows,
  meta,
  busy,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
  page,
  pageSize,
  total,
  onPage,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-100 p-3 dark:border-slate-800">
        <Pagination page={page} pageSize={pageSize} total={total ?? meta?.total} onPage={onPage} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Work</th>
              <th className="px-4 py-3 text-left font-medium">Source</th>
              <th className="px-4 py-3 text-left font-medium">Billable</th>
              <th className="px-4 py-3 text-right font-medium">Duration</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => {
              const isDeleted = Boolean(r.deletedAt);
              const workLabel = r.workItemId
                ? `WorkItem ${shortId(String(r.workItemId))}`
                : r.projectId
                  ? `Project ${shortId(String(r.projectId))}`
                  : "—";

              return (
                <tr key={r.id} className={cx("hover:bg-slate-50/70 dark:hover:bg-slate-900/20", isDeleted && "opacity-70")}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-50">{workLabel}</div>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{shortId(r.id)}</div>
                    {isDeleted ? (
                      <div className="mt-1 text-[11px] text-red-600 dark:text-red-300">
                        Deleted: {formatIsoDateTime(r.deletedAt)}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {String(r.source ?? "—")}
                  </td>

                  <td className="px-4 py-3">
                    {r.billable ? (
                      <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                        Billable
                      </Badge>
                    ) : (
                      <Badge variant="muted" className="rounded-full">
                        Non-billable
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                    {formatMinutes(r.durationMinutes)}
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {formatIsoDateTime(r.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <TimeEntryRowActions
                      row={r}
                      onEdit={onEdit}
                      onSoftDelete={onSoftDelete}
                      onRestore={onRestore}
                      onHardDelete={onHardDelete}
                      busy={busy}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <Pagination page={page} pageSize={pageSize} total={total ?? meta?.total} onPage={onPage} />
      </div>
    </div>
  );
}