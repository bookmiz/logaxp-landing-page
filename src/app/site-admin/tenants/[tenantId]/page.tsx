"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Tenant } from "@/logaxp/lib/tenants/tenant.types";
import { useTenants } from "@/logaxp/hooks/useTenants";

import { Button } from "@/logaxp/components/ui/button";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { toast } from "@/logaxp/components/ui/toast";

import type { TenantDetailsTab } from "../../../../components/site-admin/tenants/tenant-details.types";
import { TenantDetailsPanel } from "@/logaxp/components/site-admin/tenants/TenantDetailsPanel"

const DEFAULT_TAB: TenantDetailsTab = "overview";
const VALID_TABS = new Set<TenantDetailsTab>([
  "overview",
  "domains",
  "settings",
  "members",
  "rbac",
  "audit",
  "billing",
]);

function safeTab(tab: string | null): TenantDetailsTab {
  if (!tab) return DEFAULT_TAB;
  return VALID_TABS.has(tab as TenantDetailsTab) ? (tab as TenantDetailsTab) : DEFAULT_TAB;
}

export default function TenantDetailsPage() {
  const params = useParams<{ tenantId: string }>();
  const tenantId = params.tenantId;

  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = safeTab(searchParams.get("tab"));

  const { listTenants } = useTenants(); // ✅ works with what you already have
  // If you later add GET /tenants/:id, replace with getTenantById for efficiency.

  const [tenant, setTenant] = React.useState<Tenant | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadTenant = React.useCallback(async () => {
    try {
      setLoading(true);

      // Simple: reuse listTenants and find (works now)
      const all = await listTenants();
      const found = all.find((t) => t.id === tenantId) ?? null;

      if (!found) {
        toast.error("Tenant not found");
      }

      setTenant(found);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load tenant");
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, [listTenants, tenantId]);

  React.useEffect(() => {
    void loadTenant();
  }, [loadTenant]);

  const handleBack = React.useCallback(() => {
    router.back();
    // Optional fallback if user landed directly:
    // router.push("/site-admin/tenants");
  }, [router]);

  const handleTabChange = React.useCallback(
    (next: TenantDetailsTab) => {
      const qs = new URLSearchParams(searchParams.toString());
      qs.set("tab", next);
      router.replace(`/site-admin/tenants/${tenantId}?${qs.toString()}`, { scroll: false });
    },
    [router, tenantId, searchParams]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          ← Back
        </Button>

        <Button variant="outline" onClick={() => void loadTenant()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-[420px] rounded-xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      ) : !tenant ? (
        <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          Tenant not found or you don’t have access.
          <div className="mt-4">
            <Button onClick={() => router.push("/site-admin/tenants")}>Go to Tenants</Button>
          </div>
        </div>
      ) : (
        <TenantDetailsPanel
          tenant={tenant}
          tab={tab}
          onTabChange={handleTabChange}
          onTenantChange={setTenant}
        />
      )}
    </div>
  );
}