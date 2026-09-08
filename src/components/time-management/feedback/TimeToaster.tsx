"use client";

import * as React from "react";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useTimeToastStore, type ToastItem } from "./toast.store";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function iconFor(t: ToastItem) {
  if (t.tone === "success") return <CheckCircle2 className="h-4 w-4" />;
  if (t.tone === "error") return <AlertTriangle className="h-4 w-4" />;
  if (t.tone === "warning") return <AlertTriangle className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

function toneClass(t: ToastItem) {
  if (t.tone === "success")
    return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200";
  if (t.tone === "error")
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200";
  if (t.tone === "warning")
    return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200";
  return "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100";
}

export function TimeToaster() {
  const items = useTimeToastStore((s) => s.items);
  const remove = useTimeToastStore((s) => s.remove);

  if (!items.length) return null;

  return (
    <div className="fixed right-4 top-4 z-[90] w-[360px] max-w-[92vw] space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cx(
            "rounded-2xl border p-3 shadow-xl",
            "backdrop-blur-[2px]",
            toneClass(t)
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 opacity-90">{iconFor(t)}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t.title}</div>
                {t.description ? (
                  <div className="mt-1 text-sm opacity-90">{t.description}</div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => remove(t.id)}
              className="rounded-lg p-1 opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}