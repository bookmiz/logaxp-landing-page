// src/components/onboarding/OnboardingShell.tsx
"use client";

import * as React from "react";
import { cn } from "@/logaxp/lib/cn";

interface OnboardingShellProps {
  title: string;
  subtitle?: string;
  pill?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function OnboardingShell({
  title,
  subtitle,
  pill = "Onboarding",
  actions,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
}: OnboardingShellProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-background to-muted/30 pb-16", className)}>
      <div className="w-full">
        {/* ─── Hero Header ───────────────────────────────────────────────────── */}
        <div className="portal-module-heading">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5 opacity-60 rounded-3xl -z-10 blur-xl" />

          <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", headerClassName)}>
            {/* Left: Pill + Title + Subtitle */}
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border-emerald-300/30 bg-emerald-50/80 px-2 py-1 text-[10px] font-medium text-emerald-700 shadow-sm backdrop-blur-sm animate-pulse-slow dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                {pill}
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>

              {subtitle && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
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
          <div className="p-4 md:p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}