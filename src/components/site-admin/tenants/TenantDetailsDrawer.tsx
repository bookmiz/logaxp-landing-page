"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import type { Tenant, TenantDomain, TenantSettings } from "@/logaxp/lib/tenants/tenant.types";
import type { TenantDetailsTab } from "./tenant-details.types";
import type { TenantAuditEvent, TenantBillingSnapshot } from "./advanced/tenant-admin.types";

import { useTenants } from "@/logaxp/hooks/useTenants";
import { toast } from "@/logaxp/components/ui/toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/logaxp/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/logaxp/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  initialTab?: TenantDetailsTab;
  onTenantChange?: (tenant: Tenant) => void;

  // Optional real data hooks/props for advanced tabs
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

export function TenantDetailsDrawer({
  open,
  onOpenChange,
  tenant,
  initialTab = "overview",
  onTenantChange,
  auditEvents = [],
  billingSnapshot,
  billingLoading,
  onRefreshBillingSnapshot,
}: Props) {
  const { updateSettings } = useTenants();

  const [activeTab, setActiveTab] = React.useState<TenantDetailsTab>(initialTab);

  // save/loading states for editors
  const [savingFlags, setSavingFlags] = React.useState(false);
  const [savingBranding, setSavingBranding] = React.useState(false);

  // billing local state so drawer can refresh itself and also accept parent updates
  const [localBillingSnapshot, setLocalBillingSnapshot] = React.useState<TenantBillingSnapshot | null>(
    billingSnapshot ?? null
  );
  const [refreshingBilling, setRefreshingBilling] = React.useState(false);

  React.useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  React.useEffect(() => {
    setLocalBillingSnapshot(billingSnapshot ?? null);
  }, [tenant?.id, billingSnapshot]);

  const patchTenant = React.useCallback(
    (patch: Partial<Tenant>) => {
      if (!tenant) return;
      onTenantChange?.({ ...tenant, ...patch });
    },
    [tenant, onTenantChange]
  );

  const handleDomainsChange = React.useCallback(
    (domains: TenantDomain[]) => {
      patchTenant({ domains });
    },
    [patchTenant]
  );

  const handleSettingsChange = React.useCallback(
    (settings: TenantSettings | null) => {
      patchTenant({ settings });
    },
    [patchTenant]
  );

  const handleSaveFeatureFlags = React.useCallback(
    async (next: Record<string, unknown>) => {
      if (!tenant) throw new Error("Tenant is not available");

      try {
        setSavingFlags(true);
        const updated = await updateSettings({ featureFlags: next }, tenant.id);

        // Keep tenant.settings in sync locally
        handleSettingsChange(updated);

        // Avoid success toast here if your editor already shows one.
        // toast.success("Feature flags updated");
      } catch (e) {
        console.error(e);
        toast.error("Failed to update feature flags");
        throw e;
      } finally {
        setSavingFlags(false);
      }
    },
    [tenant, updateSettings, handleSettingsChange]
  );

  const handleSaveBranding = React.useCallback(
    async (next: Record<string, unknown>) => {
      if (!tenant) throw new Error("Tenant is not available");

      try {
        setSavingBranding(true);
        const updated = await updateSettings({ branding: next }, tenant.id);

        // Keep tenant.settings in sync locally
        handleSettingsChange(updated);

        // Avoid success toast here if your editor already shows one.
        // toast.success("Branding updated");
      } catch (e) {
        console.error(e);
        toast.error("Failed to update branding");
        throw e;
      } finally {
        setSavingBranding(false);
      }
    },
    [tenant, updateSettings, handleSettingsChange]
  );

  const handleRefreshBilling = React.useCallback(async () => {
    if (!tenant) return;

    if (!onRefreshBillingSnapshot) {
      toast.info("Billing refresh handler is not connected yet");
      return;
    }

    try {
      setRefreshingBilling(true);

      const next = await onRefreshBillingSnapshot(tenant.id);

      // If parent callback returns a snapshot, update local immediately.
      // If parent manages state and returns void, the prop sync effect above will handle it.
      if (typeof next !== "undefined") {
        setLocalBillingSnapshot(next ?? null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh billing snapshot");
    } finally {
      setRefreshingBilling(false);
    }
  }, [tenant, onRefreshBillingSnapshot]);

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] p-0">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="border-b border-slate-200 p-5 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {tenant.name}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-xs">{tenant.id}</span>
              <span>
                Slug: <span className="font-mono text-xs">{tenant.slug}</span>
              </span>
              <TenantStatusBadge status={tenant.status} />
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-5">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TenantDetailsTab)}>
              <TabsList className="mb-4 flex w-full flex-wrap justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="domains">Domains</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="rbac">RBAC</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>

              {/* ----------------------------- */}
              {/* OVERVIEW */}
              {/* ----------------------------- */}
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

              {/* ----------------------------- */}
              {/* DOMAINS */}
              {/* ----------------------------- */}
              <TabsContent value="domains">
                <TenantDomainsManager tenant={tenant} onDomainsChange={handleDomainsChange} />
              </TabsContent>

              {/* ----------------------------- */}
              {/* SETTINGS (now includes flags + branding editors) */}
              {/* ----------------------------- */}
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

              {/* ----------------------------- */}
              {/* MEMBERS */}
              {/* ----------------------------- */}
              <TabsContent value="members">
                <TenantMembersTable tenantId={tenant.id} />
              </TabsContent>

              {/* ----------------------------- */}
              {/* RBAC */}
              {/* ----------------------------- */}
              <TabsContent value="rbac">
                <TenantRolesPermissionsPanel tenantId={tenant.id} />
              </TabsContent>

              {/* ----------------------------- */}
              {/* AUDIT */}
              {/* ----------------------------- */}
              <TabsContent value="audit">
                <TenantAuditTimeline
                  events={auditEvents}
                  title="Audit Timeline"
                  description="Recent tenant changes, administrative actions, and configuration updates."
                />
              </TabsContent>

              {/* ----------------------------- */}
              {/* BILLING (wired) */}
              {/* ----------------------------- */}
              <TabsContent value="billing">
                <TenantBillingSnapshotCard
                  snapshot={localBillingSnapshot}
                  loading={Boolean(billingLoading || refreshingBilling)}
                  onRefresh={onRefreshBillingSnapshot ? handleRefreshBilling : undefined}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}