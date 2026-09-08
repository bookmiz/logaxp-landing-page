"use client";

import Link from "next/link";
import * as React from "react";
import { FileText, TrendingUp, Sparkles, Building2, Shield, ArrowRight } from "lucide-react";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { OnboardingShell } from "@/logaxp/components/onboarding/OnboardingShell";



function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function OnboardingHomePage() {
  const membership = useAuthStore((s) => s.membership);

  const perms = Array.isArray((membership as any)?.permissions)
    ? (((membership as any).permissions as string[]) ?? [])
    : [];

  const isOwner = Boolean((membership as any)?.isOwner);

  const canReadTemplates =
    isOwner || perms.includes("onboarding.templates.read") || perms.includes("onboarding.templates.write");

  const canReadInstances =
    isOwner || perms.includes("onboarding.instances.read") || perms.includes("onboarding.instances.write");

  if (!membership) {
    return (
      <div className="p-6">
        <EmptyState
          title="No tenant session"
          description="Select a tenant to access onboarding."
          icon={<Building2 className="h-8 w-8" />}
        />
      </div>
    );
  }

  if (!canReadTemplates && !canReadInstances) {
    return (
      <div className="p-6">
        <EmptyState
          title="No access"
          description="You don’t have onboarding permissions in this workspace."
          icon={<Shield className="h-8 w-8" />}
        />
      </div>
    );
  }

  return (
    <OnboardingShell
      title="Onboarding"
      subtitle="Manage templates and onboarding instances for employee setup."
      actions={
        <Link
          href="/portal/rbac"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <Shield className="h-3.5 w-3.5" />
          RBAC
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {/* Hero */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative">
          <CardTitle className="text-base">Onboarding Control</CardTitle>
          <CardDescription>Build consistent onboarding flows and track progress across employees.</CardDescription>
        </CardHeader>

        <CardContent className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="rounded-full">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Template-driven
            </Badge>
            <Badge variant="muted" className="rounded-full">
              <Shield className="mr-1 h-3.5 w-3.5" />
              Permission-gated
            </Badge>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300">
            {isOwner ? "Owner access" : "Role-based access"}
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-6">
        <Card
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition",
            "hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/10" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              Templates
            </CardTitle>
            <CardDescription>Create and maintain onboarding templates and steps.</CardDescription>
          </CardHeader>
          <CardContent className="relative flex items-center justify-between">
            <Button asChild disabled={!canReadTemplates}>
              <Link href="/portal/onboarding/templates">Open templates</Link>
            </Button>

            {!canReadTemplates ? (
              <span className="text-xs text-amber-700 dark:text-amber-300">No permission</span>
            ) : null}
          </CardContent>
        </Card>

        <Card
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition",
            "hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-700 dark:text-sky-300" />
              Instances
            </CardTitle>
            <CardDescription>Run onboarding for employees and monitor progress.</CardDescription>
          </CardHeader>
          <CardContent className="relative flex items-center justify-between">
            <Button asChild disabled={!canReadInstances}>
              <Link href="/portal/onboarding/instances">Open instances</Link>
            </Button>

            {!canReadInstances ? (
              <span className="text-xs text-amber-700 dark:text-amber-300">No permission</span>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </OnboardingShell>
  );
}