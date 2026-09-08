"use client";

import * as React from "react";
import { EMPLOYEE_DETAIL_TABS, TabKey, cn } from "./employee-detail.utils";

export function EmployeeDetailTabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap gap-2">
        {EMPLOYEE_DETAIL_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              "h-10 rounded-xl px-3 text-sm border transition",
              value === t.key
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}