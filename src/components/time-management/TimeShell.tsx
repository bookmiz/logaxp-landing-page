"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Loader2, AlertCircle } from "lucide-react";

import { TimeTabs } from "./TimeTabs";
import { useTimeGuard } from "@/logaxp/hooks/time-management/useTimeGuard";

import { cn } from "@/logaxp/lib/cn";

type Props = {
  title: string;
  subtitle?: string;
  pill?: string;
  actions?: React.ReactNode;
  requiredAnyCapabilities?: string[];
  children: React.ReactNode;
};

export function TimeShell({
  title,
  subtitle,
  pill = "Time & Attendance",
  actions,
  requiredAnyCapabilities = ["portal.time"],
  children,
}: Props) {
  const router = useRouter();
  const guard = useTimeGuard(requiredAnyCapabilities);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-16">
      <div className="w-full">
        {/* ─── Hero Header ───────────────────────────────────────────────────── */}
        <div className="portal-module-heading">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-60 rounded-3xl -z-10 blur-xl" />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Title + Pill + Subtitle */}
            <div className="space-y-2 max-w-3xl">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary shadow-sm backdrop-blur-sm"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                </span>
                {pill}
              </Badge>

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

        {/* ─── Sticky Tabs with blur ─────────────────────────────────────────── */}
        <div className="portal-module-tabs sticky top-0 z-30 border-b">
          <div className="py-3">
            <TimeTabs />
          </div>
        </div>

        {/* ─── Guarded Content Area ──────────────────────────────────────────── */}
        <div className="pt-5">
          {guard.state === "loading" ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">Loading Time & Attendance</h2>
                  <p className="text-muted-foreground max-w-md">
                    Preparing your workspace and attendance data...
                  </p>
                </div>
              </div>
            </div>
          ) : guard.state === "blocked" ? (
            <div className="mx-auto max-w-3xl">
              <Card className="rounded-3xl border-destructive/20 bg-destructive/5 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>

                  <h2 className="mb-4 text-3xl font-bold">Access Denied</h2>
                  <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
                    {guard.reason}
                  </p>

                  <Button
                    size="lg"
                    onClick={() => router.push("/portal")}
                    className="gap-2 text-lg"
                  >
                    Return to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="animate-fade-in-up">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}