// src/components/ui/error-banner.tsx
"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/logaxp/lib/cn";

import { Button } from "@/logaxp/components/ui/button";

/**
 * ErrorBanner
 * - Persistent, page-level error surface (enterprise UX)
 * - Use alongside toast (toast is ephemeral; banner is durable)
 */
export function ErrorBanner({
  title = "Something went wrong",
  message,
  onDismiss,
  className,
}: {
  title?: string;
  message?: string | null;
  onDismiss?: () => void;
  className?: string;
}) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900",
        "dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="font-semibold">{title}</div>
            <div className="mt-1 text-sm text-rose-800/90 dark:text-rose-200/90 break-words">{message}</div>
          </div>
        </div>

        {onDismiss ? (
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}