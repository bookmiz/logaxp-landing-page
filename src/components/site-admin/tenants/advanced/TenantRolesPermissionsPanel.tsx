"use client";

import * as React from "react";
import {
  Shield,
  KeyRound,
  Users,
  Plus,
  RefreshCcw,
  Unplug,
  Hammer,
  Search,
  Sparkles,
  Info,
} from "lucide-react";
import { useTenants } from "@/logaxp/hooks/useTenants";
import type { Membership, Permission, Role } from "@/logaxp/lib/tenants/tenant.types";
import { toast } from "@/logaxp/components/ui/toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { Pagination } from "@/logaxp/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/logaxp/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

function sortRoles(rows: Role[]) {
  return [...rows].sort((a, b) => a.key.localeCompare(b.key));
}

function sortPermissions(rows: Permission[]) {
  return [...rows].sort((a, b) => {
    const ga = a.group ?? "";
    const gb = b.group ?? "";
    if (ga !== gb) return ga.localeCompare(gb);
    return a.key.localeCompare(b.key);
  });
}

function sortMemberships(rows: Membership[]) {
  return [...rows].sort((a, b) => {
    if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1;
    return (a.user?.email ?? a.userId).localeCompare(b.user?.email ?? b.userId);
  });
}

function membershipStatusBadgeVariant(status: Membership["status"]) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "SUSPENDED":
      return "warning" as const;
    case "REMOVED":
      return "destructive" as const;
    case "INVITED":
    default:
      return "muted" as const;
  }
}

type MembershipStatusFilter = "ALL" | Membership["status"];

function formatRoleCountLabel(count: number) {
  return `${count} assignment${count === 1 ? "" : "s"}`;
}

