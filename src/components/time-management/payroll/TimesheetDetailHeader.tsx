"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { TimesheetStatusBadge } from "./TimesheetStatusBadge";
import { shortId, formatIsoDateTime } from "@/logaxp/components/time-management/time.ui";

export function TimesheetDetailHeader({
  sheet,
  right,
}: {
  sheet: Timesheet;
  right?: React.ReactNode;
}) {
  const payPeriodLabel =
    typeof sheet.payPeriod?.label === "string" && sheet.payPeriod.label.trim()
      ? sheet.payPeriod.label
      : `Timesheet ${shortId(sheet.id)}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <Link href="/portal/time/payroll/timesheets" className="inline-flex items-center gap-2 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Timesheets
          </Link>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {payPeriodLabel}
          </div>
          <TimesheetStatusBadge status={sheet.status} />
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div>
            Employee: <span className="font-medium">{shortId(sheet.employeeId)}</span>
          </div>
          <div>
            PayPeriod: <span className="font-medium">{shortId(sheet.payPeriodId)}</span>
          </div>
          <div>
            Updated: <span className="font-medium">{formatIsoDateTime(sheet.updatedAt ?? sheet.createdAt ?? null)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}
