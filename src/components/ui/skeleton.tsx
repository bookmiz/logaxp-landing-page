import * as React from "react";
import { cn } from "@/logaxp/lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        [
          "relative overflow-hidden rounded-xl",
          "bg-slate-100 dark:bg-slate-900",
          "before:absolute before:inset-0",
          "before:-translate-x-full before:animate-[shimmer_1.4s_infinite]",
          "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
          "dark:before:via-white/10",
        ].join(" "),
        className
      )}
      {...props}
    />
  );
}

/**
 * Add this to your globals.css once:
 *
 * @keyframes shimmer {
 *   100% { transform: translateX(100%); }
 * }
 */