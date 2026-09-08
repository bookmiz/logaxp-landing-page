"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { LeaveShell } from "@/logaxp/components/leave/LeaveShell";
import { LeavePendingTable } from "@/logaxp/components/leave/LeavePendingTable";
import { BulkDecideLeaveDialog } from "@/logaxp/components/leave/dialogs/BulkDecideLeaveDialog";

import { useLeavePending, useBulkDecideLeaveRequests } from "@/logaxp/hooks/leave/useLeaveRequests";
import { normalizeList, unwrapApi, type LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function PortalLeavePendingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const q = useLeavePending({ page: 1, pageSize: 50 } as any, true);
  const { items } = normalizeList<LeaveRequest>(q.data as any);

  const bulkM = useBulkDecideLeaveRequests();

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [bulkMode, setBulkMode] = React.useState<"approve" | "reject">("approve");

  const busy = q.isFetching || bulkM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["leave"] as any });
    toast({ tone: "success", title: "Refreshed" });
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) return setSelected(new Set());
    setSelected(new Set(items.map((r) => String(r.id))));
  };

  const selectedIds = Array.from(selected);

  return (
    <LeaveShell
      title="Pending approvals"
      subtitle="Review and decide leave requests — bulk actions included."
      pill="Time & Leave • Leave"
      requiredAnyPermissions={["leave.approve"]}
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setBulkMode("reject");
              setBulkOpen(true);
            }}
            disabled={busy || selectedIds.length === 0}
          >
            <XCircle className="h-4 w-4" />
            Reject selected
          </Button>

          <Button
            onClick={() => {
              setBulkMode("approve");
              setBulkOpen(true);
            }}
            disabled={busy || selectedIds.length === 0}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve selected
          </Button>
        </>
      }
    >
      {q.isLoading ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading pending…</CardContent>
        </Card>
      ) : q.isError ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load pending.</CardContent>
        </Card>
      ) : items.length ? (
        <>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Selected: <span className="font-medium">{selectedIds.length}</span>
          </div>

          <LeavePendingTable
            rows={items}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            onOpen={(r) => router.push(`/portal/leave/${r.id}`)}
          />

          <BulkDecideLeaveDialog
            open={bulkOpen}
            onOpenChange={setBulkOpen}
            mode={bulkMode}
            count={selectedIds.length}
            busy={busy}
            onDecide={async (reason) => {
              await bulkM.mutateAsync({
                ids: selectedIds,
                approved: bulkMode === "approve",
                reason: reason ?? null,
              });
              toast({
                tone: "success",
                title: bulkMode === "approve" ? "Approved selected" : "Rejected selected",
              });
              setSelected(new Set());
              await refresh();
            }}
          />
        </>
      ) : (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <EmptyState title="No pending requests" description="All caught up." />
          </CardContent>
        </Card>
      )}
    </LeaveShell>
  );
}