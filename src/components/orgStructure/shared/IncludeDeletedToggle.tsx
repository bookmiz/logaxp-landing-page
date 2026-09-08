// src/components/orgStructure/shared/IncludeDeletedToggle.tsx
"use client";

import React from "react";
import { cn } from "@/logaxp/lib/cn";

export function IncludeDeletedToggle({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
        "border-slate-200 bg-white text-slate-800",
        "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200",
        className
      )}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="font-semibold">Include deleted</span>
    </label>
  );
}