"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/logaxp/lib/cn";

type Size = "sm" | "md" | "lg";

function sizeClasses(size: Size) {
  switch (size) {
    case "sm":
      return "h-9 min-w-9 px-3 text-xs rounded-xl";
    case "lg":
      return "h-11 min-w-11 px-4 text-sm rounded-2xl";
    default:
      return "h-10 min-w-10 px-3 text-sm rounded-2xl";
  }
}

function range(start: number, end: number) {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

function buildPagination(current: number, total: number, siblings = 1) {
  const totalNumbers = siblings * 2 + 5; // first + last + current + 2*siblings + 2 ellipsis
  if (total <= totalNumbers) return range(1, total);

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const pages: Array<number | "ellipsis"> = [];

  pages.push(1);

  if (showLeftEllipsis) pages.push("ellipsis");
  else pages.push(...range(2, leftSibling - 1));

  pages.push(...range(leftSibling, rightSibling));

  if (showRightEllipsis) pages.push("ellipsis");
  else pages.push(...range(rightSibling + 1, total - 1));

  pages.push(total);

  // remove duplicates caused by tight ranges
  return pages.filter((v, i, a) => (v === "ellipsis" ? true : a.indexOf(v) === i));
}

export function Pagination({
  className,
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
  showFirstLast = true,
  size = "md",
  disabled,
}: {
  className?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  showFirstLast?: boolean;
  size?: Size;
  disabled?: boolean;
}) {
  const pages = React.useMemo(
    () => buildPagination(currentPage, totalPages, siblings),
    [currentPage, totalPages, siblings]
  );

  const btnBase =
    "inline-flex items-center justify-center font-semibold transition-all select-none " +
    "border border-slate-200 bg-white text-slate-900 shadow-sm " +
    "hover:bg-slate-50 active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "dark:bg-slate-950 dark:text-slate-50 dark:border-slate-800 dark:hover:bg-slate-900";

  const active =
    "bg-slate-900 text-white border-slate-900 hover:bg-slate-900 " +
    "dark:bg-slate-50 dark:text-slate-900 dark:border-slate-50";

  const s = sizeClasses(size);

  const go = (p: number) => {
    if (disabled) return;
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
  };

  return (
    <nav className={cn("flex items-center justify-between gap-3", className)} aria-label="Pagination">
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Page <span className="font-bold text-slate-900 dark:text-slate-50">{currentPage}</span> of{" "}
        <span className="font-bold text-slate-900 dark:text-slate-50">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {showFirstLast ? (
          <button
            type="button"
            className={cn(btnBase, s)}
            onClick={() => go(1)}
            disabled={disabled || currentPage === 1}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          className={cn(btnBase, s)}
          onClick={() => go(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <span
              key={`e-${idx}`}
              className={cn(
                "inline-flex items-center justify-center",
                s,
                "border border-transparent text-slate-500 dark:text-slate-400"
              )}
              aria-hidden="true"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={cn(btnBase, s, p === currentPage && active)}
              onClick={() => go(p)}
              disabled={disabled}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className={cn(btnBase, s)}
          onClick={() => go(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {showFirstLast ? (
          <button
            type="button"
            className={cn(btnBase, s)}
            onClick={() => go(totalPages)}
            disabled={disabled || currentPage === totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </nav>
  );
}