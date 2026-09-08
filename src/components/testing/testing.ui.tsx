"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import type { Paginated, TestExecutionStatusInput, TestRun, TestRunOutcomeStatus } from "@/logaxp/lib/testing/testing.types";
import { Badge } from "@/logaxp/components/ui/badge";

export function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function normalizeList<T>(res: Paginated<T> | T[] | any): { items: T[]; total: number } {
  if (Array.isArray(res)) return { items: res as T[], total: (res as T[]).length };
  if (res && typeof res === "object" && Array.isArray((res as any).items)) {
    const items = (res as any).items as T[];
    const total = typeof (res as any).total === "number" ? (res as any).total : items.length;
    return { items, total };
  }
  // fallback: common envelopes
  if (Array.isArray(res?.data?.items)) {
    const items = res.data.items as T[];
    const total = typeof res.data.total === "number" ? res.data.total : items.length;
    return { items, total };
  }
  return { items: [], total: 0 };
}

export function HeroPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
      {children}
    </div>
  );
}

export function MutedPill({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="muted" className="rounded-full">
      {children}
    </Badge>
  );
}

export function normalizeExecutionStatus(status: TestExecutionStatusInput | string | null | undefined) {
  const value = String(status ?? "").trim().toUpperCase();
  if (value === "PASSED") return "PASS";
  if (value === "FAILED") return "FAIL";
  if (value === "PASS" || value === "FAIL" || value === "BLOCKED" || value === "SKIPPED") return value;
  return "SKIPPED";
}

export function executionStatusLabel(status: TestExecutionStatusInput | string | null | undefined) {
  const value = normalizeExecutionStatus(status);
  if (value === "PASS") return "Passed";
  if (value === "FAIL") return "Failed";
  if (value === "BLOCKED") return "Blocked";
  return "Not started";
}

export function runOutcome(run: Pick<TestRun, "summary" | "outcomeStatus">): TestRunOutcomeStatus {
  if (run.outcomeStatus) return run.outcomeStatus;
  const summary = run.summary;
  if (!summary || summary.total === 0 || summary.skipped === summary.total) return "NOT_STARTED";
  if (summary.fail > 0) return "FAILED";
  if (summary.blocked > 0) return "BLOCKED";
  if (summary.pass === summary.total) return "PASSED";
  return "NOT_STARTED";
}

export function runOutcomeLabel(outcome: TestRunOutcomeStatus | string | null | undefined) {
  if (outcome === "PASSED") return "Passed";
  if (outcome === "FAILED") return "Failed";
  if (outcome === "BLOCKED") return "Blocked";
  return "Not started";
}
