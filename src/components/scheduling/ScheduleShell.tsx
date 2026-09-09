"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { Loader2, AlertCircle, Calendar } from "lucide-react";

import { ScheduleTabs } from "./ScheduleTabs";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { hasAnyCapability } from "@/logaxp/lib/auth/portalAuthz";

import { cn } from "@/logaxp/lib/cn";

type GuardResult =
  | { state: "loading"; allowed: false; reason?: string }
  | { state: "blocked"; allowed: false; reason: string }
  | { state: "allowed"; allowed: true };

// Stable default capabilities
const DEFAULT_SCHEDULE_CAPS = ["portal.schedule"] as const;

interface ScheduleShellProps {
  title: string;
  subtitle?: string;
  pill?: string;
  actions?: React.ReactNode;
  requiredAnyCapabilities?: string[];
  children: React.ReactNode;
  className?: string;
}

export function ScheduleShell({
  title,
  subtitle,
  pill = "Scheduling",
  actions,
  requiredAnyCapabilities = DEFAULT_SCHEDULE_CAPS as unknown as string[],
  children,
  className = "",
}: ScheduleShellProps) {
  const router = useRouter();

  // ────────────────────────────────────────
  // Guard logic (moved inline — no external hook needed)
  // ────────────────────────────────────────
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const membership = useAuthStore((s) => s.membership);

  const guard: GuardResult = React.useMemo(() => {
    if (!isHydrated) {
      return { state: "loading", allowed: false };
    }

    if (!membership) {
      return {
        state: "blocked",
        allowed: false,
        reason: "No workspace selected. Please choose a workspace to access Scheduling.",
      };
    }

    const hasAccess = hasAnyCapability(membership, requiredAnyCapabilities);
    if (!hasAccess) {
      return {
        state: "blocked",
        allowed: false,
        reason: "You don’t have permission to access Scheduling in this workspace.",
      };
    }

    return { state: "allowed", allowed: true };
  }, [isHydrated, membership, requiredAnyCapabilities]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-16">
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
            <ScheduleTabs />
          </div>
        </div>

        {/* ─── Guarded Content Area ──────────────────────────────────────────── */}
        <div className="pt-5">
          {guard.state === "loading" ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">Loading Schedule</h2>
                  <p className="text-muted-foreground max-w-md">
                    Preparing your scheduling workspace...
                  </p>
                </div>
              </div>
            </div>
          ) : guard.state === "blocked" ? (
            <div className="mx-auto max-w-3xl">
              <Card className="rounded-3xl border-destructive/20 bg-destructive/5 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>

                  <h2 className="mb-4 text-3xl font-bold">Access Denied</h2>
                  <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
                    {guard.reason}
                  </p>

                  <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" variant="outline" onClick={() => router.push("/portal")}>
                      Back to Dashboard
                    </Button>
                    <Button size="lg" onClick={() => router.push("/portal/settings/workspace")}>
                      Switch Workspace
                    </Button>
                  </div>
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