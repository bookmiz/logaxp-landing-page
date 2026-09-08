"use client";

import * as React from "react";
import { Globe, Building2, Info } from "lucide-react";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { TenantDomainsManager } from "@/logaxp/components/site-admin/tenants/advanced/TenantDomainsManager";
import type { Tenant, TenantDomain } from "@/logaxp/lib/tenants/tenant.types";

function toTenantShell(authTenant: {
  id: string;
  name?: string | null;
  slug?: string | null;
}): Tenant {
  return {
    id: authTenant.id,
    name: authTenant.name ?? "Tenant",
    slug: authTenant.slug ?? authTenant.id,
    status: "ACTIVE",
    timezone: "UTC",
    locale: "en-US",
    currency: "USD",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: null,
    domains: [],
    metadata: null,
    planKey: null,
    deletedAt: null,
  };
}

export default function TenantPortalDomainsPage() {
  // ✅ FIX: use separate selectors (stable snapshots, no infinite loop warning)
  const tenant = useAuthStore((s) => s.tenant);
  const membership = useAuthStore((s) => s.membership);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const requiresTenantSelection = useAuthStore((s) => s.requiresTenantSelection);

  const [tenantView, setTenantView] = React.useState<Tenant | null>(null);

  React.useEffect(() => {
    if (!tenant) {
      setTenantView(null);
      return;
    }

    setTenantView(
      toTenantShell({
        id: tenant.id,
        name: tenant.name ?? null,
        slug: tenant.slug ?? null,
      })
    );
  }, [tenant]);

  const handleDomainsChange = React.useCallback((domains: TenantDomain[]) => {
    setTenantView((prev) => (prev ? { ...prev, domains } : prev));
  }, []);

  if (!isHydrated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            Loading portal session...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresTenantSelection) {
    return (
      <div className="p-6">
        <EmptyState
          title="Tenant selection required"
          description="Please select a tenant first before managing domains."
          icon={<Building2 className="h-8 w-8" />}
        />
      </div>
    );
  }

  if (!tenant || !membership || !tenantView) {
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
    <div className="space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Management
          </CardTitle>
          <CardDescription>
            Manage custom domains for <strong>{tenant.name ?? tenant.id}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
               Domain management 
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <TenantDomainsManager tenant={tenantView} onDomainsChange={handleDomainsChange} />
    </div>
  );
}