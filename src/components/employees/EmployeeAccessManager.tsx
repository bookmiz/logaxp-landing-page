"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  RefreshCcw,
  Send,
  ShieldCheck,
  ShieldOff,
  RotateCcw,
  Ban,
  Copy,
  Clock3,
  UserCheck,
  BriefcaseBusiness,
  Building2,
  Eye,
} from "lucide-react";

import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
import { useEmployeeInvitations } from "@/logaxp/hooks/useEmployeeInvitations";
import { useHasPermission } from "@/logaxp/hooks/useHasPermission";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { TableSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { toast } from "@/logaxp/components/ui/toast";
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

import { EmployeeAccessStatusBadge } from "@/logaxp/components/employees/EmployeeAccessStatusBadge";

import type {
  EmployeeAssignment,
  EmployeeDetail,
  EmployeeAccessStatus,
} from "@/logaxp/lib/employee-management/employee-management.types";
import type {
  EmployeeInvitation,
  InviteEmployeeAccessDto,
  ResendEmployeeInvitationDto,
  RevokeEmployeeInvitationDto,
  DisableEmployeeAccessDto,
  EnableEmployeeAccessDto,
} from "@/logaxp/lib/employee-management/employee-invitation.types";
import type { ApiResponse } from "@/logaxp/lib/employee-management/employee-management.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function unwrapApi<T>(res: ApiResponse<T> | T): T {
  if (
    res &&
    typeof res === "object" &&
    "data" in (res as Record<string, unknown>) &&
    "statusCode" in (res as Record<string, unknown>)
  ) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

function safeDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString();
}

function safeIso(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}

function humanize(v?: string | null) {
  if (!v) return "—";
  return String(v).replaceAll("_", " ");
}

