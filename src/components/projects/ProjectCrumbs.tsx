// src/logaxp/components/projects/ProjectCrumbs.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function ProjectCrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((c, idx) => {
        const last = idx === items.length - 1;

        return (
          <React.Fragment key={`${c.label}-${idx}`}>
            {idx > 0 ? (
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
            ) : null}

            {c.href && !last ? (
              <Link
                href={c.href}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition",
                  "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                  "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                )}
              >
                {c.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs",
                  last
                    ? "font-semibold text-slate-900 ring-1 ring-slate-200 dark:text-slate-50 dark:ring-slate-800"
                    : "text-slate-600 dark:text-slate-300"
                )}
              >
                {c.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}