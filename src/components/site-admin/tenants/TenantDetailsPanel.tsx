"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import type { Tenant, TenantDomain, TenantSettings } from "@/logaxp/lib/tenants/tenant.types";
import type { TenantDetailsTab } from "./tenant-details.types";
import type { TenantAuditEvent, TenantBillingSnapshot } from "./advanced/tenant-admin.types";

import { useTenants } from "@/logaxp/hooks/useTenants";
import { toast } from "@/logaxp/components/ui/toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/logaxp/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";

import { TenantStatusBadge } from "./TenantStatusBadge";
import { TenantDomainsManager } from "./advanced/TenantDomainsManager";
import { TenantSettingsManager } from "./advanced/TenantSettingsManager";
import { TenantMembersTable } from "./advanced/TenantMembersTable";
import { TenantRolesPermissionsPanel } from "./advanced/TenantRolesPermissionsPanel";
import { TenantAuditTimeline } from "./advanced/TenantAuditTimeline";
import { TenantBillingSnapshotCard } from "./advanced/TenantBillingSnapshotCard";
import { TenantFeatureFlagsEditor } from "./advanced/TenantFeatureFlagsEditor";
import { TenantBrandingEditor } from "./advanced/TenantBrandingEditor";

type Props = {
  tenant: Tenant;
  tab: TenantDetailsTab;
  onTabChange: (tab: TenantDetailsTab) => void;
  onTenantChange?: (tenant: Tenant) => void;

  auditEvents?: TenantAuditEvent[];
  billingSnapshot?: TenantBillingSnapshot | null;
  billingLoading?: boolean;
  onRefreshBillingSnapshot?: (
    tenantId: string
  ) => Promise<TenantBillingSnapshot | null | undefined> | TenantBillingSnapshot | null | undefined;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function JsonPreview({ value }: { value?: Record<string, unknown> | null }) {
  if (!value || Object.keys(value).length === 0) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">No data</div>;
  }
  return (
    <pre className="max-h-60 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function TenantDetailsPanel({
  tenant,
  tab,
  onTabChange,
  onTenantChange,
  auditEvents = [],
  billingSnapshot,
  billingLoading,
  onRefreshBillingSnapshot,
}: Props) {
  const { updateSettings } = useTenants();

  const [savingFlags, setSavingFlags] = React.useState(false);
  const [savingBranding, setSavingBranding] = React.useState(false);

  const [localBillingSnapshot, setLocalBillingSnapshot] = React.useState<TenantBillingSnapshot | null>(
    billingSnapshot ?? null
  );
  const [refreshingBilling, setRefreshingBilling] = React.useState(false);

  React.useEffect(() => {
    setLocalBillingSnapshot(billingSnapshot ?? null);
  }, [tenant.id, billingSnapshot]);

  const patchTenant = React.useCallback(
    (patch: Partial<Tenant>) => {
      onTenantChange?.({ ...tenant, ...patch });
    },
    [tenant, onTenantChange]
  );

  const handleDomainsChange = React.useCallback(
    (domains: TenantDomain[]) => patchTenant({ domains }),
    [patchTenant]
  );

  const handleSettingsChange = React.useCallback(
    (settings: TenantSettings | null) => patchTenant({ settings }),
    [patchTenant]
  );

  const handleSaveFeatureFlags = React.useCallback(
    async (next: Record<string, unknown>) => {
      try {
        setSavingFlags(true);
        const updated = await updateSettings({ featureFlags: next }, tenant.id);
        handleSettingsChange(updated);
      } catch (e) {
        console.error(e);
        toast.error("Failed to update feature flags");
        throw e;
      } finally {
        setSavingFlags(false);
      }
    },
    [tenant.id, updateSettings, handleSettingsChange]
  );

  const handleSaveBranding = React.useCallback(
    async (next: Record<string, unknown>) => {
      try {
        setSavingBranding(true);
        const updated = await updateSettings({ branding: next }, tenant.id);
        handleSettingsChange(updated);
      } catch (e) {
        console.error(e);
        toast.error("Failed to update branding");
        throw e;
      } finally {
        setSavingBranding(false);
      }
    },
    [tenant.id, updateSettings, handleSettingsChange]
  );

  const handleRefreshBilling = React.useCallback(async () => {
    if (!onRefreshBillingSnapshot) {
      toast.info("Billing refresh handler is not connected yet");
      return;
    }
    try {
      setRefreshingBilling(true);
      const next = await onRefreshBillingSnapshot(tenant.id);
      if (typeof next !== "undefined") setLocalBillingSnapshot(next ?? null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh billing snapshot");
    } finally {
      setRefreshingBilling(false);
    }
  }, [tenant.id, onRefreshBillingSnapshot]);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <h1 className="text-xl font-semibold">{tenant.name}</h1>
              <TenantStatusBadge status={tenant.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-mono text-xs">{tenant.id}</span>
              <span>
                Slug: <span className="font-mono text-xs">{tenant.slug}</span>
              </span>
            </div>
          </div>

          {/* optional actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onTabChange("settings")}>
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={() => onTabChange("members")}>
              Members
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => onTabChange(v as TenantDetailsTab)}>
        <TabsList className="mb-4 flex w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="rbac">RBAC</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Timezone</CardTitle>
              </CardHeader>
              <CardContent>{tenant.timezone || "—"}</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Locale</CardTitle>
              </CardHeader>
              <CardContent>{tenant.locale || "—"}</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Currency</CardTitle>
              </CardHeader>
              <CardContent>{tenant.currency || "—"}</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Plan</CardTitle>
              </CardHeader>
              <CardContent>{tenant.planKey ?? "—"}</CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tenant Summary</CardTitle>
                <CardDescription>High-level tenant information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">Created</span>
                  <span className="font-medium">{formatDate(tenant.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">Updated</span>
                  <span className="font-medium">{formatDate(tenant.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">Deleted At</span>
                  <span className="font-medium">{formatDate(tenant.deletedAt ?? null)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">Domains</span>
                  <span className="font-medium">{tenant.domains?.length ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Settings Snapshot</CardTitle>
                <CardDescription>Latest loaded tenant settings (if available)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Enforce MFA</div>
                    <div className="mt-1 font-semibold">
                      {tenant.settings?.enforceMfa ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Password Auth</div>
                    <div className="mt-1 font-semibold">
                      {tenant.settings?.allowPasswordAuth ?? true ? "Allowed" : "Disabled"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Email Verify</div>
                    <div className="mt-1 font-semibold">
                      {tenant.settings?.requireEmailVerify ?? true ? "Required" : "Optional"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
              <CardDescription>Tenant metadata JSON (read-only snapshot)</CardDescription>
            </CardHeader>
            <CardContent>
              <JsonPreview value={tenant.metadata} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains">
          <TenantDomainsManager tenant={tenant} onDomainsChange={handleDomainsChange} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <TenantSettingsManager tenant={tenant} onSettingsChange={handleSettingsChange} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TenantFeatureFlagsEditor
              value={tenant.settings?.featureFlags ?? null}
              loading={savingFlags}
              onSave={handleSaveFeatureFlags}
            />
            <TenantBrandingEditor
              value={tenant.settings?.branding ?? null}
              loading={savingBranding}
              onSave={handleSaveBranding}
            />
          </div>
        </TabsContent>

        <TabsContent value="members">
          <TenantMembersTable tenantId={tenant.id} />
        </TabsContent>

        <TabsContent value="rbac">
          <TenantRolesPermissionsPanel tenantId={tenant.id} />
        </TabsContent>

        <TabsContent value="audit">
          <TenantAuditTimeline
            events={auditEvents}
            title="Audit Timeline"
            description="Recent tenant changes, administrative actions, and configuration updates."
          />
        </TabsContent>

        <TabsContent value="billing">
          <TenantBillingSnapshotCard
            snapshot={localBillingSnapshot}
            loading={Boolean(billingLoading || refreshingBilling)}
            onRefresh={onRefreshBillingSnapshot ? handleRefreshBilling : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}