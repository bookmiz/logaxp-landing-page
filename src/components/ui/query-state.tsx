"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { cn } from "@/logaxp/lib/cn";

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  loadingTitle = "Loading data",
  loadingDescription = "Preparing the latest workspace information.",
  errorTitle = "Unable to load data",
  errorDescription = "Refresh the page or try again in a moment.",
  emptyTitle,
  emptyDescription,
  emptyAction,
  className,
  children,
}: {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  loadingTitle?: string;
  loadingDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <EmptyState
        className={className}
        icon={<Loader2 className="h-5 w-5 animate-spin" />}
        title={loadingTitle}
        description={loadingDescription}
      />
    );
  }

  if (isError) {
    return (
      <EmptyState
        className={cn("border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/20", className)}
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        title={errorTitle}
        description={errorDescription}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        className={className}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return <>{children}</>;
}
