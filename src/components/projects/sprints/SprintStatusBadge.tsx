"use client";

export function SprintStatusBadge({ status }: { status?: string | null }) {
  const s = String(status ?? "PLANNED");
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
      {s}
    </span>
  );
}