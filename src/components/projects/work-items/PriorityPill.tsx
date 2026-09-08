"use client";

import { cn } from "@/logaxp/lib/cn";

export function PriorityPill({ 
  priority, 
  size = "md" 
}: { 
  priority?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const p = String(priority ?? "MEDIUM").toUpperCase();
  
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-[11px]",
    lg: "px-2.5 py-1 text-xs",
  };

  const priorityConfig: Record<string, { color: string; label: string }> = {
    URGENT: {
      color: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400",
      label: "Urgent"
    },
    HIGH: {
      color: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-400",
      label: "High"
    },
    MEDIUM: {
      color: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400",
      label: "Medium"
    },
    LOW: {
      color: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400",
      label: "Low"
    }
  };

  // Fallback for unknown priorities
  const config = priorityConfig[p] || {
    color: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
    label: p.charAt(0) + p.slice(1).toLowerCase()
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        config.color
      )}
    >
      {/* Priority indicator dot */}
      <span className={cn(
        "mr-1 h-1.5 w-1.5 rounded-full",
        p === "URGENT" && "bg-red-500",
        p === "HIGH" && "bg-orange-500",
        p === "MEDIUM" && "bg-blue-500",
        p === "LOW" && "bg-green-500",
        !priorityConfig[p] && "bg-slate-400"
      )} />
      {config.label}
    </span>
  );
}