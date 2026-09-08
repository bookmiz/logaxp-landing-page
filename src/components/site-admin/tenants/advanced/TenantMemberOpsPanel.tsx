"use client";

import * as React from "react";
import {
  Mail,
  UserPlus,
  Upload,
  RefreshCcw,
  Search,
  Shield,
  RotateCcw,
  Ban,
  CheckCircle2,
  Clock3,
  XCircle,
  FileSpreadsheet,
  Sparkles,
  Users,
} from "lucide-react";

import { useTenants } from "@/logaxp/hooks/useTenants";
import type {
  CreateTenantMemberInput,
  InviteMemberInput,
  Role,
} from "@/logaxp/lib/tenants/tenant.types";
import { toast } from "@/logaxp/components/ui/toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Badge } from "@/logaxp/components/ui/badge";
import { Pagination } from "@/logaxp/components/ui/pagination";
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

type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED" | string;

type InvitationRow = {
  id: string;
  tenantId?: string;
  email?: string;
  emailNormalized?: string;
  status: InvitationStatus;
  createdAt?: string;
  expiresAt?: string;
  acceptedAt?: string | null;
  invitedByUserId?: string | null;
  acceptedByUserId?: string | null;
  payload?: unknown;
};

type InviteResult = {
  invitationId: string;
  inviteToken?: string;
} | null;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString();
}

function invitationStatusBadgeVariant(status: InvitationStatus) {
  switch (status) {
    case "PENDING":
      return "warning" as const;
    case "ACCEPTED":
      return "success" as const;
    case "EXPIRED":
      return "muted" as const;
    case "REVOKED":
      return "destructive" as const;
    default:
      return "muted" as const;
  }
}

function getStatusIcon(status: InvitationStatus) {
  switch (status) {
    case "PENDING":
      return <Clock3 className="h-3.5 w-3.5" />;
    case "ACCEPTED":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "EXPIRED":
      return <XCircle className="h-3.5 w-3.5" />;
    case "REVOKED":
      return <Ban className="h-3.5 w-3.5" />;
    default:
      return <Shield className="h-3.5 w-3.5" />;
  }
}

// Supports multiple possible API response shapes for listInvitations
function normalizeInvitationsResponse(input: unknown): InvitationRow[] {
  if (Array.isArray(input)) return input as InvitationRow[];

  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;

    if (Array.isArray(obj.items)) return obj.items as InvitationRow[];
    if (Array.isArray(obj.data)) return obj.data as InvitationRow[];

    if (obj.data && typeof obj.data === "object") {
      const data = obj.data as Record<string, unknown>;
      if (Array.isArray(data.items)) return data.items as InvitationRow[];
      if (Array.isArray(data.rows)) return data.rows as InvitationRow[];
      if (Array.isArray(data.invitations)) return data.invitations as InvitationRow[];
    }

    if (Array.isArray(obj.rows)) return obj.rows as InvitationRow[];
    if (Array.isArray(obj.invitations)) return obj.invitations as InvitationRow[];
  }

  return [];
}

function sortInvitations(rows: InvitationRow[]) {
  return [...rows].sort((a, b) => {
    // PENDING first
    const statusRank = (s: InvitationStatus) => {
      if (s === "PENDING") return 0;
      if (s === "ACCEPTED") return 1;
      if (s === "EXPIRED") return 2;
      if (s === "REVOKED") return 3;
      return 4;
    };

    const s = statusRank(a.status) - statusRank(b.status);
    if (s !== 0) return s;

    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aCreated !== bCreated) return bCreated - aCreated;

    const aEmail = (a.email ?? a.emailNormalized ?? "").toLowerCase();
    const bEmail = (b.email ?? b.emailNormalized ?? "").toLowerCase();
    return aEmail.localeCompare(bEmail);
  });
}

