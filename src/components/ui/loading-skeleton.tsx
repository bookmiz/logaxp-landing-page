// src/components/ui/loading-skeleton.tsx
"use client";

import * as React from "react";
import { cn } from "@/logaxp/lib/cn";

/**
 * LoadingSkeleton
 * - Minimal, reusable skeleton blocks
 * - No extra deps
 */
export function LoadingSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: Math.max(1, lines) }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 w-full rounded-lg bg-slate-200/70 animate-pulse",
            "dark:bg-slate-800/70",
            i === 0 && "h-4",
            i === lines - 1 && "w-2/3"
          )}
        />
      ))}
    </div>
  );
}

/**
 * TableSkeleton
 * - Helpful for list pages while loading
 */
export function TableSkeleton({
  rows = 6,
  cols = 6,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-4", "dark:border-slate-800 dark:bg-slate-950", className)}>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((__, c) => (
              <div
                key={c}
                className={cn("h-3 rounded-lg bg-slate-200/70 animate-pulse", "dark:bg-slate-800/70", c === 0 && "h-4")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}