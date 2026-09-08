"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, CheckCircle2, XCircle, Send } from "lucide-react";

import { Badge } from "@/logaxp/components/ui/badge";
import { TimesheetStatusBadge } from "./TimesheetStatusBadge";
import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { formatMinutes, shortId, formatIsoDateTime } from "@/logaxp/components/time-management/time.ui";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

/** ✅ Convert unknown -> minutes (number | null | undefined) safely */
function asMinutes(v: unknown): number | null | undefined {
  if (v === undefined || v === null) return v;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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
        {totalPages ? (
          <>
            {" "}
            of <span className="font-medium">{totalPages}</span>
          </>
        ) : null}
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

function CopyMini({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {}
      }}
      title="Copy"
    >
      <Copy className="h-3.5 w-3.5" />
      Copy
    </button>
  );
}

export function TimesheetsTable({
  rows,

  // pagination (optional)
  page,
  pageSize,
  total,
  onPage,

  busy,
  canSubmit,
  canDecide,

  onSubmit,
  onApprove,
  onReject,
}: {
  rows: Timesheet[];

  page?: number;
  pageSize?: number;
  total?: number;
  onPage?: (p: number) => void;

  busy?: boolean;
  canSubmit: boolean;
  canDecide: boolean;

  onSubmit: (row: Timesheet) => void;
  onApprove: (row: Timesheet) => void;
  onReject: (row: Timesheet) => void;
}) {
  const showPager = typeof page === "number" && typeof pageSize === "number" && typeof onPage === "function";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {showPager ? (
        <div className="border-b border-slate-100 p-3 dark:border-slate-800">
          <Pagination page={page!} pageSize={pageSize!} total={total} onPage={onPage!} />
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Timesheet</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Totals</th>
              <th className="px-4 py-3 text-left font-medium">Submitted</th>
              <th className="px-4 py-3 text-left font-medium">Decision</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((t) => {
              const isDraft = String(t.status).toUpperCase() === "DRAFT";
              const isSubmitted = String(t.status).toUpperCase() === "SUBMITTED";

              // ✅ protect against Timesheet[string]: unknown indexing
              const totalMin = asMinutes((t as any).totalMinutes);
              const regularMin = asMinutes((t as any).regularMinutes);
              const billableMin = asMinutes((t as any).billableMinutes);
              const otMin = asMinutes((t as any).overtimeMinutes);
              const dtMin = asMinutes((t as any).doubleTimeMinutes);

              const hasOT = (typeof otMin === "number" ? otMin : 0) > 0;
              const hasDT = (typeof dtMin === "number" ? dtMin : 0) > 0;

              return (
                <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      <Link className="hover:underline" href={`/portal/time/payroll/timesheets/${t.id}`}>
                        {String(t.payPeriod?.label || `PayPeriod ${shortId(t.payPeriodId)}`)}
                      </Link>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>ID: {shortId(t.id)}</span>
                      <CopyMini value={t.id} />
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Employee: <span className="font-medium">{shortId(t.employeeId)}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <TimesheetStatusBadge status={t.status} />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {hasOT ? (
                        <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200">
                          OT: {formatMinutes(otMin)}
                        </Badge>
                      ) : (
                        <Badge variant="muted" className="rounded-full">
                          OT: 0
                        </Badge>
                      )}

                      {hasDT ? (
                        <Badge className="rounded-full border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/25 dark:text-sky-200">
                          DT: {formatMinutes(dtMin)}
                        </Badge>
                      ) : (
                        <Badge variant="muted" className="rounded-full">
                          DT: 0
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-slate-900 tabular-nums dark:text-slate-50">
                      {totalMin == null ? "—" : formatMinutes(totalMin)}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Regular: {regularMin == null ? "—" : formatMinutes(regularMin)}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Billable: {billableMin == null ? "—" : formatMinutes(billableMin)}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {t.submittedAt ? formatIsoDateTime(t.submittedAt) : <span className="text-slate-400">—</span>}
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {t.decidedAt ? (
                      <div>
                        <div>{formatIsoDateTime(t.decidedAt)}</div>
                        {t.decisionNote ? (
                          <div className="mt-1 max-w-[260px] truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {t.decisionNote}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canSubmit && isDraft ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onSubmit(t)}
                          className={cx(
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-sm",
                            "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100/60",
                            "disabled:opacity-50",
                            "dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
                          )}
                        >
                          <Send className="h-4 w-4" />
                          Submit
                        </button>
                      ) : null}

                      {canDecide && isSubmitted ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onApprove(t)}
                            className={cx(
                              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-sm",
                              "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100/60",
                              "disabled:opacity-50",
                              "dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onReject(t)}
                            className={cx(
                              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-sm",
                              "border-red-200 bg-red-50 text-red-900 hover:bg-red-100/60",
                              "disabled:opacity-50",
                              "dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-200 dark:hover:bg-red-950/40"
                            )}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      ) : null}

                      <Link
                        href={`/portal/time/payroll/timesheets/${t.id}`}
                        className={cx(
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-sm",
                          "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                        )}
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showPager ? (
        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <Pagination page={page!} pageSize={pageSize!} total={total} onPage={onPage!} />
        </div>
      ) : null}
    </div>
  );
}