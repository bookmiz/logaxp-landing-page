"use client";

import * as React from "react";
import { Building2, Shield } from "lucide-react";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { TenantRolesPermissionsPanel } from "@/logaxp/components/site-admin/tenants/advanced/TenantRolesPermissionsPanel";

export default function TenantPortalRbacPage() {
  // ✅ pick fields individually (stable snapshots; fixes getSnapshot warning)
  const tenant = useAuthStore((s) => s.tenant);
  const membership = useAuthStore((s) => s.membership);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const requiresTenantSelection = useAuthStore((s) => s.requiresTenantSelection);

  if (!isHydrated) {
    return (
      <div className="p-6">
        <Card>
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
          description="Please select a tenant first before managing roles and permissions."
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
    <div className="space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles & Permissions
          </CardTitle>
          <CardDescription>
            Manage RBAC roles, permissions catalog, and member role assignments for{" "}
            <strong>{tenant.name ?? tenant.id}</strong>.
          </CardDescription>
        </CardHeader>
      </Card>

      <TenantRolesPermissionsPanel tenantId={tenant.id} />
    </div>
  );
}