export function TenantRolesPermissionsPanel({ tenantId }: { tenantId: string }) {
  const {
    bootstrapRbac,
    listRoles,
    listPermissions,
    listMemberships,
    assignRole,
    unassignRole,
  } = useTenants();

  const [roles, setRoles] = React.useState<Role[]>([]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [memberships, setMemberships] = React.useState<Membership[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [bootstrapping, setBootstrapping] = React.useState(false);

  const [busyMembershipId, setBusyMembershipId] = React.useState<string | null>(null);
  const [selectedRoleByMembership, setSelectedRoleByMembership] = React.useState<Record<string, string>>({});

  // Search / filters
  const [assignmentSearch, setAssignmentSearch] = React.useState("");
  const [assignmentStatus, setAssignmentStatus] = React.useState<MembershipStatusFilter>("ALL");
  const [roleSearch, setRoleSearch] = React.useState("");
  const [permissionSearch, setPermissionSearch] = React.useState("");

  // Pagination for assignments
  const [assignmentsPage, setAssignmentsPage] = React.useState(1);
  const assignmentsPageSize = 8;

  const load = React.useCallback(async () => {
    try {
      setLoading(true);

      const [rolesRes, permsRes, membershipsRes] = await Promise.allSettled([
        listRoles(tenantId),
        listPermissions(tenantId),
        listMemberships(tenantId),
      ]);

      const loadErrors: string[] = [];

      if (rolesRes.status === "fulfilled") {
        setRoles(sortRoles(rolesRes.value));
      } else {
        setRoles([]);
        loadErrors.push("roles");
        console.error("Failed to load roles:", rolesRes.reason);
      }

      if (permsRes.status === "fulfilled") {
        setPermissions(sortPermissions(permsRes.value));
      } else {
        setPermissions([]);
        loadErrors.push("permissions");
        console.error("Failed to load permissions:", permsRes.reason);
      }

      if (membershipsRes.status === "fulfilled") {
        setMemberships(sortMemberships(membershipsRes.value));
      } else {
        setMemberships([]);
        loadErrors.push("memberships");
        console.error("Failed to load memberships:", membershipsRes.reason);
      }

      if (loadErrors.length > 0) {
        toast.error(`Failed to load some RBAC data (${loadErrors.join(", ")})`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load RBAC data");
    } finally {
      setLoading(false);
    }
  }, [listRoles, listPermissions, listMemberships, tenantId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleBootstrap = async () => {
    try {
      setBootstrapping(true);
      await bootstrapRbac(tenantId);
      toast.success("RBAC bootstrap complete");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to bootstrap RBAC");
    } finally {
      setBootstrapping(false);
    }
  };

  const handleAssignRole = async (membership: Membership) => {
    const roleId = selectedRoleByMembership[membership.id];

    if (!roleId) {
      toast.error("Select a role first");
      return;
    }

    if (membership.status === "REMOVED") {
      toast.error("Cannot assign role to a removed membership");
      return;
    }

    const alreadyAssigned = (membership.roles ?? []).some((x) => x.roleId === roleId);
    if (alreadyAssigned) {
      toast.info("Role already assigned");
      return;
    }

    try {
      setBusyMembershipId(membership.id);
      await assignRole(membership.id, roleId, tenantId);
      toast.success("Role assigned");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign role");
    } finally {
      setBusyMembershipId(null);
    }
  };

  const handleUnassignRole = async (membership: Membership, roleId: string) => {
    try {
      setBusyMembershipId(membership.id);
      await unassignRole(membership.id, roleId, tenantId);
      toast.success("Role unassigned");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to unassign role");
    } finally {
      setBusyMembershipId(null);
    }
  };

  const roleUsageCount = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const m of memberships) {
      for (const mr of m.roles ?? []) {
        map.set(mr.roleId, (map.get(mr.roleId) ?? 0) + 1);
      }
    }
    return map;
  }, [memberships]);

  const filteredMemberships = React.useMemo(() => {
    const q = assignmentSearch.trim().toLowerCase();

    return memberships.filter((m) => {
      if (assignmentStatus !== "ALL" && m.status !== assignmentStatus) return false;
      if (!q) return true;

      const email = (m.user?.email ?? "").toLowerCase();
      const userId = m.userId.toLowerCase();
      const memberId = m.id.toLowerCase();
      const title = (m.title ?? "").toLowerCase();
      const status = m.status.toLowerCase();
      const owner = m.isOwner ? "owner" : "member";
      const roleKeys = (m.roles ?? []).map((x) => x.role?.key ?? "").join(" ").toLowerCase();

      return (
        email.includes(q) ||
        userId.includes(q) ||
        memberId.includes(q) ||
        title.includes(q) ||
        status.includes(q) ||
        owner.includes(q) ||
        roleKeys.includes(q)
      );
    });
  }, [memberships, assignmentSearch, assignmentStatus]);

  React.useEffect(() => {
    setAssignmentsPage(1);
  }, [assignmentSearch, assignmentStatus]);

  const totalAssignmentPages = Math.max(1, Math.ceil(filteredMemberships.length / assignmentsPageSize));
  const currentAssignmentsPage = Math.min(assignmentsPage, totalAssignmentPages);

  const pagedMemberships = React.useMemo(() => {
    const start = (currentAssignmentsPage - 1) * assignmentsPageSize;
    return filteredMemberships.slice(start, start + assignmentsPageSize);
  }, [filteredMemberships, currentAssignmentsPage]);

  const filteredRoles = React.useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return roles;

    return roles.filter((r) => {
      return (
        r.key.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [roles, roleSearch]);

  const filteredPermissions = React.useMemo(() => {
    const q = permissionSearch.trim().toLowerCase();
    if (!q) return permissions;

    return permissions.filter((p) => {
      return (
        p.key.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.group ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [permissions, permissionSearch]);

  const permissionGroups = React.useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const perm of filteredPermissions) {
      const key = perm.group?.trim() || "ungrouped";
      const arr = map.get(key) ?? [];
      arr.push(perm);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPermissions]);

  const showBootstrapHint = !loading && roles.length === 0 && permissions.length === 0;

  return (
    <div className="space-y-4">
      {/* Header / Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Roles
            </CardTitle>
            <CardDescription>Available role definitions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{roles.length}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <KeyRound className="h-4 w-4" />
              Permissions
            </CardTitle>
            <CardDescription>Permission keys in catalog</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{permissions.length}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Memberships
            </CardTitle>
            <CardDescription>Tenant users/invites</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-black">{memberships.length}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">RBAC Actions</CardTitle>
            <CardDescription>Refresh data / seed defaults</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0">
            <Button variant="outline" onClick={() => void load()} loading={loading}>
              {!loading ? <RefreshCcw className="h-4 w-4" /> : null}
              Refresh
            </Button>

            <Button onClick={() => void handleBootstrap()} loading={bootstrapping}>
              <Hammer className="h-4 w-4" />
              Bootstrap RBAC
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bootstrap hint */}
      {showBootstrapHint ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border p-2">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">RBAC data looks empty for this tenant</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Run RBAC bootstrap to seed default roles and permissions before assigning roles to members.
                </p>
              </div>
            </div>

            <Button onClick={() => void handleBootstrap()} loading={bootstrapping}>
              <Hammer className="h-4 w-4" />
              Bootstrap now
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Main Tabs */}
      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="assignments">Member Role Assignments</TabsTrigger>
          <TabsTrigger value="roles">Roles Catalog</TabsTrigger>
          <TabsTrigger value="permissions">Permissions Catalog</TabsTrigger>
        </TabsList>

        {/* Assignments */}
        <TabsContent value="assignments" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Manage Member Role Assignments</CardTitle>
              <CardDescription>
                Assign and unassign roles per membership. This reflects current tenant RBAC access.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
              <Input
                value={assignmentSearch}
                onChange={(e) => setAssignmentSearch(e.target.value)}
                placeholder="Search by email, title, status, role..."
                leftIcon={<Search className="h-4 w-4" />}
              />

              <Select
                value={assignmentStatus}
                onValueChange={(v) => setAssignmentStatus(v as MembershipStatusFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="INVITED">Invited</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="REMOVED">Removed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {memberships.length === 0 && !loading ? (
            <EmptyState
              title="No memberships available"
              description="Invite or create tenant members before assigning roles."
              icon={<Users className="h-8 w-8" />}
            />
          ) : filteredMemberships.length === 0 && !loading ? (
            <EmptyState
              title="No matching memberships"
              description="Try a different search term or status filter."
              icon={<Search className="h-8 w-8" />}
            />
          ) : (
            <>
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Current Roles</TableHead>
                      <TableHead className="min-w-[220px]">Assign Role</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <TableRow key={`rbac-loading-${i}`}>
                            <TableCell colSpan={6}>
                              <div className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
                            </TableCell>
                          </TableRow>
                        ))
                      : pagedMemberships.map((m) => {
                          const isBusy = busyMembershipId === m.id;
                          const memberRoles = m.roles ?? [];
                          const selectedRoleId = selectedRoleByMembership[m.id];

                          return (
                            <TableRow key={m.id}>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <div className="font-medium">{m.user?.email ?? m.userId}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">{m.id}</div>
                                  {m.title ? (
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      Title: {m.title}
                                    </div>
                                  ) : null}
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge variant={membershipStatusBadgeVariant(m.status)}>{m.status}</Badge>
                              </TableCell>

                              <TableCell>
                                {m.isOwner ? (
                                  <Badge variant="default">Owner</Badge>
                                ) : (
                                  <Badge variant="muted">Member</Badge>
                                )}
                              </TableCell>

                              <TableCell>
                                <div className="flex max-w-[420px] flex-wrap gap-1.5">
                                  {memberRoles.length > 0 ? (
                                    memberRoles.map((mr) => (
                                      <div
                                        key={mr.id}
                                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-950"
                                      >
                                        <span className="font-mono">
                                          {mr.role?.key ?? mr.roleId}
                                        </span>
                                        <button
                                          type="button"
                                          className="text-slate-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                          onClick={() => void handleUnassignRole(m, mr.roleId)}
                                          disabled={isBusy}
                                          title="Unassign role"
                                        >
                                          <Unplug className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                      No roles assigned
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <Select
                                  value={selectedRoleId}
                                  onValueChange={(v) =>
                                    setSelectedRoleByMembership((prev) => ({ ...prev, [m.id]: v }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={roles.length ? "Select role" : "No roles available"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map((r) => (
                                      <SelectItem key={r.id} value={r.id}>
                                        {r.key}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>

                              <TableCell>
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void handleAssignRole(m)}
                                    loading={isBusy}
                                    disabled={!roles.length || !selectedRoleId || m.status === "REMOVED"}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Assign
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              </TableWrapper>

              {filteredMemberships.length > assignmentsPageSize ? (
                <Pagination
                  currentPage={currentAssignmentsPage}
                  totalPages={totalAssignmentPages}
                  onPageChange={setAssignmentsPage}
                  disabled={loading}
                />
              ) : null}
            </>
          )}
        </TabsContent>

        {/* Roles Catalog */}
        <TabsContent value="roles" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Roles Catalog</CardTitle>
              <CardDescription>
                Tenant roles available for assignment. Usage count shows how many memberships currently hold each role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search role key, name, description..."
                leftIcon={<Search className="h-4 w-4" />}
              />
            </CardContent>
          </Card>

          {!loading && roles.length === 0 ? (
            <EmptyState
              title="No roles found"
              description="Use RBAC bootstrap to seed system roles for this tenant."
              icon={<Shield className="h-8 w-8" />}
              action={
                <Button onClick={() => void handleBootstrap()} loading={bootstrapping}>
                  <Hammer className="h-4 w-4" />
                  Bootstrap RBAC
                </Button>
              }
            />
          ) : !loading && filteredRoles.length === 0 ? (
            <EmptyState
              title="No matching roles"
              description="Try a different search term."
              icon={<Search className="h-8 w-8" />}
            />
          ) : (
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={`roles-loading-${i}`}>
                          <TableCell colSpan={5}>
                            <div className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
                          </TableCell>
                        </TableRow>
                      ))
                    : filteredRoles.map((r) => {
                        const count = roleUsageCount.get(r.id) ?? 0;

                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-mono text-xs">{r.key}</TableCell>
                            <TableCell>{r.name}</TableCell>
                            <TableCell>
                              <Badge variant={r.isSystem ? "default" : "muted"}>
                                {r.isSystem ? "System" : "Custom"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="muted">{formatRoleCountLabel(count)}</Badge>
                            </TableCell>
                            <TableCell>{r.description ?? "—"}</TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TableWrapper>
          )}
        </TabsContent>

        {/* Permissions Catalog */}
        <TabsContent value="permissions" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Permissions Catalog</CardTitle>
              <CardDescription>
                Search and review permission keys grouped by category.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Search permission key, name, group..."
                leftIcon={<Search className="h-4 w-4" />}
              />
            </CardContent>
          </Card>

          {!loading && permissions.length === 0 ? (
            <EmptyState
              title="No permissions found"
              description="RBAC bootstrap usually seeds default permissions."
              icon={<KeyRound className="h-8 w-8" />}
              action={
                <Button onClick={() => void handleBootstrap()} loading={bootstrapping}>
                  <Hammer className="h-4 w-4" />
                  Bootstrap RBAC
                </Button>
              }
            />
          ) : !loading && filteredPermissions.length === 0 ? (
            <EmptyState
              title="No matching permissions"
              description="Try a different search term."
              icon={<Search className="h-8 w-8" />}
            />
          ) : (
            <div className="space-y-4">
              <Card className="rounded-2xl">
                <CardContent className="flex flex-wrap items-center gap-2 p-4 text-sm text-slate-600 dark:text-slate-300">
                  <Info className="h-4 w-4" />
                  <span>
                    Showing <strong>{filteredPermissions.length}</strong> permission
                    {filteredPermissions.length === 1 ? "" : "s"} across{" "}
                    <strong>{permissionGroups.length}</strong> group
                    {permissionGroups.length === 1 ? "" : "s"}.
                  </span>
                </CardContent>
              </Card>

              {permissionGroups.map(([group, perms]) => (
                <Card key={group} className="rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">{group}</CardTitle>
                    <CardDescription>{perms.length} permission(s)</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {perms.map((p) => (
                        <Badge key={p.id} variant="muted" className="font-mono">
                          {p.key}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {perms.map((p) => (
                        <div
                          key={`${p.id}-detail`}
                          className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs">{p.key}</span>
                            <Badge variant="muted" className="text-[10px] uppercase tracking-wide">
                              {p.group ?? "ungrouped"}
                            </Badge>
                          </div>
                          <div className="mt-1 font-medium">{p.name}</div>
                          {p.description ? (
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {p.description}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}