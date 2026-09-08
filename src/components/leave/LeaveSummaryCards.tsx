"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { LeaveSummaryResult } from "@/logaxp/lib/leave/leave.types";

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function Card({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "bad";
}) {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200"
      : tone === "bad"
      ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-200"
      : "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${cls}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function LeaveSummaryCards({
  summary,
}: {
  summary: LeaveSummaryResult | null;
}) {
  const by = (summary?.byStatus ?? {}) as Record<string, any>;

  const requested = num(by.REQUESTED);
  const approved = num(by.APPROVED);
  const rejected = num(by.REJECTED);
  const canceled = num(by.CANCELED);

  return (
    <div className="grid gap-3 md:grid-cols-5">
      <Card label="Requested" value={requested} tone="warn" />
      <Card label="Approved" value={approved} tone="ok" />
      <Card label="Rejected" value={rejected} tone="bad" />
      <Card label="Canceled" value={canceled} tone="neutral" />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Approved days</div>
          <Badge variant="muted" className="rounded-full">
            range-based
          </Badge>
        </div>
        <div className="mt-1 text-lg font-semibold text-slate-900 tabular-nums dark:text-slate-50">
          {num(summary?.approvedDays)}
        </div>
        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Counts inclusive days across approved requests in the date range.
        </div>
      </div>
    </div>
  );
}