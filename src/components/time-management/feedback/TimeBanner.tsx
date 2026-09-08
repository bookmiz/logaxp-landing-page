"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Tone = "info" | "warning" | "error";

export function TimeBanner({
  tone = "info",
  title,
  children,
  right,
}: {
  tone?: Tone;
  title: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const icon =
    tone === "error" ? <AlertTriangle className="h-4 w-4" /> :
    tone === "warning" ? <AlertTriangle className="h-4 w-4" /> :
    <Info className="h-4 w-4" />;

  const box =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
        : "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200";

  return (
    <div className={cx("flex flex-col gap-2 rounded-2xl border p-4", box)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{title}</div>
            {children ? <div className="mt-1 text-sm opacity-90">{children}</div> : null}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}