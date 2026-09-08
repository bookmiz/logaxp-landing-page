// src/components/orgStructure/shared/SelectField.tsx
"use client";

import React from "react";
import { cn } from "@/logaxp/lib/cn";

export type SelectOption = { value: string; label: string };

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled,
  className,
}: {
  label?: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</div>
      ) : null}

      <select
        className={cn(
          "h-10 w-full rounded-xl border bg-white px-3 text-sm shadow-sm",
          "border-slate-200 text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-slate-50/15 dark:focus:border-slate-700"
        )}
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}