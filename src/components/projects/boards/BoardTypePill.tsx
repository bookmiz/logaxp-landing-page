"use client";

export function BoardTypePill({ type }: { type?: string }) {
  const t = String(type ?? "UNKNOWN");
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
      {t}
    </span>
  );
}