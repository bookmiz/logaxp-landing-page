import * as React from "react";
import { cn } from "@/logaxp/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false, // Add this with default false
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean; // Add this optional prop
}) {
  return (
    <div
      className={cn(
        // Conditional classes based on compact mode
        compact 
          ? "rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-950"
          : "rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950",
        className
      )}
    >
      {icon ? (
        <div className={cn(
          "flex justify-center text-slate-400",
          compact ? "mb-2" : "mb-3"
        )}>
          {icon}
        </div>
      ) : null}
      
      <h3 className={cn(
        "font-bold text-slate-900 dark:text-slate-50",
        compact ? "text-sm" : "text-base"
      )}>
        {title}
      </h3>
      
      {description ? (
        <p className={cn(
          "text-slate-600 dark:text-slate-300",
          compact ? "mt-1 text-xs" : "mt-1 text-sm"
        )}>
          {description}
        </p>
      ) : null}
      
      {action ? (
        <div className={cn(
          "flex justify-center",
          compact ? "mt-3" : "mt-5"
        )}>
          {action}
        </div>
      ) : null}
    </div>
  );
}