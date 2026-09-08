"use client";

// src/app/portal/leave/[id]/page.tsx
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCcw,
  Pencil,
  XCircle,
  CheckCircle2,
  RotateCcw,
  CalendarDays,
  User2,
  FileText,
  Clock3,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Separator } from "@/logaxp/components/ui/separator";

import { LeaveShell } from "@/logaxp/components/leave/LeaveShell";
import { LeaveStatusBadge } from "@/logaxp/components/leave/LeaveStatusBadge";
import { LeaveTypeBadge } from "@/logaxp/components/leave/LeaveTypeBadge";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

import {
  formatIsoDate,
  leaveEmployeeLabel,
  isCancelable,
  isDecidable,
  isRestorable,
  type LeaveRequest,
} from "@/logaxp/lib/leave/leave.types";

import {
  useLeaveRequest,
  useLeaveHistory,
  useUpdateLeaveRequest,
  useCancelLeaveRequest,
  useDecideLeaveRequest,
  useRestoreLeaveRequest,
} from "@/logaxp/hooks/leave/useLeaveRequests";

import { LeaveCreateEditDialog } from "@/logaxp/components/leave/dialogs/LeaveCreateEditDialog";
import { LeaveCancelDialog } from "@/logaxp/components/leave/dialogs/LeaveCancelDialog";
import { LeaveDecideDialog } from "@/logaxp/components/leave/dialogs/LeaveDecideDialog";
import { LeaveRestoreDialog } from "@/logaxp/components/leave/dialogs/LeaveRestoreDialog";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function hasPerm(membership: any, perm: string) {
  const perms: string[] = Array.isArray(membership?.permissions) ? membership.permissions : [];
  if (perms.includes(perm)) return true;
  if (membership?.isOwner) return true;
  return false;
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statCard(title: string, value: React.ReactNode, icon: React.ReactNode, tone?: "default" | "emerald" | "amber" | "blue") {
  const toneCls =
    tone === "emerald"
      ? "border-emerald-200/70 bg-emerald-50/70 dark:border-emerald-900/30 dark:bg-emerald-950/20"
      : tone === "amber"
      ? "border-amber-200/70 bg-amber-50/70 dark:border-amber-900/30 dark:bg-amber-950/20"
      : tone === "blue"
      ? "border-sky-200/70 bg-sky-50/70 dark:border-sky-900/30 dark:bg-sky-950/20"
      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950";

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", toneCls)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {title}
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">{value}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function LeaveRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const membership = useAuthStore((s) => s.membership);

  const canRead = hasPerm(membership, "leave.read");
  const canWrite = hasPerm(membership, "leave.write");
  const canApprove = hasPerm(membership, "leave.approve");
  const canAdmin = hasPerm(membership, "leave.admin");

  const rowQ = useLeaveRequest(id, canRead);
  const histQ = useLeaveHistory(id, canRead);

  const row = React.useMemo(() => {
    const raw = rowQ.data as any;
    if (!raw) return null;
    if (typeof raw === "object" && "data" in raw) return raw.data as LeaveRequest;
    return raw as LeaveRequest;
  }, [rowQ.data]);

  const historyRows = React.useMemo(() => {
    const raw = histQ.data as any;
    if (!raw) return [];
    if (typeof raw === "object" && "data" in raw) {
      return Array.isArray(raw.data) ? raw.data : [];
    }
    return Array.isArray(raw) ? raw : [];
  }, [histQ.data]);

  const updateM = useUpdateLeaveRequest();
  const cancelM = useCancelLeaveRequest();
  const decideM = useDecideLeaveRequest();
  const restoreM = useRestoreLeaveRequest();

  const busy =
    rowQ.isFetching ||
    histQ.isFetching ||
    updateM.isPending ||
    cancelM.isPending ||
    decideM.isPending ||
    restoreM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["leave"] as any });
    toast({ tone: "success", title: "Refreshed" });
  };

  const [editOpen, setEditOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [restoreOpen, setRestoreOpen] = React.useState(false);

  const cancelOk = canWrite && isCancelable(row?.status);
  const decideOk = canApprove && isDecidable(row?.status);
  const restoreOk = canAdmin && isRestorable(row?.status);

  return (
    <LeaveShell
      title="Leave request"
      subtitle={row ? `${leaveEmployeeLabel(row.employee)} • ${String(row.type ?? "Leave")}` : "Loading…"}
      pill="Time & Leave • Leave"
      requiredAnyPermissions={["leave.read"]}
      actions={
        <>
          <Button variant="outline" onClick={() => router.push("/portal/leave")} disabled={busy}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>
        </>
      }
    >
      {rowQ.isLoading ? (
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-8 text-sm text-slate-600 dark:text-slate-300">
            Loading request…
          </CardContent>
        </Card>
      ) : rowQ.isError || !row ? (
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-8">
            <EmptyState title="Not found" description="Leave request could not be loaded." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCard(
              "Employee",
              leaveEmployeeLabel(row.employee),
              <User2 className="h-4 w-4" />,
              "blue"
            )}
            {statCard(
              "Leave type",
              <LeaveTypeBadge type={row.type as any} />,
              <FileText className="h-4 w-4" />,
              "amber"
            )}
            {statCard(
              "Status",
              <LeaveStatusBadge status={row.status as any} />,
              <ShieldCheck className="h-4 w-4" />,
              "emerald"
            )}
            {statCard(
              "Requested at",
              formatDateTime(row.requestedAt ? String(row.requestedAt) : row.createdAt ? String(row.createdAt) : null),
              <Clock3 className="h-4 w-4" />
            )}
          </div>

          <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-6 py-5 dark:border-slate-800 dark:from-emerald-950/20 dark:via-slate-950 dark:to-sky-950/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {leaveEmployeeLabel(row.employee)}
                    </div>
                    <LeaveTypeBadge type={row.type as any} />
                    <LeaveStatusBadge status={row.status as any} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Badge variant="muted" className="rounded-full px-3 py-1">
                      Request ID: {String(row.id)}
                    </Badge>
                    <Badge variant="muted" className="rounded-full px-3 py-1">
                      Employee ID: {String(row.employeeId)}
                    </Badge>
                    <Badge variant="muted" className="rounded-full px-3 py-1">
                      Tenant ID: {String(row.tenantId)}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canWrite && isDecidable(row.status) ? (
                    <Button variant="outline" onClick={() => setEditOpen(true)} disabled={busy} className="rounded-xl">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : null}

                  {cancelOk ? (
                    <Button variant="outline" onClick={() => setCancelOpen(true)} disabled={busy} className="rounded-xl">
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  ) : null}

                  {decideOk ? (
                    <>
                      <Button onClick={() => setApproveOpen(true)} disabled={busy} className="rounded-xl">
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="outline" onClick={() => setRejectOpen(true)} disabled={busy} className="rounded-xl">
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  ) : null}

                  {restoreOk ? (
                    <Button variant="outline" onClick={() => setRestoreOpen(true)} disabled={busy} className="rounded-xl">
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-500" />
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Leave period
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Start date
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {formatIsoDate(row.startDate)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          End date
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {formatIsoDate(row.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Request reason
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="min-h-[110px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-200">
                      {row.reason ? String(row.reason) : "No reason provided."}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-slate-500" />
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Request metadata
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Requested at</div>
                        <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                          {formatDateTime(row.requestedAt ? String(row.requestedAt) : row.createdAt ? String(row.createdAt) : null)}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Decided at</div>
                        <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                          {formatDateTime(row.decidedAt ?? null)}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Decided by user ID</div>
                        <div className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-slate-50">
                          {row.decidedByUserId ?? "—"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Canceled at</div>
                        <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                          {formatDateTime(row.canceledAt ?? null)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-950">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      Employee snapshot
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Name:</span>{" "}
                        {leaveEmployeeLabel(row.employee)}
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Status:</span>{" "}
                        {row.employee?.status ? String(row.employee.status) : "—"}
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Employee number:</span>{" "}
                        {row.employee?.employeeNumber ?? "—"}
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Work email:</span>{" "}
                        {(row.employee as any)?.workEmail ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900 dark:text-slate-50">Audit trail</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    All workflow actions and changes recorded for traceability.
                  </div>
                </div>

                <Badge variant="muted" className="rounded-full px-3 py-1">
                  {historyRows.length} events
                </Badge>
              </div>

              <div className="mt-5 space-y-3">
                {histQ.isLoading ? (
                  <div className="text-sm text-slate-600 dark:text-slate-300">Loading history…</div>
                ) : histQ.isError ? (
                  <div className="text-sm text-red-600 dark:text-red-300">Failed to load history.</div>
                ) : historyRows.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    No audit entries yet.
                  </div>
                ) : (
                  historyRows.map((h: any, index: number) => (
                    <div
                      key={String(h.id ?? index)}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/20"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {String(h.action ?? "UPDATE")}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {formatDateTime(h.createdAt ? String(h.createdAt) : null)}
                          </div>
                        </div>

                        <Badge variant="muted" className="rounded-full">
                          Event
                        </Badge>
                      </div>

                      {h.metadata ? (
                        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 text-[11px] leading-5 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                          <pre className="whitespace-pre-wrap break-words">
                            {typeof h.metadata === "string" ? h.metadata : JSON.stringify(h.metadata, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <LeaveCreateEditDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            mode="edit"
            row={row}
            busy={busy}
            onCreate={async () => {}}
            onUpdate={async (rid, dto) => {
              await updateM.mutateAsync({ id: rid, dto });
              toast({ tone: "success", title: "Leave updated" });
              await refresh();
            }}
          />

          <LeaveCancelDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            row={row}
            busy={busy}
            onCancel={async (rid, dto) => {
              await cancelM.mutateAsync({ id: rid, dto });
              toast({ tone: "success", title: "Leave canceled" });
              await refresh();
            }}
          />

          <LeaveDecideDialog
            open={approveOpen}
            onOpenChange={setApproveOpen}
            mode="approve"
            row={row}
            busy={busy}
            onDecide={async (rid, dto) => {
              await decideM.mutateAsync({
                id: rid,
                dto: { approved: true, reason: dto.reason ?? null },
              });
              toast({ tone: "success", title: "Leave approved" });
              await refresh();
            }}
          />

          <LeaveDecideDialog
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            mode="reject"
            row={row}
            busy={busy}
            onDecide={async (rid, dto) => {
              await decideM.mutateAsync({
                id: rid,
                dto: { approved: false, reason: dto.reason ?? null },
              });
              toast({ tone: "success", title: "Leave rejected" });
              await refresh();
            }}
          />

          <LeaveRestoreDialog
            open={restoreOpen}
            onOpenChange={setRestoreOpen}
            row={row}
            busy={busy}
            onRestore={async (rid, reason) => {
              await restoreM.mutateAsync({ id: rid, reason: reason ?? null });
              toast({ tone: "success", title: "Leave restored" });
              await refresh();
            }}
          />
        </div>
      )}
    </LeaveShell>
  );
}