function fullName(emp?: EmployeeDetail | null) {
  if (!emp) return "—";
  return `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—";
}

function getPrimaryAssignment(emp?: EmployeeDetail | null): EmployeeAssignment | null {
  if (!emp?.assignments?.length) return null;
  return emp.assignments.find((a) => a.isPrimary) ?? emp.assignments[0] ?? null;
}

function getPrimaryAssignmentLabel(a?: EmployeeAssignment | null) {
  if (!a) return "—";
  const parts = [
    a.orgUnit?.name || null,
    a.position?.title || null,
    a.location?.name || null,
    a.costCenter?.name || null,
  ].filter(Boolean);
  return parts.length ? parts.join(" • ") : "—";
}

function parseRoleKeys(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    )
  );
}

function roleKeysToText(roleKeys?: string[] | null) {
  return Array.isArray(roleKeys) ? roleKeys.join(", ") : "";
}

function isExpired(inv?: EmployeeInvitation | null) {
  if (!inv?.expiresAt) return false;
  const t = new Date(inv.expiresAt).getTime();
  return !Number.isNaN(t) && t < Date.now();
}

function deriveAccessStatus(employee?: EmployeeDetail | null): EmployeeAccessStatus {
  const explicit = employee?.accessStatus;
  if (explicit) return explicit;
  if (employee?.userId) return "ACTIVE";
  return "NONE";
}

type ComposerMode = "invite" | "resend" | "enable-invite";

export function EmployeeAccessManager({ employeeId }: { employeeId: string }) {
  const router = useRouter();

  const { employees } = useEmployeeManagement();
  const {
    inviteEmployeeAccess,
    listEmployeeInvitations,
    resendEmployeeInvitation,
    revokeEmployeeInvitation,
    disableEmployeeAccess,
    enableEmployeeAccess,
  } = useEmployeeInvitations();

  const canRead = useHasPermission("employee.read" as never);
  const canWrite = useHasPermission("employee.write" as never);

  const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null);
  const [invitations, setInvitations] = React.useState<EmployeeInvitation[]>([]);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  const [lastAcceptUrl, setLastAcceptUrl] = React.useState<string>("");

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [resendOpen, setResendOpen] = React.useState(false);
  const [disableOpen, setDisableOpen] = React.useState(false);
  const [enableOpen, setEnableOpen] = React.useState(false);
  const [revokeOpen, setRevokeOpen] = React.useState(false);

  const [selectedInvitation, setSelectedInvitation] = React.useState<EmployeeInvitation | null>(null);

  const accessStatus = deriveAccessStatus(employee);
  const latestInvitation = invitations[0] ?? null;
  const primaryAssignment = getPrimaryAssignment(employee);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!canRead) {
        setInitialLoading(false);
        setEmployee(null);
        setInvitations([]);
        return;
      }

      try {
        if (opts?.silent) {
          setRefreshing(true);
        } else {
          setInitialLoading(true);
        }

        const [employeeRes, invitationRes] = await Promise.all([
          employees.get(employeeId),
          listEmployeeInvitations(employeeId, { includeExpired: true }),
        ]);

        const employeeData = unwrapApi(employeeRes) as EmployeeDetail;
        const invitationData = unwrapApi(invitationRes) as { items?: EmployeeInvitation[] };

        setEmployee(employeeData ?? null);
        setInvitations(
          Array.isArray(invitationData?.items)
            ? [...invitationData.items].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
            : []
        );
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load employee access data");
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [canRead, employeeId, employees, listEmployeeInvitations]
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  const copyAcceptUrl = async () => {
    if (!lastAcceptUrl) return;
    try {
      await navigator.clipboard.writeText(lastAcceptUrl);
      toast.success("Accept link copied");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy link");
    }
  };

  const handleInvite = async (input: InviteEmployeeAccessDto) => {
    try {
      setBusy("invite");
      const res = await inviteEmployeeAccess(employeeId, input);
      const data = unwrapApi(res);
      setLastAcceptUrl(data.acceptUrl ?? "");
      toast.success(data.message || "Invitation sent");
      setInviteOpen(false);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to send invitation");
    } finally {
      setBusy(null);
    }
  };

  const handleResend = async (input: ResendEmployeeInvitationDto) => {
    if (!selectedInvitation?.id) return;

    try {
      setBusy("resend");
      const res = await resendEmployeeInvitation(selectedInvitation.id, input);
      const data = unwrapApi(res);
      setLastAcceptUrl(data.acceptUrl ?? "");
      toast.success(data.message || "Invitation resent");
      setResendOpen(false);
      setSelectedInvitation(null);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to resend invitation");
    } finally {
      setBusy(null);
    }
  };

  const handleRevoke = async (input: RevokeEmployeeInvitationDto) => {
    if (!selectedInvitation?.id) return;

    try {
      setBusy("revoke");
      const res = await revokeEmployeeInvitation(selectedInvitation.id, input);
      const data = unwrapApi(res);
      toast.success(data.message || "Invitation revoked");
      setRevokeOpen(false);
      setSelectedInvitation(null);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to revoke invitation");
    } finally {
      setBusy(null);
    }
  };

  const handleDisable = async (input: DisableEmployeeAccessDto) => {
    try {
      setBusy("disable");
      const res = await disableEmployeeAccess(employeeId, input);
      const data = unwrapApi(res);
      toast.success(data.message || "Employee access disabled");
      setDisableOpen(false);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to disable access");
    } finally {
      setBusy(null);
    }
  };

  const handleEnable = async (input: EnableEmployeeAccessDto) => {
    try {
      setBusy("enable");
      const res = await enableEmployeeAccess(employeeId, input);
      const data = unwrapApi(res as never) as
        | { message?: string; acceptUrl?: string }
        | { invitation?: { id: string }; acceptUrl?: string };

      if ("acceptUrl" in data && data.acceptUrl) {
        setLastAcceptUrl(data.acceptUrl);
      }

      toast.success((data as { message?: string }).message || "Employee access enabled");
      setEnableOpen(false);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to enable access");
    } finally {
      setBusy(null);
    }
  };

  if (!canRead) {
    return (
      <div className="rounded-2xl border bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
        <EmptyState
          title="No access"
          description="You do not have permission to manage employee access."
        />
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <TableSkeleton rows={4} cols={4} />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="rounded-2xl border bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
        <EmptyState
          title="Employee not found"
          description="The employee record could not be loaded."
        />
      </div>
    );
  }

  const canInvite = canWrite && (accessStatus === "NONE" || accessStatus === "INVITED");
  const canDisable = canWrite && accessStatus === "ACTIVE";
  const canEnable = canWrite && (accessStatus === "DISABLED" || accessStatus === "NONE");
  const pendingInvitation = invitations.find((x) => x.status === "PENDING") ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="h-8 px-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={() => router.push(`/portal/employees/${employeeId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to employee
          </Button>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Employee Access Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Provision, control, and audit login access for this employee.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <EmployeeAccessStatusBadge status={accessStatus} />
          <Button
            variant="outline"
            onClick={() => void load({ silent: true })}
            disabled={refreshing || Boolean(busy)}
            className="gap-2"
          >
            <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/portal/employees/${employeeId}`)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            View Employee
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
            <CardTitle className="text-base">Employee Summary</CardTitle>
            <CardDescription>
              Core employee identity and primary assignment.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <SummaryItem label="Employee" value={fullName(employee)} />
            <SummaryItem label="Employee #" value={employee.employeeNumber ?? "—"} />
            <SummaryItem label="Work Email" value={employee.workEmail ?? "—"} />
            <SummaryItem label="Personal Email" value={employee.personalEmail ?? "—"} />
            <SummaryItem label="User Linked" value={employee.userId ?? "No linked user"} />
            <SummaryItem label="Employment Type" value={humanize(employee.employmentType)} />
            <SummaryItem
              label="Primary Assignment"
              value={getPrimaryAssignmentLabel(primaryAssignment)}
              icon={<BriefcaseBusiness className="h-4 w-4" />}
            />
            <SummaryItem
              label="Org Context"
              value={primaryAssignment?.orgUnit?.name ?? primaryAssignment?.location?.name ?? "—"}
              icon={<Building2 className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
            <CardTitle className="text-base">Access Control</CardTitle>
            <CardDescription>
              Current access state, latest invitation, and primary actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Access Status
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Invite and activate access independently of the HR record.
                </div>
              </div>
              <EmployeeAccessStatusBadge status={accessStatus} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MiniStat
                label="Invited At"
                value={safeIso(employee.accessInvitedAt)}
                icon={<Mail className="h-4 w-4" />}
              />
              <MiniStat
                label="Activated At"
                value={safeIso(employee.accessActivatedAt)}
                icon={<UserCheck className="h-4 w-4" />}
              />
              <MiniStat
                label="Disabled At"
                value={safeIso(employee.accessDisabledAt)}
                icon={<ShieldOff className="h-4 w-4" />}
              />
              <MiniStat
                label="Pending Invitation"
                value={pendingInvitation ? safeDate(pendingInvitation.expiresAt) : "None"}
                icon={<Clock3 className="h-4 w-4" />}
              />
            </div>

            {lastAcceptUrl ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Latest accept link generated
                    </div>
                    <div className="mt-1 truncate text-xs text-emerald-700/80 dark:text-emerald-300/80">
                      {lastAcceptUrl}
                    </div>
                  </div>
                  <Button variant="outline" onClick={copyAcceptUrl} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {canInvite ? (
                <Button onClick={() => setInviteOpen(true)} className="gap-2">
                  <Send className="h-4 w-4" />
                  {accessStatus === "INVITED" ? "Send New Invite" : "Invite Access"}
                </Button>
              ) : null}

              {pendingInvitation && canWrite ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedInvitation(pendingInvitation);
                      setResendOpen(true);
                    }}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Resend Invite
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedInvitation(pendingInvitation);
                      setRevokeOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Ban className="h-4 w-4" />
                    Revoke Invite
                  </Button>
                </>
              ) : null}

              {canDisable ? (
                <Button variant="outline" onClick={() => setDisableOpen(true)} className="gap-2">
                  <ShieldOff className="h-4 w-4" />
                  Disable Access
                </Button>
              ) : null}

              {canEnable ? (
                <Button variant="outline" onClick={() => setEnableOpen(true)} className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Enable Access
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
          <CardTitle className="text-base">Invitation History</CardTitle>
          <CardDescription>
            Full audit of employee access invitations and their current lifecycle state.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {invitations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No invitations yet"
                description="No employee access invitation has been issued for this employee."
                action={
                  canWrite ? (
                    <Button onClick={() => setInviteOpen(true)} className="gap-2">
                      <Send className="h-4 w-4" />
                      Invite Access
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Accepted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => {
                    const pending = inv.status === "PENDING";
                    const expired = isExpired(inv);

                    return (
                      <TableRow key={inv.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <InvitationStatusBadge status={inv.status} expired={expired} />
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">{inv.email}</TableCell>
                        <TableCell>{inv.title || "—"}</TableCell>
                        <TableCell className="max-w-[260px]">
                          <div className="flex flex-wrap gap-1">
                            {(inv.roleKeys ?? []).length ? (
                              (inv.roleKeys ?? []).map((role) => (
                                <Badge key={role} variant="outline" className="rounded-full text-[10px]">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{safeIso(inv.createdAt)}</TableCell>
                        <TableCell>{safeIso(inv.expiresAt)}</TableCell>
                        <TableCell>{safeIso(inv.acceptedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {pending && canWrite ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedInvitation(inv);
                                    setResendOpen(true);
                                  }}
                                >
                                  Resend
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedInvitation(inv);
                                    setRevokeOpen(true);
                                  }}
                                >
                                  Revoke
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-500">No actions</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableWrapper>
          )}
        </CardContent>
      </Card>

      <EmployeeInvitationComposerDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        mode="invite"
        defaultEmail={employee.workEmail || employee.personalEmail || ""}
        defaultTitle={primaryAssignment?.position?.title || "Employee"}
        defaultRoleKeys={["tenant.user", "employee.self_service"]}
        busy={busy === "invite"}
        onSubmit={(input) => handleInvite(input as InviteEmployeeAccessDto)}
      />

      <EmployeeInvitationComposerDialog
        open={resendOpen}
        onOpenChange={(o) => {
          setResendOpen(o);
          if (!o) setSelectedInvitation(null);
        }}
        mode="resend"
        defaultEmail={selectedInvitation?.email || employee.workEmail || employee.personalEmail || ""}
        defaultTitle={selectedInvitation?.title || primaryAssignment?.position?.title || "Employee"}
        defaultRoleKeys={selectedInvitation?.roleKeys || ["tenant.user", "employee.self_service"]}
        busy={busy === "resend"}
        onSubmit={handleResend}
      />

      <EmployeeEnableAccessDialog
        open={enableOpen}
        onOpenChange={setEnableOpen}
        employee={employee}
        busy={busy === "enable"}
        onSubmit={handleEnable}
      />

      <EmployeeDisableAccessDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        employee={employee}
        busy={busy === "disable"}
        onSubmit={handleDisable}
      />

      <EmployeeRevokeInvitationDialog
        open={revokeOpen}
        onOpenChange={(o) => {
          setRevokeOpen(o);
          if (!o) setSelectedInvitation(null);
        }}
        invitation={selectedInvitation}
        busy={busy === "revoke"}
        onSubmit={handleRevoke}
      />
    </div>
  );
}

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

function InvitationStatusBadge({
  status,
  expired,
}: {
  status: string;
  expired?: boolean;
}) {
  const className =
    status === "ACCEPTED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
      : status === "REVOKED"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
      : expired
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
      : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";

  return (
    <Badge variant="outline" className={cn("rounded-full text-[10px]", className)}>
      {expired && status === "PENDING" ? "EXPIRED" : humanize(status)}
    </Badge>
  );
}

function EmployeeInvitationComposerDialog({
  open,
  onOpenChange,
  mode,
  defaultEmail,
  defaultTitle,
  defaultRoleKeys,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ComposerMode;
  defaultEmail: string;
  defaultTitle: string;
  defaultRoleKeys: string[];
  busy?: boolean;
  onSubmit: (input: InviteEmployeeAccessDto | ResendEmployeeInvitationDto) => Promise<void> | void;
}) {
  const [email, setEmail] = React.useState(defaultEmail);
  const [title, setTitle] = React.useState(defaultTitle);
  const [roleKeysText, setRoleKeysText] = React.useState(roleKeysToText(defaultRoleKeys));
  const [expiresInDays, setExpiresInDays] = React.useState("7");
  const [sendEmail, setSendEmail] = React.useState(true);

  React.useEffect(() => {
    if (!open) return;
    setEmail(defaultEmail);
    setTitle(defaultTitle);
    setRoleKeysText(roleKeysToText(defaultRoleKeys));
    setExpiresInDays("7");
    setSendEmail(true);
  }, [open, defaultEmail, defaultTitle, defaultRoleKeys]);

  const submit = () => {
    const roleKeys = parseRoleKeys(roleKeysText);
    if (!roleKeys.length) {
      toast.error("At least one role key is required");
      return;
    }

    void onSubmit({
      email: email.trim() || undefined,
      title: title.trim() || undefined,
      roleKeys,
      expiresInDays: Number(expiresInDays) || 7,
      sendEmail,
    });
  };

  const titleText =
    mode === "invite"
      ? "Invite Employee Access"
      : mode === "resend"
      ? "Resend Employee Invitation"
      : "Enable Access With Invitation";

  const description =
    mode === "invite"
      ? "Issue a new access invitation and provision role grants for this employee."
      : mode === "resend"
      ? "Generate and send a fresh invitation, replacing the previous pending invitation."
      : "Create a new invitation to enable employee access.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Invite Email">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="employee@company.com" />
            </Field>

            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Employee" />
            </Field>
          </div>

          <Field label="Role Keys (comma separated)">
            <textarea
              value={roleKeysText}
              onChange={(e) => setRoleKeysText(e.target.value)}
              placeholder="tenant.user, employee.self_service"
              className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Expires In Days">
              <Input
                type="number"
                min={1}
                max={30}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
              />
            </Field>

            <Field label="Delivery">
              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Send email immediately
              </label>
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy} className="gap-2">
            <Send className="h-4 w-4" />
            {busy ? "Processing..." : mode === "resend" ? "Resend Invitation" : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeRevokeInvitationDialog({
  open,
  onOpenChange,
  invitation,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: EmployeeInvitation | null;
  busy?: boolean;
  onSubmit: (input: RevokeEmployeeInvitationDto) => Promise<void> | void;
}) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Revoke Invitation</DialogTitle>
          <DialogDescription>
            Revoke the selected employee invitation and prevent it from being accepted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
            <div><span className="font-medium">Email:</span> {invitation?.email ?? "—"}</div>
            <div className="mt-1"><span className="font-medium">Status:</span> {humanize(invitation?.status)}</div>
          </div>

          <Field label="Reason (optional)">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Incorrect email address"
              className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void onSubmit({ reason: reason.trim() || undefined })}
            disabled={busy}
            className="gap-2"
          >
            <Ban className="h-4 w-4" />
            {busy ? "Revoking..." : "Revoke Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeDisableAccessDialog({
  open,
  onOpenChange,
  employee,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeDetail | null;
  busy?: boolean;
  onSubmit: (input: DisableEmployeeAccessDto) => Promise<void> | void;
}) {
  const [reason, setReason] = React.useState("");
  const [revokePendingInvitations, setRevokePendingInvitations] = React.useState(true);

  React.useEffect(() => {
    if (!open) return;
    setReason("");
    setRevokePendingInvitations(true);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Disable Employee Access</DialogTitle>
          <DialogDescription>
            Suspend application access for <span className="font-semibold">{fullName(employee)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/40">
            <input
              type="checkbox"
              checked={revokePendingInvitations}
              onChange={(e) => setRevokePendingInvitations(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Revoke any pending employee invitations
          </label>

          <Field label="Reason (optional)">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Employee is temporarily suspended"
              className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              void onSubmit({
                reason: reason.trim() || undefined,
                revokePendingInvitations,
              })
            }
            disabled={busy}
            className="gap-2"
          >
            <ShieldOff className="h-4 w-4" />
            {busy ? "Disabling..." : "Disable Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeEnableAccessDialog({
  open,
  onOpenChange,
  employee,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeDetail | null;
  busy?: boolean;
  onSubmit: (input: EnableEmployeeAccessDto) => Promise<void> | void;
}) {
  const hasLinkedUser = Boolean(employee?.userId);

  const [createNewInvitation, setCreateNewInvitation] = React.useState(!hasLinkedUser);
  const [email, setEmail] = React.useState(employee?.workEmail || employee?.personalEmail || "");
  const [title, setTitle] = React.useState("Employee");
  const [roleKeysText, setRoleKeysText] = React.useState("tenant.user, employee.self_service");
  const [expiresInDays, setExpiresInDays] = React.useState("7");
  const [sendEmail, setSendEmail] = React.useState(true);

  React.useEffect(() => {
    if (!open) return;
    setCreateNewInvitation(!hasLinkedUser);
    setEmail(employee?.workEmail || employee?.personalEmail || "");
    setTitle("Employee");
    setRoleKeysText("tenant.user, employee.self_service");
    setExpiresInDays("7");
    setSendEmail(true);
  }, [open, employee, hasLinkedUser]);

  const submit = () => {
    if (hasLinkedUser && !createNewInvitation) {
      void onSubmit({});
      return;
    }

    const roleKeys = parseRoleKeys(roleKeysText);
    if (!roleKeys.length) {
      toast.error("At least one role key is required");
      return;
    }

    void onSubmit({
      createNewInvitation: true,
      email: email.trim() || undefined,
      title: title.trim() || undefined,
      roleKeys,
      expiresInDays: Number(expiresInDays) || 7,
      sendEmail,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Enable Employee Access</DialogTitle>
          <DialogDescription>
            Restore access directly for linked users, or generate a new invitation for employees without a user account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasLinkedUser ? (
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/40">
              <input
                type="checkbox"
                checked={createNewInvitation}
                onChange={(e) => setCreateNewInvitation(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Create a fresh invitation instead of direct reactivation
            </label>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
              This employee does not yet have a linked user account, so a new invitation will be created.
            </div>
          )}

          {(!hasLinkedUser || createNewInvitation) ? (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Invite Email">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Title">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>
              </div>

              <Field label="Role Keys (comma separated)">
                <textarea
                  value={roleKeysText}
                  onChange={(e) => setRoleKeysText(e.target.value)}
                  className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Expires In Days">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                  />
                </Field>

                <Field label="Delivery">
                  <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    Send email immediately
                  </label>
                </Field>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              This employee already has a linked user account. Submitting will reactivate the existing tenant access.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy} className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            {busy ? "Processing..." : "Enable Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}