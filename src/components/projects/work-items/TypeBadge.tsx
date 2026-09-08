"use client";

import { cn } from "@/logaxp/lib/cn";
import { 
  BookOpen, 
  Sparkles, 
  CheckSquare, 
  Bug, 
  Layers,
  type LucideIcon
} from "lucide-react";

export function TypeBadge({ 
  type,
  size = "md",
  showIcon = true 
}: { 
  type?: string | null;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}) {
  const t = String(type ?? "TASK").toUpperCase();
  
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2 py-0.5 text-[11px] gap-1.5",
    lg: "px-2.5 py-1 text-xs gap-1.5",
  };

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  type TypeConfig = {
    icon: LucideIcon;
    label: string;
    className: string;
  };

  const typeConfig: Record<string, TypeConfig> = {
    EPIC: {
      icon: Layers,
      label: "Epic",
      className: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-400",
    },
    STORY: {
      icon: BookOpen,
      label: "Story",
      className: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400",
    },
    TASK: {
      icon: CheckSquare,
      label: "Task",
      className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400",
    },
    BUG: {
      icon: Bug,
      label: "Bug",
      className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400",
    },
    SUBTASK: {
      icon: Sparkles,
      label: "Subtask",
      className: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
    },
  };

  // Fallback for unknown types
  const config = typeConfig[t] || {
    icon: CheckSquare,
    label: t.charAt(0) + t.slice(1).toLowerCase(),
    className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        config.className
      )}
    >
      {showIcon && (
        <Icon 
          size={iconSize[size]} 
          className={cn(
            "opacity-80",
            t === "EPIC" && "stroke-[1.5]",
          )} 
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}