"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  description?: string;
  right?: ReactNode;
};

export function TimeHeroCard({
  title = "Time & Attendance",
  description = "Review attendance and recorded time for the selected dates.",
  right,
}: Props) {
  return (
    <section aria-label={title + " filters"} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      <div className="flex min-w-0 flex-wrap items-center gap-2">{right}</div>
    </section>
  );
}
