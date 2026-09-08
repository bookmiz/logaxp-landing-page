"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { Shift, ListMeta } from "@/logaxp/lib/scheduling/scheduleManagement.types";
import { CopyButton } from "@/logaxp/components/time-management/feedback/CopyButton";
import { ShiftRowActions } from "./ShiftRowActions";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
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

export function ShiftsTable({
  rows,
  meta,
  busy,

  onEdit,
  onCancel,

  page,
  pageSize,
  total,
  onPage,
}: {
  rows: Shift[];
  meta?: ListMeta;
  busy?: boolean;

  onEdit: (row: Shift) => void;
  onCancel: (row: Shift) => void;

  page: number;
  pageSize: number;
  total?: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-100 p-3 dark:border-slate-800">
        <Pagination page={page} pageSize={pageSize} total={total ?? meta?.total} onPage={onPage} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Employee</th>
              <th className="px-4 py-3 text-left font-medium">Window</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Meta</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => {
              const isCanceled = String(r.status ?? "") === "CANCELED";
              const status = String(r.status ?? "DRAFT");

              return (
                <tr key={r.id} className={cx("hover:bg-slate-50/70 dark:hover:bg-slate-900/20", isCanceled && "opacity-70")}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {r.employeeId ? `Employee ${r.employeeId}` : r.orgUnitId ? `OrgUnit ${r.orgUnitId}` : "—"}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>ID: {r.id}</span>
                      <CopyButton value={r.id} label="ID" size="xs" />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    <div className="font-medium">{fmt(r.startAt)} → {fmt(r.endAt)}</div>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {r.locationId ? `Location ${r.locationId}` : "No location"}{" "}
                      {r.positionId ? `• Position ${r.positionId}` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant="muted"
                      className={cx(
                        "rounded-full",
                        status === "PUBLISHED" && "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
                        status === "DRAFT" && "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200",
                        status === "CANCELED" && "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200"
                      )}
                    >
                      {status}
                    </Badge>

                    {r.publishedAt ? (
                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        Published: {fmt(r.publishedAt)}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    <div className="text-xs">Source: {String(r.source ?? "—")}</div>
                    <div className="mt-1 max-w-[280px] truncate text-[12px] text-slate-500 dark:text-slate-400">
                      {String(r.notes ?? "—")}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <ShiftRowActions row={r} busy={busy} onEdit={onEdit} onCancel={onCancel} />
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