export function TenantMemberOpsPanel({
  tenantId,
  onMembershipChanged,
}: {
  tenantId: string;
  onMembershipChanged?: () => void | Promise<void>;
}) {
  const {
    // invitations
    listInvitations,
    inviteMember,
    revokeInvitation,
    resendInvitation,

    // members
    createMember,
    uploadMembers,

    // roles
    listRoles,
  } = useTenants();

  // -----------------------------
  // Shared state
  // -----------------------------
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(false);

  const [lastInvite, setLastInvite] = React.useState<InviteResult>(null);
  const [lastUploadResult, setLastUploadResult] = React.useState<Record<string, unknown> | null>(null);
  const [lastCreateResult, setLastCreateResult] = React.useState<Record<string, unknown> | null>(null);

  const loadRoles = React.useCallback(async () => {
    try {
      setRolesLoading(true);
      const data = await listRoles(tenantId);
      const sorted = [...(data ?? [])].sort((a, b) => a.key.localeCompare(b.key));
      setRoles(sorted);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load roles");
    } finally {
      setRolesLoading(false);
    }
  }, [listRoles, tenantId]);

  // -----------------------------
  // Invitation list state
  // -----------------------------
  const [inviteRows, setInviteRows] = React.useState<InvitationRow[]>([]);
  const [inviteRowsLoading, setInviteRowsLoading] = React.useState(true);
  const [inviteSearch, setInviteSearch] = React.useState("");
  const [inviteStatusFilter, setInviteStatusFilter] = React.useState<"ALL" | InvitationStatus>("ALL");
  const [invitePage, setInvitePage] = React.useState(1);
  const invitePageSize = 10;
  const [rowBusyMap, setRowBusyMap] = React.useState<Record<string, "revoke" | "resend" | null>>({});

  const loadInvitations = React.useCallback(async () => {
    try {
      setInviteRowsLoading(true);

      // Keep API call compatible (no assumptions on query shape)
      const raw = await listInvitations(undefined, tenantId);
      const rows = normalizeInvitationsResponse(raw);
      setInviteRows(sortInvitations(rows));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load invitations");
    } finally {
      setInviteRowsLoading(false);
    }
  }, [listInvitations, tenantId]);

  React.useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  const filteredInvitations = React.useMemo(() => {
    const q = inviteSearch.trim().toLowerCase();

    return inviteRows.filter((row) => {
      const statusOk = inviteStatusFilter === "ALL" ? true : row.status === inviteStatusFilter;
      if (!statusOk) return false;

      if (!q) return true;

      const email = (row.email ?? row.emailNormalized ?? "").toLowerCase();
      const status = (row.status ?? "").toLowerCase();
      const id = row.id.toLowerCase();
      return email.includes(q) || status.includes(q) || id.includes(q);
    });
  }, [inviteRows, inviteSearch, inviteStatusFilter]);

  React.useEffect(() => {
    setInvitePage(1);
  }, [inviteSearch, inviteStatusFilter]);

  const inviteCounts = React.useMemo(() => {
    return inviteRows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "PENDING") acc.pending += 1;
        else if (row.status === "ACCEPTED") acc.accepted += 1;
        else if (row.status === "EXPIRED") acc.expired += 1;
        else if (row.status === "REVOKED") acc.revoked += 1;
        else acc.other += 1;
        return acc;
      },
      { total: 0, pending: 0, accepted: 0, expired: 0, revoked: 0, other: 0 }
    );
  }, [inviteRows]);

  const inviteTotalPages = Math.max(1, Math.ceil(filteredInvitations.length / invitePageSize));
  const inviteCurrentPage = Math.min(invitePage, inviteTotalPages);

  const pagedInvitations = React.useMemo(() => {
    const start = (inviteCurrentPage - 1) * invitePageSize;
    return filteredInvitations.slice(start, start + invitePageSize);
  }, [filteredInvitations, inviteCurrentPage]);

  const handleResendInvitation = async (row: InvitationRow) => {
    try {
      setRowBusyMap((prev) => ({ ...prev, [row.id]: "resend" }));
      await resendInvitation(row.id, tenantId);
      toast.success("Invitation resent");
      await loadInvitations();
    } catch (e) {
      console.error(e);
      toast.error("Failed to resend invitation");
    } finally {
      setRowBusyMap((prev) => ({ ...prev, [row.id]: null }));
    }
  };

  const handleRevokeInvitation = async (row: InvitationRow) => {
    try {
      setRowBusyMap((prev) => ({ ...prev, [row.id]: "revoke" }));
      await revokeInvitation(row.id, tenantId);
      toast.success("Invitation revoked");
      await loadInvitations();
    } catch (e) {
      console.error(e);
      toast.error("Failed to revoke invitation");
    } finally {
      setRowBusyMap((prev) => ({ ...prev, [row.id]: null }));
    }
  };

  // -----------------------------
  // Invite member dialog
  // -----------------------------
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviting, setInviting] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteTitle, setInviteTitle] = React.useState("");
  const [inviteRoleIds, setInviteRoleIds] = React.useState<string[]>([]);

  const openInviteDialog = async () => {
    setInviteOpen(true);
    if (roles.length === 0 && !rolesLoading) {
      await loadRoles();
    }
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteTitle("");
    setInviteRoleIds([]);
  };

  const toggleInviteRole = (roleId: string) => {
    setInviteRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleInviteMember = async () => {
    const email = normalizeEmail(inviteEmail);

    if (!email) {
      toast.error("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    const dto: InviteMemberInput = {
      email,
      ...(inviteTitle.trim() ? { title: inviteTitle.trim() } : {}),
      ...(inviteRoleIds.length ? { roleIds: inviteRoleIds } : {}),
    } as InviteMemberInput;

    try {
      setInviting(true);

      const result = await inviteMember(dto, tenantId);
      setLastInvite((result ?? null) as InviteResult);

      toast.success("Invitation sent");
      setInviteOpen(false);
      resetInviteForm();

      await Promise.all([
        loadInvitations(),
        Promise.resolve(onMembershipChanged?.()),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  // -----------------------------
  // Create member dialog (direct create)
  // -----------------------------
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creatingMember, setCreatingMember] = React.useState(false);
  const [createEmail, setCreateEmail] = React.useState("");
  const [createTitle, setCreateTitle] = React.useState("");
  const [createRoleIds, setCreateRoleIds] = React.useState<string[]>([]);

  const openCreateDialog = async () => {
    setCreateOpen(true);
    if (roles.length === 0 && !rolesLoading) {
      await loadRoles();
    }
  };

  const resetCreateForm = () => {
    setCreateEmail("");
    setCreateTitle("");
    setCreateRoleIds([]);
  };

  const toggleCreateRole = (roleId: string) => {
    setCreateRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleCreateMember = async () => {
    const email = normalizeEmail(createEmail);

    if (!email) {
      toast.error("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    const dto: CreateTenantMemberInput = {
      email,
      ...(createTitle.trim() ? { title: createTitle.trim() } : {}),
      ...(createRoleIds.length ? { roleIds: createRoleIds } : {}),
    } as CreateTenantMemberInput;

    try {
      setCreatingMember(true);
      const res = await createMember(dto, tenantId);
      setLastCreateResult(res);
      toast.success("Member created successfully");

      setCreateOpen(false);
      resetCreateForm();

      await Promise.all([
        Promise.resolve(onMembershipChanged?.()),
        loadInvitations(),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create member");
    } finally {
      setCreatingMember(false);
    }
  };

  // -----------------------------
  // Upload members dialog (bulk upload)
  // -----------------------------
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadReplaceRoles, setUploadReplaceRoles] = React.useState(false);
  const [uploadRoleIds, setUploadRoleIds] = React.useState<string[]>([]);

  const openUploadDialog = async () => {
    setUploadOpen(true);
    if (roles.length === 0 && !rolesLoading) {
      await loadRoles();
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setUploadReplaceRoles(false);
    setUploadRoleIds([]);
  };

  const toggleUploadRole = (roleId: string) => {
    setUploadRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleUploadMembers = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      setUploading(true);

      const form = new FormData();
      form.append("file", selectedFile);

      // Optional metadata. If your backend ignores unknown fields, these are useful.
      // If your DTO is strict, remove these fields and keep only "file".
      if (uploadRoleIds.length) form.append("roleIds", JSON.stringify(uploadRoleIds));
      form.append("replaceRoles", String(uploadReplaceRoles));

      const res = await uploadMembers(form, tenantId);
      setLastUploadResult(res);

      toast.success("Bulk upload completed");
      setUploadOpen(false);
      resetUploadForm();

      await Promise.all([
        Promise.resolve(onMembershipChanged?.()),
        loadInvitations(),
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to upload members");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action panel */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Member Onboarding Operations
              </CardTitle>
              <CardDescription>
                Create members directly, bulk upload members, and manage tenant invitations (list / send / resend / revoke).
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void loadInvitations()} loading={inviteRowsLoading}>
                {!inviteRowsLoading ? <RefreshCcw className="h-4 w-4" /> : null}
                Refresh Invitations
              </Button>

              <Button variant="outline" onClick={() => void openCreateDialog()}>
                <UserPlus className="h-4 w-4" />
                Create Member
              </Button>

              <Button variant="outline" onClick={() => void openUploadDialog()}>
                <Upload className="h-4 w-4" />
                Upload Members
              </Button>

              <Button onClick={() => void openInviteDialog()}>
                <Mail className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total invites</div>
              <div className="mt-1 text-lg font-semibold">{inviteCounts.total}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Pending</div>
              <div className="mt-1 text-lg font-semibold">{inviteCounts.pending}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Accepted</div>
              <div className="mt-1 text-lg font-semibold">{inviteCounts.accepted}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Expired</div>
              <div className="mt-1 text-lg font-semibold">{inviteCounts.expired}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Revoked</div>
              <div className="mt-1 text-lg font-semibold">{inviteCounts.revoked}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Roles loaded</div>
              <div className="mt-1 text-lg font-semibold">{roles.length}</div>
            </div>
          </div>

          {/* Search / filter */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="w-full md:max-w-md">
              <Input
                placeholder="Search invitations by email, id, status..."
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="w-full md:w-auto">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800">
                <select
                  className="h-10 w-full rounded-xl bg-transparent px-3 text-sm outline-none md:min-w-[180px]"
                  value={inviteStatusFilter}
                  onChange={(e) => setInviteStatusFilter(e.target.value as "ALL" | InvitationStatus)}
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="REVOKED">REVOKED</option>
                </select>
              </div>
            </div>
          </div>

          {/* last results */}
          {(lastInvite || lastCreateResult || lastUploadResult) && (
            <div className="space-y-2">
              {lastInvite ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div className="min-w-0">
                      <div className="font-medium text-emerald-800 dark:text-emerald-300">
                        Invitation sent
                      </div>
                      <div className="mt-1 text-emerald-700 dark:text-emerald-400">
                        Invitation ID: <span className="font-mono text-xs">{lastInvite.invitationId}</span>
                      </div>
                      {lastInvite.inviteToken ? (
                        <div className="mt-1 text-emerald-700 dark:text-emerald-400">
                          Invite token (dev/test):{" "}
                          <span className="font-mono text-xs break-all">{lastInvite.inviteToken}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {lastCreateResult ? (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs dark:border-blue-900/60 dark:bg-blue-950/20">
                  <div className="mb-1 font-medium text-blue-800 dark:text-blue-300">Last createMember response</div>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words text-blue-700 dark:text-blue-200">
                    {JSON.stringify(lastCreateResult, null, 2)}
                  </pre>
                </div>
              ) : null}

              {lastUploadResult ? (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-xs dark:border-purple-900/60 dark:bg-purple-950/20">
                  <div className="mb-1 font-medium text-purple-800 dark:text-purple-300">Last uploadMembers response</div>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words text-purple-700 dark:text-purple-200">
                    {JSON.stringify(lastUploadResult, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitations list */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Invitations</CardTitle>
          <CardDescription>
            List invitations and perform resend / revoke actions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Accepted</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {inviteRowsLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={`invite-skeleton-${i}`}>
                        <TableCell colSpan={7}>
                          <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
                        </TableCell>
                      </TableRow>
                    ))
                  : pagedInvitations.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                          <Mail className="h-8 w-8 text-slate-400" />
                          <div className="text-sm font-medium">No invitations found</div>
                          <div className="text-xs text-slate-500">
                            Try a different filter or send a new invite.
                          </div>
                          <Button size="sm" onClick={() => void openInviteDialog()}>
                            <Mail className="h-4 w-4" />
                            Invite Member
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                  : pagedInvitations.map((row) => {
                      const busyAction = rowBusyMap[row.id];
                      const isPending = row.status === "PENDING";
                      const canResend = row.status === "PENDING" || row.status === "EXPIRED";
                      const canRevoke = row.status === "PENDING";

                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {row.email ?? row.emailNormalized ?? "—"}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {row.invitedByUserId ? `Inviter: ${row.invitedByUserId}` : "—"}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant={invitationStatusBadgeVariant(row.status)} className="inline-flex items-center gap-1">
                              {getStatusIcon(row.status)}
                              {row.status}
                            </Badge>
                          </TableCell>

                          <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                          <TableCell>{formatDateTime(row.expiresAt)}</TableCell>
                          <TableCell>{formatDateTime(row.acceptedAt)}</TableCell>

                          <TableCell>
                            <span className="font-mono text-xs">{row.id}</span>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-wrap justify-end gap-2">
                              {canResend ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void handleResendInvitation(row)}
                                  loading={busyAction === "resend"}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Resend
                                </Button>
                              ) : null}

                              {canRevoke ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => void handleRevokeInvitation(row)}
                                  loading={busyAction === "revoke"}
                                  disabled={!isPending}
                                >
                                  <Ban className="h-4 w-4" />
                                  Revoke
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

          {filteredInvitations.length > invitePageSize ? (
            <Pagination
              currentPage={inviteCurrentPage}
              totalPages={inviteTotalPages}
              onPageChange={setInvitePage}
              disabled={inviteRowsLoading}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          if (!inviting) setInviteOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invite Member
            </DialogTitle>
            <DialogDescription>
              Sends a tenant invitation and optionally pre-assigns roleIds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="user@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            <Input
              label="Title (optional)"
              placeholder="e.g. Operations Manager"
              value={inviteTitle}
              onChange={(e) => setInviteTitle(e.target.value)}
            />

            <div className="space-y-2">
              <div className="text-sm font-medium">Initial Roles (optional)</div>
              {rolesLoading ? (
                <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-800">
                  Loading roles...
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700">
                  No roles available for this tenant.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {roles.map((role) => {
                    const checked = inviteRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded"
                          checked={checked}
                          onChange={() => toggleInviteRole(role.id)}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs">{role.key}</span>
                            {role.isSystem ? <Badge variant="muted">system</Badge> : null}
                          </div>
                          <div className="text-xs text-slate-500">{role.name}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-1 font-medium">InviteMemberInput preview</div>
              <pre className="overflow-x-auto">
{JSON.stringify(
  {
    email: normalizeEmail(inviteEmail || "user@company.com"),
    ...(inviteTitle.trim() ? { title: inviteTitle.trim() } : {}),
    ...(inviteRoleIds.length ? { roleIds: inviteRoleIds } : {}),
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
                if (!inviting) {
                  setInviteOpen(false);
                  resetInviteForm();
                }
              }}
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleInviteMember()} loading={inviting}>
              <Mail className="h-4 w-4" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Member Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!creatingMember) setCreateOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create Member (Direct)
            </DialogTitle>
            <DialogDescription>
              Directly creates a membership for an existing user (based on your backend createMember flow).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              label="User Email"
              type="email"
              placeholder="existing-user@company.com"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              hint="This should match an existing user account if your backend createMember requires that."
            />

            <Input
              label="Title (optional)"
              placeholder="e.g. HR Manager"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
            />

            <div className="space-y-2">
              <div className="text-sm font-medium">Assign Roles (optional)</div>
              {rolesLoading ? (
                <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-800">
                  Loading roles...
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700">
                  No roles available for this tenant.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {roles.map((role) => {
                    const checked = createRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded"
                          checked={checked}
                          onChange={() => toggleCreateRole(role.id)}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs">{role.key}</span>
                            {role.isSystem ? <Badge variant="muted">system</Badge> : null}
                          </div>
                          <div className="text-xs text-slate-500">{role.name}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-1 font-medium">CreateTenantMemberInput preview</div>
              <pre className="overflow-x-auto">
{JSON.stringify(
  {
    email: normalizeEmail(createEmail || "existing-user@company.com"),
    ...(createTitle.trim() ? { title: createTitle.trim() } : {}),
    ...(createRoleIds.length ? { roleIds: createRoleIds } : {}),
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
                if (!creatingMember) {
                  setCreateOpen(false);
                  resetCreateForm();
                }
              }}
              disabled={creatingMember}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleCreateMember()} loading={creatingMember}>
              <UserPlus className="h-4 w-4" />
              Create Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Members Dialog */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          if (!uploading) setUploadOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[820px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Members (Bulk)
            </DialogTitle>
            <DialogDescription>
              Upload a file for bulk member creation. This uses <code>uploadMembers()</code> from your hook.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-2">
                <FileSpreadsheet className="mt-0.5 h-4 w-4 text-slate-500" />
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="font-medium">Bulk upload file</div>
                  <div className="text-xs">
                    Accepts CSV/XLSX depending on your backend parser. This component sends multipart FormData with key <strong>file</strong>.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="block w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              {selectedFile ? (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Selected: <span className="font-medium">{selectedFile.name}</span> ({Math.round(selectedFile.size / 1024)} KB)
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Default Roles (optional)</div>
              {rolesLoading ? (
                <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-800">
                  Loading roles...
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700">
                  No roles available for default assignment.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {roles.map((role) => {
                    const checked = uploadRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded"
                          checked={checked}
                          onChange={() => toggleUploadRole(role.id)}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs">{role.key}</span>
                            {role.isSystem ? <Badge variant="muted">system</Badge> : null}
                          </div>
                          <div className="text-xs text-slate-500">{role.name}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={uploadReplaceRoles}
                onChange={(e) => setUploadReplaceRoles(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Replace existing role assignments during upload (if backend supports it)
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-1 font-medium">FormData preview (conceptual)</div>
              <pre className="overflow-x-auto">
{JSON.stringify(
  {
    file: selectedFile?.name ?? null,
    ...(uploadRoleIds.length ? { roleIds: uploadRoleIds } : {}),
    replaceRoles: uploadReplaceRoles,
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
                if (!uploading) {
                  setUploadOpen(false);
                  resetUploadForm();
                }
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleUploadMembers()} loading={uploading}>
              <Upload className="h-4 w-4" />
              Upload Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}