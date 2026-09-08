"use client";

import * as React from "react";
import { Search } from "lucide-react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (v: string) => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function TimeFiltersBar({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  left,
  right,
}: Props) {
  const showSearch = typeof onSearchChange === "function";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {showSearch ? (
            <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className={cx(
                  "h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none",
                  "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                  "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
                )}
              />
            </div>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{left}</div>
        </div>

        {right ? (
          <div className="flex flex-wrap items-center justify-end gap-2 xl:shrink-0">{right}</div>
        ) : null}
      </div>
    </div>
  );
}