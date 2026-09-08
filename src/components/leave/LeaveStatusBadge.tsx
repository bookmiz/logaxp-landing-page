"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";

export function LeaveStatusBadge({ status }: { status: string }) {
  const s = String(status || "").toUpperCase();

  const cls =
    s === "APPROVED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
      : s === "REQUESTED"
      ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200"
      : s === "REJECTED"
      ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-200"
      : s === "CANCELED"
      ? "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-200"
      : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200";

  return (
    <Badge className={`rounded-full border ${cls}`}>
      {s || "—"}
    </Badge>
  );
}