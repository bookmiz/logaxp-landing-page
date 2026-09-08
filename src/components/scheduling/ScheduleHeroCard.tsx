"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";

export function ScheduleHeroCard({
  title = "Scheduling",
  description = "Templates, assignments, shifts, publishing, and conflict detection — tenant scoped.",
  right,
}: {
  title?: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

      <CardHeader className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>

          {right ? <div className="flex items-center gap-2">{right}</div> : null}
        </div>
      </CardHeader>

      <CardContent className="relative pt-0">
        <div className="mt-1 h-px w-full bg-slate-100 dark:bg-slate-800" />
        <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          Tip: Use <span className="font-medium text-slate-700 dark:text-slate-200">Templates</span> +{" "}
          <span className="font-medium text-slate-700 dark:text-slate-200">Assignments</span> to generate reliable shifts.
        </div>
      </CardContent>
    </Card>
  );
}