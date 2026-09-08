"use client";

import * as React from "react";
import Link from "next/link";
import {
  KeyRound,
  Sparkles,
  Shield,
  Building2,
  ArrowRight,
  RefreshCw,
  Plus,
} from "lucide-react";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";

import { ApiKeysManager } from "@/logaxp/lib/security/ApiKeysManager";

function Shell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            Security
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          ) : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      {children}
    </div>
  );
}

export default function TenantPortalApiKeysPage() {
  const tenant = useAuthStore((s) => s.tenant);
  const membership = useAuthStore((s) => s.membership);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const requiresTenantSelection = useAuthStore((s) => s.requiresTenantSelection);

  // guards
  if (!isHydrated) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-sm text-slate-500">Loading portal session...</CardContent>
        </Card>
      </div>
    );
  }

  if (requiresTenantSelection) {
    return (
      <div className="p-6">
        <EmptyState
          title="Tenant selection required"
          description="Please select a tenant first before managing API keys."
          icon={<Building2 className="h-8 w-8" />}
        />
      </div>
    );
  }

  if (!tenant || !membership) {
    return (
      <div className="p-6">
        <EmptyState
          title="No tenant session"
          description="This page requires an active tenant membership session."
          icon={<Building2 className="h-8 w-8" />}
        />
      </div>
    );
  }

  return (
    <Shell
      title="API Keys"
      subtitle={`Create and manage API keys for ${tenant.name ?? tenant.id}.`}
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
      {/* hero */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-slate-900 dark:text-slate-50" />
            API Keys
          </CardTitle>
          <CardDescription>
            Keys are scoped and should be treated like passwords. Raw keys are shown only once.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="rounded-full">
              <Shield className="mr-1 h-3.5 w-3.5" />
              Scoped access
            </Badge>

            <Badge variant="muted" className="rounded-full">
              <KeyRound className="mr-1 h-3.5 w-3.5" />
              Rotate anytime
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.dispatchEvent(new Event("apiKeys:refresh"))}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            <Button
              type="button"
              onClick={() => window.dispatchEvent(new Event("apiKeys:create"))}
              title="Create API key"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <ApiKeysManager />
    </Shell>
  );
}