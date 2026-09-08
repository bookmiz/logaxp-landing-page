"use client";

import * as React from "react";
import { Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";

type Props = {
  title?: string;
  description?: string;
  right?: React.ReactNode;
};

export function TimeHeroCard({
  title = "Time & Attendance",
  description = "Track time entries, attendance clocks, and focused work timers — scoped by tenant.",
  right,
}: Props) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

      <CardHeader className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              Portal • Time
            </div>

            <CardTitle className="mt-2 flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5" />
              {title}
            </CardTitle>

            <CardDescription className="mt-1">{description}</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="rounded-full">
              Stage 1
            </Badge>
            {right}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-0">
        <div className="mt-1 h-px w-full bg-slate-100 dark:bg-slate-800" />
        <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          Tip: Stage 2 will add overview analytics and quick actions.
        </div>
      </CardContent>
    </Card>
  );
}