"use client";

// src/app/portal/leave/page.tsx
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, CalendarDays } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Badge } from "@/logaxp/components/ui/badge";

import { LeaveShell } from "@/logaxp/components/leave/LeaveShell";
import { LeaveFilters, type LeaveView } from "@/logaxp/components/leave/LeaveFilters";
import { LeaveTable } from "@/logaxp/components/leave/LeaveTable";
import { LeaveSummaryCards } from "@/logaxp/components/leave/LeaveSummaryCards";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

import {
  unwrapApi,
  normalizeLeaveList,
  type LeaveRequest,
} from "@/logaxp/lib/leave/leave.types";

import type { LeaveSummaryResult } from "@/logaxp/lib/leave/leave.types";

import {
  useLeaveRequests,
  useLeaveMe,
  useLeavePending,
  useLeaveSummary,
  useCreateLeaveRequest,
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

function numFromQs(v: string | null, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

function hasPerm(membership: any, perm: string) {
  const perms: string[] = Array.isArray(membership?.permissions) ? membership.permissions : [];
  if (perms.includes(perm)) return true;
  if (membership?.isOwner) return true;
  return false;
}

export default function PortalLeavePage() {
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const membership = useAuthStore((s) => s.membership);

  const canRead = hasPerm(membership, "leave.read");
  const canWrite = hasPerm(membership, "leave.write");
  const canApprove = hasPerm(membership, "leave.approve");
  const canAdmin = hasPerm(membership, "leave.admin");

  // URL state
  const view0 = (sp.get("view") ?? "all") as LeaveView;
  const page0 = numFromQs(sp.get("page"), 1);
  const pageSize0 = numFromQs(sp.get("pageSize"), 20);
  const status0 = sp.get("status") ?? "";
  const type0 = sp.get("type") ?? "";
  const employeeId0 = sp.get("employeeId") ?? "";
  const from0 = sp.get("from") ?? "";
  const to0 = sp.get("to") ?? "";
  const q0 = sp.get("q") ?? "";

  const [view, setView] = React.useState<LeaveView>(view0);
  const [page, setPage] = React.useState(page0);
  const [pageSize, setPageSize] = React.useState(pageSize0);
  const [status, setStatus] = React.useState(status0);
  const [type, setType] = React.useState(type0);
  const [employeeId, setEmployeeId] = React.useState(employeeId0);
  const [from, setFrom] = React.useState(from0);
  const [to, setTo] = React.useState(to0);
  const [q, setQ] = React.useState(q0);

  // keep URL in sync
  React.useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));

    next.set("view", view);
    next.set("page", String(page));
    next.set("pageSize", String(pageSize));
    setOrDel("status", status.trim());
    setOrDel("type", type.trim());
    setOrDel("employeeId", employeeId.trim());
    setOrDel("from", from.trim());
    setOrDel("to", to.trim());
    setOrDel("q", q.trim());

    const nextQs = next.toString();
    if (nextQs !== sp.toString()) router.replace(`${pathname}?${nextQs}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, page, pageSize, status, type, employeeId, from, to, q]);

  // reset page on filter changes
  React.useEffect(() => setPage(1), [view, status, type, employeeId, from, to]);

  const filter = React.useMemo(() => {
    const base: any = {
      page,
      pageSize,
      status: status || undefined,
      type: type || undefined,
      from: from || undefined,
      to: to || undefined,
    };
    if (view !== "me") base.employeeId = employeeId || undefined;
    return base;
  }, [page, pageSize, status, type, from, to, employeeId, view]);

  // Queries
  const allQ     = useLeaveRequests(filter as any, view === "all" && canRead);
  const meQ      = useLeaveMe(filter as any, view === "me" && canRead);
  const pendingQ = useLeavePending(filter as any, view === "pending" && canRead);

  const activeQ = view === "all" ? allQ : view === "me" ? meQ : pendingQ;

 const normalized = React.useMemo(() => {
  return normalizeLeaveList(activeQ.data as any);
}, [activeQ.data]);

const leaveRequests: LeaveRequest[] = normalized.items;

const meta = {
  ...normalized.meta,
  nextCursor: normalized.nextCursor,
};

  // Client-side search (q) on the safe array
  const filteredItems = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return leaveRequests;

    return leaveRequests.filter((r) => {
      const blob = [
        r.id,
        r.employeeId,
        r.employee?.firstName,
        r.employee?.lastName,
        r.employee?.employeeNumber,
        r.type,
        r.status,
        r.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [leaveRequests, q]);

  // Summary query
  const summaryQ = useLeaveSummary(
    {
      from: from || undefined,
      to: to || undefined,
      ...(view !== "me" && employeeId ? { employeeId } : {}),
    } as any,
    canRead
  );

  const summary = (unwrapApi<LeaveSummaryResult>(summaryQ.data as any) ?? null) as LeaveSummaryResult | null;

  // Mutations
  const createM = useCreateLeaveRequest();
  const updateM = useUpdateLeaveRequest();
  const cancelM = useCancelLeaveRequest();
  const decideM = useDecideLeaveRequest();
  const restoreM = useRestoreLeaveRequest();

  const busy =
    activeQ.isFetching ||
    summaryQ.isFetching ||
    createM.isPending ||
    updateM.isPending ||
    cancelM.isPending ||
    decideM.isPending ||
    restoreM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["leave"] as any });
    toast({ tone: "success", title: "Refreshed" });
  };

  // dialogs state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [restoreOpen, setRestoreOpen] = React.useState(false);

  const [activeRow, setActiveRow] = React.useState<LeaveRequest | null>(null);

  const openEdit = (r: LeaveRequest) => {
    setActiveRow(r);
    setEditOpen(true);
  };
  const openCancel = (r: LeaveRequest) => {
    setActiveRow(r);
    setCancelOpen(true);
  };
  const openApprove = (r: LeaveRequest) => {
    setActiveRow(r);
    setApproveOpen(true);
  };
  const openReject = (r: LeaveRequest) => {
    setActiveRow(r);
    setRejectOpen(true);
  };
  const openRestore = (r: LeaveRequest) => {
    setActiveRow(r);
    setRestoreOpen(true);
  };

  return (
    <LeaveShell
      title="Leave"
      subtitle="Review time-off requests, approvals, and history."
      pill="Time & Leave • Leave"
      requiredAnyPermissions={["leave.read"]}
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          <Button variant="outline" asChild>
            <Link href="/portal/leave/calendar">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Link>
          </Button>

          {canWrite ? (
            <Button onClick={() => setCreateOpen(true)} disabled={busy}>
              <Plus className="h-4 w-4" />
              New request
            </Button>
          ) : null}
        </>
      }
    >
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setView("all")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm",
            view === "all"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          )}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setView("me")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm",
            view === "me"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          )}
        >
          My requests
        </button>

        {canApprove ? (
          <button
            type="button"
            onClick={() => setView("pending")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              view === "pending"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            )}
          >
            Pending approvals
          </button>
        ) : null}

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Badge variant="muted" className="rounded-full">
            Rows: {filteredItems.length}
          </Badge>
        </div>
      </div>

      <LeaveFilters
        view={view}
        q={q}
        onQ={setQ}
        status={status}
        onStatus={setStatus}
        type={type}
        onType={setType}
        employeeId={employeeId}
        onEmployeeId={setEmployeeId}
        from={from}
        onFrom={setFrom}
        to={to}
        onTo={setTo}
        pageSize={pageSize}
        onPageSize={setPageSize}
        onReset={() => {
          setQ("");
          setStatus("");
          setType("");
          setEmployeeId("");
          setFrom("");
          setTo("");
          setPageSize(20);
          setPage(1);
        }}
        right={
          <div className="text-xs text-slate-500 dark:text-slate-400">
            View: <span className="font-medium">{view}</span> • Page{" "}
            <span className="font-medium">{meta.page}</span> /{" "}
            <span className="font-medium">{meta.totalPages}</span>
          </div>
        }
      />

      <LeaveSummaryCards summary={summary} />

      {activeQ.isLoading ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
            Loading leave requests…
          </CardContent>
        </Card>
      ) : activeQ.isError ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
            Failed to load leave requests.
          </CardContent>
        </Card>
      ) : filteredItems.length ? (
        <LeaveTable
          rows={filteredItems}
          meta={meta}
          busy={busy}
          canWrite={canWrite}
          canApprove={canApprove}
          canAdmin={canAdmin}
          onPage={setPage}
          onView={(r) => router.push(`/portal/leave/${r.id}`)}
          onEdit={openEdit}
          onCancel={openCancel}
          onApprove={openApprove}
          onReject={openReject}
          onRestore={openRestore}
        />
      ) : (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <EmptyState
              title="No leave requests"
              description="Create a leave request or adjust filters."
              action={
                canWrite ? (
                  <Button onClick={() => setCreateOpen(true)} disabled={busy}>
                    <Plus className="h-4 w-4" />
                    New request
                  </Button>
                ) : null
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <LeaveCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        row={null}
        busy={busy}
        onCreate={async (dto) => {
          await createM.mutateAsync(dto);
          toast({ tone: "success", title: "Leave request created" });
          await refresh();
        }}
        onUpdate={async () => {}}
      />

      <LeaveCreateEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        row={activeRow}
        busy={busy}
        onCreate={async () => {}}
        onUpdate={async (id, dto) => {
          await updateM.mutateAsync({ id, dto });
          toast({ tone: "success", title: "Leave request updated" });
          await refresh();
        }}
      />

      <LeaveCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        row={activeRow}
        busy={busy}
        onCancel={async (id, dto) => {
          await cancelM.mutateAsync({ id, dto });
          toast({ tone: "success", title: "Leave request canceled" });
          await refresh();
        }}
      />

      <LeaveDecideDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        mode="approve"
        row={activeRow}
        busy={busy}
        onDecide={async (id, dto) => {
          await decideM.mutateAsync({ id, dto: { approved: true, reason: dto.reason ?? null } });
          toast({ tone: "success", title: "Leave approved" });
          await refresh();
        }}
      />

      <LeaveDecideDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        mode="reject"
        row={activeRow}
        busy={busy}
        onDecide={async (id, dto) => {
          await decideM.mutateAsync({ id, dto: { approved: false, reason: dto.reason ?? null } });
          toast({ tone: "success", title: "Leave rejected" });
          await refresh();
        }}
      />

      <LeaveRestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        row={activeRow}
        busy={busy}
        onRestore={async (id, reason) => {
          await restoreM.mutateAsync({ id, reason: reason ?? null });
          toast({ tone: "success", title: "Leave restored" });
          await refresh();
        }}
      />
    </LeaveShell>
  );
}
