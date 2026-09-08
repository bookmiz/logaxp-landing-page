"use client";

import * as React from "react";

type Tone = "info" | "warning" | "danger" | "success";

function toneClasses(t: Tone) {
  if (t === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200";
  if (t === "warning") return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200";
  if (t === "danger") return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200";
  return "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-200";
}

export function ScheduleBanner({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-3 text-sm ${toneClasses(tone)}`}>
      <div className="font-medium">{title}</div>
      {children ? <div className="mt-1 text-[13px] opacity-95">{children}</div> : null}
    </div>
  );
}