// src/components/org-structure/OrgStructureShell.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent } from "@/logaxp/components/ui/card";

import { cn } from "@/logaxp/lib/cn";

interface OrgStructureShellProps {
  title: string;
  subtitle?: string;
  pill?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  children: React.ReactNode;
  className?: string;
}

export function OrgStructureShell({
  title,
  subtitle,
  pill = "Org Structure",
  actions,
  showBackButton = true,
  backHref = "/portal/org-structure",
  children,
  className = "",
}: OrgStructureShellProps) {
  const router = useRouter();

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-background to-muted/30 pb-16", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── Hero Header ───────────────────────────────────────────────────── */}
        <div className="relative pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-60 rounded-3xl -z-10 blur-xl" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 max-w-3xl">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border-primary/30 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-sm"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                </span>
                {pill}
              </Badge>

              <div className="flex items-center gap-4">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(backHref)}
                    className="h-10 w-10 rounded-full"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}

                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {title}
                </h1>
              </div>

              {subtitle && (
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* ─── Main Content Card ─────────────────────────────────────────────── */}
        <Card className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl backdrop-blur-sm transition-all hover:shadow-3xl">
          <CardContent className="p-6 md:p-8 lg:p-10 animate-fade-in">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}