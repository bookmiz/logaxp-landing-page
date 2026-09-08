"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { EmployeeAccessStatus } from "@/logaxp/lib/employee-management/employee-management.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function humanize(status?: string | null) {
  if (!status) return "No Access";
  return String(status).replaceAll("_", " ");
}

export function EmployeeAccessStatusBadge({
  status,
}: {
  status?: EmployeeAccessStatus | null;
}) {
  const normalized = (status ?? "NONE") as EmployeeAccessStatus;

  const className =
    normalized === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
      : normalized === "INVITED"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
      : normalized === "DISABLED"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", className)}
    >
      {humanize(normalized)}
    </Badge>
  );
}