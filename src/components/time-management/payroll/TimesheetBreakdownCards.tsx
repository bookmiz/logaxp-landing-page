"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/logaxp/components/ui/card";
import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";
import { formatMinutes } from "@/logaxp/components/time-management/time.ui";
import { Badge } from "@/logaxp/components/ui/badge";

function StatCard({
  title,
  value,
  hint,
  badge,
}: {
  title: string;
  value: string;
  hint?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {hint ? <CardDescription>{hint}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</div>
          {badge}
        </div>
      </CardContent>
    </Card>
  );
}

export function TimesheetBreakdownCards({ sheet }: { sheet: Timesheet }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total"
        value={formatMinutes(sheet.totalMinutes)}
        badge={<Badge variant="muted" className="rounded-full">All time</Badge>}
      />
      <StatCard
        title="Regular"
        value={formatMinutes(sheet.regularMinutes)}
        badge={<Badge variant="muted" className="rounded-full">Base</Badge>}
      />
      <StatCard
        title="Overtime"
        value={formatMinutes(sheet.overtimeMinutes)}
        badge={
          sheet.overtimeMinutes ? (
            <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200">
              OT
            </Badge>
          ) : (
            <Badge variant="muted" className="rounded-full">OT</Badge>
          )
        }
      />
      <StatCard
        title="Double Time"
        value={formatMinutes(sheet.doubleTimeMinutes)}
        badge={
          sheet.doubleTimeMinutes ? (
            <Badge className="rounded-full border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/25 dark:text-sky-200">
              DT
            </Badge>
          ) : (
            <Badge variant="muted" className="rounded-full">DT</Badge>
          )
        }
      />
    </div>
  );
}