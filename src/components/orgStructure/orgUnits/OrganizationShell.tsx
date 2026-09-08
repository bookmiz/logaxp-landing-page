// src/components/organization/OrganizationShell.tsx
"use client";

import * as React from "react";
import { cn } from "@/logaxp/lib/cn";

interface OrganizationShellProps {
  title: string;
  subtitle?: string;
  pill?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function OrganizationShell({
  title,
  subtitle,
  pill = "Organization",
  actions,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
}: OrganizationShellProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-background to-muted/30 pb-16", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── Hero Header ───────────────────────────────────────────────────── */}
        <div className="relative pt-12 pb-14 md:pt-16 md:pb-20">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-indigo-500/5 opacity-60 rounded-3xl -z-10 blur-xl" />

          <div className={cn("flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between", headerClassName)}>
            {/* Left: Pill + Title + Subtitle */}
            <div className="space-y-5 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border-indigo-300/30 bg-indigo-50/80 px-5 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur-sm animate-pulse-slow dark:border-indigo-500/20 dark:bg-indigo-950/20 dark:text-indigo-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                </span>
                {pill}
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>

              {subtitle && (
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Right: Actions */}
            {actions && (
              <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* ─── Main Content Area ─────────────────────────────────────────────── */}
        <div
          className={cn(
            "rounded-3xl border border-border/50 bg-card/80 shadow-2xl backdrop-blur-sm transition-all hover:shadow-3xl animate-fade-in-up",
            contentClassName
          )}
        >
          <div className="p-6 md:p-8 lg:p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}