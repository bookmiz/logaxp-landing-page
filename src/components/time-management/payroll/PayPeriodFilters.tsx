"use client";

import * as React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function PayPeriodFilters({
  // ✅ optional now
  q,
  onQ,

  status,
  onStatus,

  from,
  onFrom,

  to,
  onTo,

  pageSize,
  onPageSize,

  onReset,
  right,
}: {
  q?: string;
  onQ?: (v: string) => void;

  status: string;
  onStatus: (v: string) => void;

  from?: string;
  onFrom?: (v: string) => void;

  to?: string;
  onTo?: (v: string) => void;

  pageSize: number;
  onPageSize: (n: number) => void;

  onReset: () => void;
  right?: React.ReactNode;
}) {
  const showSearch = typeof q === "string" && typeof onQ === "function";
  const showFrom = typeof from === "string" && typeof onFrom === "function";
  const showTo = typeof to === "string" && typeof onTo === "function";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-3 lg:grid-cols-12 lg:items-center">
        {/* Search (optional) */}
        {showSearch ? (
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Search label, id, status…"
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>
        ) : null}

        {/* Status */}
        <div className={cx(showSearch ? "lg:col-span-2" : "lg:col-span-3")}>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className={cx(
              "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
              "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
              "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            )}
          >
            <option value="">All statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="LOCKED">LOCKED</option>
            <option value="PAID">PAID</option>
          </select>
        </div>

        {showFrom ? (
          <div className={cx(showSearch ? "lg:col-span-2" : "lg:col-span-3")}>
            <input
              type="date"
              value={from}
              onChange={(e) => onFrom(e.target.value)}
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>
        ) : null}

        {showTo ? (
          <div className={cx(showSearch ? "lg:col-span-2" : "lg:col-span-3")}>
            <input
              type="date"
              value={to}
              onChange={(e) => onTo(e.target.value)}
              className={cx(
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              )}
            />
          </div>
        ) : null}

        {/* Page size */}
        <div className="lg:col-span-1">
          <select
            value={String(pageSize)}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className={cx(
              "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
              "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
              "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            )}
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={String(n)}>
                {n}/page
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <div className="lg:col-span-1 flex justify-end">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {right ? <div className="text-xs text-slate-500 dark:text-slate-400">{right}</div> : null}
    </div>
  );
}
