"use client";

import * as React from "react";
import { Button } from "@/logaxp/components/ui/button";
import { TimeFiltersBar } from "@/logaxp/components/time-management/TimeFiltersBar";

type Props = {
  q: string;
  onQ: (v: string) => void;

  projectId: string;
  onProjectId: (v: string) => void;

  workItemId: string;
  onWorkItemId: (v: string) => void;

  pageSize: number;
  onPageSize: (v: number) => void;

  onReset: () => void;
  right?: React.ReactNode;
};

export function TimerHistoryFilters({
  q,
  onQ,
  projectId,
  onProjectId,
  workItemId,
  onWorkItemId,
  pageSize,
  onPageSize,
  onReset,
  right,
}: Props) {
  return (
    <TimeFiltersBar
      searchValue={q}
      onSearchChange={onQ}
      searchPlaceholder="Search timer history (local filter)…"
      left={
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={projectId}
            onChange={(e) => onProjectId(e.target.value)}
            placeholder="Project ID…"
            className="h-9 w-[170px] rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
          />
          <input
            value={workItemId}
            onChange={(e) => onWorkItemId(e.target.value)}
            placeholder="Work Item ID…"
            className="h-9 w-[170px] rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
          />

          <select
            value={String(pageSize)}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </select>

          <Button variant="outline" size="sm" onClick={onReset}>
            Reset
          </Button>
        </div>
      }
      right={right}
    />
  );
}