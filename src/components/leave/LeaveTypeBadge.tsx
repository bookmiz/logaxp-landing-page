"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";

export function LeaveTypeBadge({ type }: { type: string }) {
  const t = String(type || "").toUpperCase();

  const cls =
    t.includes("VAC")
      ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/25 dark:text-sky-200"
      : t.includes("SICK")
      ? "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/25 dark:text-purple-200"
      : t.includes("PERSON")
      ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200"
      : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200";

  return (
    <Badge className={`rounded-full border ${cls}`}>
      {t || "—"}
    </Badge>
  );
}