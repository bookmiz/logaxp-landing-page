// src/app/portal/members/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  UserPlus,
  Mail,
  Shield,
  Sparkles,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { useTenants } from "@/logaxp/hooks/useTenants";
import { toast } from "@/logaxp/components/ui/toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";
import { Badge } from "@/logaxp/components/ui/badge";

import { TenantMembersTable } from "@/logaxp/components/site-admin/tenants/advanced/TenantMembersTable";
import { TenantMemberOpsPanel } from "@/logaxp/components/site-admin/tenants/advanced/TenantMemberOpsPanel";
import type { Role, InviteMemberInput } from "@/logaxp/lib/tenants/tenant.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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
            Tenant Members
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

export default function TenantPortalMembersPage() {
  const tenant = useAuthStore((s) => s.tenant);
  const membership = useAuthStore((s) => s.membership);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const requiresTenantSelection = useAuthStore((s) => s.requiresTenantSelection);

  const { inviteMember, listRoles } = useTenants();

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [submittingInvite, setSubmittingInvite] = React.useState(false);
  const [rolesLoading, setRolesLoading] = React.useState(false);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [membersTableKey, setMembersTableKey] = React.useState(0);

  const [email, setEmail] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");
  const [selectedRoleKeys, setSelectedRoleKeys] = React.useState<string[]>([]);

  const tenantId = tenant?.id ?? null;

  const resetInviteForm = React.useCallback(() => {
    setEmail("");
    setEmployeeId("");
    setSelectedRoleKeys([]);
  }, []);

  const loadRoles = React.useCallback(async () => {
    if (!tenantId) return;
    try {
      setRolesLoading(true);
      const rows = await listRoles(tenantId);
      setRoles([...rows].sort((a, b) => a.key.localeCompare(b.key)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load roles for invite");
    } finally {
      setRolesLoading(false);
    }
  }, [tenantId, listRoles]);

  const openInviteDialog = async () => {
    setInviteOpen(true);
    if (roles.length === 0 && tenantId) await loadRoles();
  };

  const toggleRole = (roleKey: string) => {
    setSelectedRoleKeys((prev) =>
      prev.includes(roleKey) ? prev.filter((k) => k !== roleKey) : [...prev, roleKey]
    );
  };

  const handleInvite = async () => {
    if (!tenantId) return toast.error("No tenantId available");

    const safeEmail = normalizeEmail(email);
    if (!safeEmail) return toast.error("Please enter an email");
    if (!isValidEmail(safeEmail)) return toast.error("Please enter a valid email");

    const payload: Record<string, unknown> = {};
    if (selectedRoleKeys.length > 0) payload.roles = selectedRoleKeys;
    if (employeeId.trim()) payload.employeeId = employeeId.trim();

    const dto: InviteMemberInput = {
      email: safeEmail,
      ...(Object.keys(payload).length ? { payload } : {}),
    };

    try {
      setSubmittingInvite(true);
      const result = await inviteMember(dto, tenantId);

      toast.success("Invitation sent");
      if (result?.inviteToken) toast.info("Invite token returned by API (dev/test mode)");

      setInviteOpen(false);
      resetInviteForm();
      setMembersTableKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      toast.error("Failed to invite member");
    } finally {
      setSubmittingInvite(false);
    }
  };

  // ------------------------------------------------------------
  // Session guards
  // ------------------------------------------------------------
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
          description="Please select a tenant first before managing members."
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

 const roleKeys = membership?.roleKeys ?? [];

const canInvite =
  Boolean(membership?.isOwner) ||
  roleKeys.includes("tenant.owner") ||
  roleKeys.includes("tenant.admin");

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <Shell
      title="Members"
      subtitle={`Invite and manage members for ${tenant.name ?? tenant.id}.`}
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => setMembersTableKey((k) => k + 1)}
            title="Refresh members"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button onClick={() => void openInviteDialog()} disabled={!canInvite}>
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </>
      }
    >
      {/* Overview / hero card */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-900 dark:text-slate-50" />
            Members
          </CardTitle>
          <CardDescription>
            Membership session:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {tenant.name ?? tenant.id}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="rounded-full">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Active tenant session
            </Badge>

            <Badge variant="muted" className="rounded-full">
              <Shield className="mr-1 h-3.5 w-3.5" />
              RBAC enforced
            </Badge>

            <Link
              href="/portal/rbac"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Manage roles & permissions
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!canInvite ? (
            <div className="text-xs text-amber-700 dark:text-amber-300">
              You may not have permission to invite members.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Ops panel */}
      <TenantMemberOpsPanel
        tenantId={tenant.id}
        onMembershipChanged={() => setMembersTableKey((k) => k + 1)}
      />

      {/* Table */}
      <TenantMembersTable key={membersTableKey} tenantId={tenant.id} />

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </DialogTitle>
            <DialogDescription>
              Send a tenant invitation and optionally include role keys and employeeId in the invite payload.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="Invitation will be sent to this email."
              />

              <Input
                label="Employee ID (optional)"
                placeholder="EMP-001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                hint="Sent as payload.employeeId if provided."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Optional Role Assignment (payload.roles)
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadRoles()}
                  disabled={rolesLoading || !tenantId}
                  title="Reload roles"
                >
                  <RefreshCw className={cn("h-4 w-4", rolesLoading && "animate-spin")} />
                  Reload
                </Button>
              </div>

              {rolesLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                  Loading roles...
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  No roles found yet. Bootstrap RBAC first, then return here to assign roles during invite.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {roles.map((role) => {
                    const checked = selectedRoleKeys.includes(role.key);
                    return (
                      <label
                        key={role.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition",
                          checked
                            ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/40"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded"
                          checked={checked}
                          onChange={() => toggleRole(role.key)}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs">{role.key}</span>
                            {role.isSystem ? <Badge variant="muted">system</Badge> : null}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">{role.name}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <div className="mb-1 font-medium">Payload preview</div>
              <pre className="overflow-x-auto">
                {JSON.stringify(
                  {
                    ...(selectedRoleKeys.length ? { roles: selectedRoleKeys } : {}),
                    ...(employeeId.trim() ? { employeeId: employeeId.trim() } : {}),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInviteOpen(false);
                resetInviteForm();
              }}
              disabled={submittingInvite}
            >
              Cancel
            </Button>

            <Button onClick={() => void handleInvite()} loading={submittingInvite}>
              <Mail className="h-4 w-4" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}