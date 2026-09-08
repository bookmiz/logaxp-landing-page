"use client";

import * as React from "react";
import { Lock, Unlock, Copy } from "lucide-react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { PayPeriod } from "@/logaxp/lib/time-management/timePayroll.types";
import { PayPeriodStatusBadge } from "./PayPeriodStatusBadge";
import { formatIsoDateTime, shortId } from "@/logaxp/components/time-management/time.ui";
import { isLockedLike } from "./payroll.ui";

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
        } catch {
          // ignore
        }
      }}
      title="Copy"
    >
      <Copy className="h-3.5 w-3.5" />
      Copy
    </button>
  );
}

export function PayPeriodsTable({
  rows,
  total,
  page,
  pageSize,
  onPage,
  busy,
  onLock,
  onUnlock,
}: {
  rows: PayPeriod[];
  total?: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  busy?: boolean;
  onLock: (id: string) => void;
  onUnlock: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-100 p-3 dark:border-slate-800">
        <Pagination page={page} pageSize={pageSize} total={total} onPage={onPage} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Period</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Range</th>
              <th className="px-4 py-3 text-left font-medium">Locked</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((pp) => {
              const locked = isLockedLike(pp.status);

              return (
                <tr key={pp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-50">{String(pp.label)}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{shortId(pp.id)}</span>
                      <CopyMini value={pp.id} />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <PayPeriodStatusBadge status={pp.status} />
                    {pp.frequency ? (
                      <div className="mt-2">
                        <Badge variant="muted" className="rounded-full">
                          {String(pp.frequency)}
                        </Badge>
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    <div className="text-[13px]">{formatIsoDateTime(pp.startAt)}</div>
                    <div className="text-[13px]">{formatIsoDateTime(pp.endAt)}</div>
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {pp.lockedAt ? (
                      <div className="text-[13px]">
                        {formatIsoDateTime(pp.lockedAt)}
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          by {pp.lockedByUserId ? shortId(String(pp.lockedByUserId)) : "—"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {!locked ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onLock(pp.id)}
                          className={cx(
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-sm",
                            "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100/60",
                            "disabled:opacity-50",
                            "dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200 dark:hover:bg-amber-950/40"
                          )}
                        >
                          <Lock className="h-4 w-4" />
                          Lock
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onUnlock(pp.id)}
                          className={cx(
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-sm",
                            "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                            "disabled:opacity-50",
                            "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                          )}
                        >
                          <Unlock className="h-4 w-4" />
                          Unlock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <Pagination page={page} pageSize={pageSize} total={total} onPage={onPage} />
      </div>
    </div>
  );
}