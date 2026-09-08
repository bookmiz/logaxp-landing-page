"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { PayPeriodStatus } from "@/logaxp/lib/time-management/timePayroll.types";
import { statusTone } from "./payroll.ui";

export function PayPeriodStatusBadge({ status }: { status?: PayPeriodStatus | string | null }) {
  const tone = statusTone(status);

  if (tone === "emerald") {
    return (
      <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
        {String(status ?? "OPEN")}
      </Badge>
    );
  }

  if (tone === "amber") {
    return (
      <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200">
        {String(status ?? "LOCKED")}
      </Badge>
    );
  }

  if (tone === "red") {
    return (
      <Badge className="rounded-full border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-200">
        {String(status ?? "ERROR")}
      </Badge>
    );
  }

  return (
    <Badge variant="muted" className="rounded-full">
      {String(status ?? "—")}
    </Badge>
  );
}