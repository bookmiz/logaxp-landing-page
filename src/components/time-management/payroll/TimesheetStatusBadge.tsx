"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { TimesheetStatus } from "@/logaxp/lib/time-management/timePayroll.types";

function tone(status?: TimesheetStatus | string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s === "APPROVED") return "emerald";
  if (s === "SUBMITTED") return "amber";
  if (s === "REJECTED") return "red";
  if (s === "DRAFT") return "muted";
  return "muted";
}

export function TimesheetStatusBadge({ status }: { status?: TimesheetStatus | string | null }) {
  const t = tone(status);

  if (t === "emerald") {
    return (
      <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
        {String(status ?? "APPROVED")}
      </Badge>
    );
  }
  if (t === "amber") {
    return (
      <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200">
        {String(status ?? "SUBMITTED")}
      </Badge>
    );
  }
  if (t === "red") {
    return (
      <Badge className="rounded-full border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-200">
        {String(status ?? "REJECTED")}
      </Badge>
    );
  }

  return (
    <Badge variant="muted" className="rounded-full">
      {String(status ?? "DRAFT")}
    </Badge>
  );
}