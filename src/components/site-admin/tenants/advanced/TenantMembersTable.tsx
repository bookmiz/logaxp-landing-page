"use client";

import * as React from "react";
import {
  Search,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  RefreshCcw,
  UserPlus,
  Mail,
  Sparkles,
  Users,
} from "lucide-react";
import { useTenants } from "@/logaxp/hooks/useTenants";
import type { InviteMemberInput, Membership, Role } from "@/logaxp/lib/tenants/tenant.types";
import { toast } from "@/logaxp/components/ui/toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Input } from "@/logaxp/components/ui/input";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Pagination } from "@/logaxp/components/ui/pagination";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";

import { formatDateTime } from "./tenant-admin.helpers";

function statusBadgeVariant(status: Membership["status"]) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "SUSPENDED":
      return "warning" as const;
    case "REMOVED":
      return "destructive" as const;
    default:
      return "muted" as const; // INVITED / others
  }
}

function sortMemberships(rows: Membership[]) {
  return [...rows].sort((a, b) => {
    if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1;

    const aJoined = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
    const bJoined = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
    if (aJoined !== bJoined) return bJoined - aJoined;

    const aEmail = a.user?.email ?? "";
    const bEmail = b.user?.email ?? "";
    return aEmail.localeCompare(bEmail);
  });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type InviteResult = {
  invitationId: string;
  inviteToken?: string;
} | null;

export function TenantMembersTable({ tenantId }: { tenantId: string }) {
  const {
    listMemberships,
    suspendMembership,
    activateMembership,
    removeMembership,
    inviteMember,
    listRoles,
  } = useTenants();

  const [rows, setRows] = React.useState<Membership[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // Invite flow state
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviting, setInviting] = React.useState(false);
  const [rolesLoading, setRolesLoading] = React.useState(false);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteTitle, setInviteTitle] = React.useState("");
  const [inviteRoleId, setInviteRoleId] = React.useState<string>("");
  const [lastInvite, setLastInvite] = React.useState<InviteResult>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await listMemberships(tenantId);
      setRows(sortMemberships(data));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  }, [listMemberships, tenantId]);

  const loadRoles = React.useCallback(async () => {
    try {
      setRolesLoading(true);
      const data = await listRoles(tenantId);
      setRoles(data ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load tenant roles");
    } finally {
      setRolesLoading(false);
    }
  }, [listRoles, tenantId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((m) => {
      const email = m.user?.email?.toLowerCase() ?? "";
      const status = (m.status ?? "").toLowerCase();
      const title = (m.title ?? "").toLowerCase();
      const roleKeys = (m.roles ?? []).map((r) => r.role?.key?.toLowerCase() ?? "").join(" ");
      return email.includes(q) || status.includes(q) || title.includes(q) || roleKeys.includes(q);
    });
  }, [rows, search]);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const counts = React.useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "ACTIVE") acc.active += 1;
        else if (row.status === "SUSPENDED") acc.suspended += 1;
        else if (row.status === "REMOVED") acc.removed += 1;
        else acc.invited += 1;
        if (row.isOwner) acc.owners += 1;
        return acc;
      },
      { total: 0, active: 0, suspended: 0, removed: 0, invited: 0, owners: 0 }
    );
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paged = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const patchRow = (updated: Membership) => {
    setRows((prev) => sortMemberships(prev.map((r) => (r.id === updated.id ? updated : r))));
  };

  const doAction = async (row: Membership, action: "activate" | "suspend" | "remove") => {
    try {
      setBusyId(row.id);

      if (action === "activate") {
        // preserve your existing hook call order (membershipId, tenantId)
        const updated = await activateMembership(row.id, tenantId);
        patchRow(updated);
        toast.success("Membership activated");
      } else if (action === "suspend") {
        const updated = await suspendMembership(row.id, tenantId);
        patchRow(updated);
        toast.success("Membership suspended");
      } else {
        const updated = await removeMembership(row.id, tenantId);
        patchRow(updated);
        toast.success("Membership removed");
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to ${action} membership`);
    } finally {
      setBusyId(null);
    }
  };

  const openInviteDialog = async () => {
    setInviteOpen(true);
    // load roles when opening (only if not already loaded)
    if (roles.length === 0 && !rolesLoading) {
      await loadRoles();
    }
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteTitle("");
    setInviteRoleId("");
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setInviting(true);

      const payload = {
        email,
        ...(inviteTitle.trim() ? { title: inviteTitle.trim() } : {}),
        ...(inviteRoleId ? { roleIds: [inviteRoleId] } : {}),
      } as InviteMemberInput;

      const result = await inviteMember(payload, tenantId);
      setLastInvite(result ?? null);

      toast.success("Invitation sent successfully");

      // Refresh memberships so INVITED row appears immediately (if backend returns it)
      await load();

      resetInviteForm();
      setInviteOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header / controls */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tenant Members
              </CardTitle>
              <CardDescription>
                Manage memberships, invitations, roles visibility, and account status for this tenant.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => void load()} loading={loading}>
                {!loading ? <RefreshCcw className="h-4 w-4" /> : null}
                Refresh
              </Button>
              <Button onClick={() => void openInviteDialog()}>
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary chips */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
              <div className="mt-1 text-lg font-semibold">{counts.total}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Active</div>
              <div className="mt-1 text-lg font-semibold">{counts.active}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Invited</div>
              <div className="mt-1 text-lg font-semibold">{counts.invited}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Suspended</div>
              <div className="mt-1 text-lg font-semibold">{counts.suspended}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Removed</div>
              <div className="mt-1 text-lg font-semibold">{counts.removed}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Owners</div>
              <div className="mt-1 text-lg font-semibold">{counts.owners}</div>
            </div>
          </div>

          {/* Search */}
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search email, title, role, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Last invite info (useful for dev/admin visibility) */}
          {lastInvite ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <div className="min-w-0">
                  <div className="font-medium text-emerald-800 dark:text-emerald-300">
                    Last invitation sent successfully
                  </div>
                  <div className="mt-1 text-emerald-700 dark:text-emerald-400">
                    Invitation ID: <span className="font-mono text-xs">{lastInvite.invitationId}</span>
                  </div>
                  {lastInvite.inviteToken ? (
                    <div className="mt-1 text-emerald-700 dark:text-emerald-400">
                      Invite token (dev/admin visibility):{" "}
                      <span className="font-mono text-xs break-all">{lastInvite.inviteToken}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Empty state */}
      {filtered.length === 0 && !loading ? (
        <Card className="border-dashed">
          <CardContent className="p-0">
            <EmptyState
              title={rows.length === 0 ? "No members in this tenant yet" : "No matching members"}
              description={
                rows.length === 0
                  ? "Invite users to this tenant and assign an optional initial role during invite."
                  : "Try a different search term or clear the search to see all memberships."
              }
              icon={<Shield className="h-8 w-8" />}
              action={
                rows.length === 0 ? (
                  <Button onClick={() => void openInviteDialog()}>
                    <UserPlus className="h-4 w-4" />
                    Invite first member
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={`s-${i}`}>
                        <TableCell colSpan={8}>
                          <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
                        </TableCell>
                      </TableRow>
                    ))
                  : paged.map((row) => {
                      const isBusy = busyId === row.id;
                      const isOwner = !!row.isOwner;
                      const roleCount = row.roles?.length ?? 0;

                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="min-w-0 space-y-0.5">
                              <div className="truncate font-medium">
                                {row.user?.email ?? row.userId}
                              </div>
                              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {row.id}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>
                          </TableCell>

                          <TableCell>
                            {isOwner ? (
                              <Badge variant="default">Owner</Badge>
                            ) : (
                              <Badge variant="muted">No</Badge>
                            )}
                          </TableCell>

                          <TableCell>{row.title ?? "—"}</TableCell>

                          <TableCell>
                            <div className="flex max-w-[360px] flex-wrap gap-1">
                              {roleCount > 0 ? (
                                row.roles!.map((r) => (
                                  <Badge key={r.id} variant="muted" className="font-mono">
                                    {r.role?.key ?? r.roleId}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>{formatDateTime(row.invitedAt)}</TableCell>
                          <TableCell>{formatDateTime(row.joinedAt)}</TableCell>

                          <TableCell>
                            <div className="flex flex-wrap justify-end gap-2">
                              {row.status !== "ACTIVE" && row.status !== "REMOVED" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void doAction(row, "activate")}
                                  loading={isBusy}
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Activate
                                </Button>
                              ) : null}

                              {row.status === "ACTIVE" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void doAction(row, "suspend")}
                                  loading={isBusy}
                                  disabled={isOwner}
                                  title={isOwner ? "Owner membership cannot be suspended here" : undefined}
                                >
                                  <UserX className="h-4 w-4" />
                                  Suspend
                                </Button>
                              ) : null}

                              {row.status !== "REMOVED" ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => void doAction(row, "remove")}
                                  loading={isBusy}
                                  disabled={isOwner}
                                  title={isOwner ? "Owner membership cannot be removed here" : undefined}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableWrapper>

          {filtered.length > pageSize ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              disabled={loading}
            />
          ) : null}
        </>
      )}

      {/* Invite member dialog */}
      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          if (!inviting) setInviteOpen(open);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Member
            </DialogTitle>
            <DialogDescription>
              Send an invitation to join this tenant. You can optionally set a title and pre-select an initial role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
                <div className="text-slate-600 dark:text-slate-300">
                  The user will receive an invitation to join this tenant. If your backend returns a dev invite token,
                  it will appear in the members page after success.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <Input
                type="email"
                placeholder="user@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title (optional)</label>
              <Input
                placeholder="e.g. Operations Manager"
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Initial role (optional)</label>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800">
                <select
                  className="h-10 w-full rounded-xl bg-transparent px-3 text-sm outline-none"
                  value={inviteRoleId}
                  onChange={(e) => setInviteRoleId(e.target.value)}
                  disabled={rolesLoading}
                >
                  <option value="">No initial role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.key}
                      {role.name ? ` — ${role.name}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {rolesLoading ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading roles...</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!inviting) {
                  setInviteOpen(false);
                  resetInviteForm();
                }
              }}
              disabled={inviting}
            >
              Cancel
            </Button>

            <Button onClick={() => void handleInvite()} loading={inviting}>
              <UserPlus className="h-4 w-4" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}