"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { LeaveShell } from "@/logaxp/components/leave/LeaveShell";
import { LeaveRequestsTable } from "@/logaxp/components/leave/LeaveRequestsTable";

import { useLeaveMe } from "@/logaxp/hooks/leave/useLeaveRequests";
import { normalizeList, type LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function PortalLeaveMePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const q = useLeaveMe({ page: 1, pageSize: 50 } as any, true);
  const { items } = normalizeList<LeaveRequest>(q.data as any);

  const busy = q.isFetching;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["leave"] as any });
    toast({ tone: "success", title: "Refreshed" });
  };

  return (
    <LeaveShell
      title="My leave requests"
      subtitle="All requests created under your employee profile."
      pill="Time & Leave • Leave"
      requiredAnyPermissions={["leave.read"]}
      actions={
        <Button variant="outline" onClick={refresh} disabled={busy}>
          <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
          Refresh
        </Button>
      }
    >
      {q.isLoading ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading…</CardContent>
        </Card>
      ) : q.isError ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load.</CardContent>
        </Card>
      ) : items.length ? (
        <LeaveRequestsTable rows={items} onOpen={(r) => router.push(`/portal/leave/${r.id}`)} />
      ) : (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <EmptyState title="No requests yet" description="Create a leave request from the Leave page." />
          </CardContent>
        </Card>
      )}
    </LeaveShell>
  );
}