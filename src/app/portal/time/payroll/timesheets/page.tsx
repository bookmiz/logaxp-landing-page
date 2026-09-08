"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { TimeBanner } from "@/logaxp/components/time-management/feedback/TimeBanner";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

import { PayrollNavCards } from "@/logaxp/components/time-management/payroll/PayrollNavCards";

import { TimesheetFilters, type TimesheetScope } from "@/logaxp/components/time-management/payroll/TimesheetFilters";
import { TimesheetsTable } from "@/logaxp/components/time-management/payroll/TimesheetsTable";
import { SubmitTimesheetDialog } from "@/logaxp/components/time-management/payroll/SubmitTimesheetDialog";
import { DecideTimesheetDialog } from "@/logaxp/components/time-management/payroll/DecideTimesheetDialog";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { getPermissions } from "@/logaxp/lib/auth/portalAuthz";

import {
  useTimesheets,
  useSubmitTimesheet,
  useApproveTimesheet,
  useRejectTimesheet,
} from "@/logaxp/hooks/time-management/useTimePayroll";

import type { Timesheet } from "@/logaxp/lib/time-management/timePayroll.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function TimesheetsPage() {
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const membership = useAuthStore((s) => s.membership);
  const myEmployeeId = useAuthStore((s) => s.employee?.id ?? null);

  // permissions -> role-aware actions
  const perms = React.useMemo(() => getPermissions(membership), [membership]);
  const canSubmit = perms.includes("time.write");
  const canDecide = perms.includes("time.admin") || perms.includes("time.clock.admin");

  // URL filters
  const q0 = sp.get("q") ?? "";
  const status0 = sp.get("status") ?? "";
  const employeeId0 = sp.get("employeeId") ?? "";
  const payPeriodId0 = sp.get("payPeriodId") ?? "";
  const scopeFromUrl = (sp.get("scope") as TimesheetScope | null) ?? "workspace";

  const [q, setQ] = React.useState(q0);
  const [status, setStatus] = React.useState(status0);
  const [employeeId, setEmployeeId] = React.useState(employeeId0);
  const [payPeriodId, setPayPeriodId] = React.useState(payPeriodId0);
  const [scope, setScope] = React.useState<TimesheetScope>(scopeFromUrl);

  const canUseMeScope = Boolean(myEmployeeId);

  React.useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));

    setOrDel("q", q.trim());
    setOrDel("status", status.trim());
    setOrDel("employeeId", employeeId.trim());
    setOrDel("payPeriodId", payPeriodId.trim());
    next.set("scope", scope);

    const nextQs = next.toString();
    if (nextQs !== sp.toString()) router.replace(`${pathname}?${nextQs}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, employeeId, payPeriodId, scope]);

  // enforce “me” scope
  const apiEmployeeId = scope === "me" && myEmployeeId ? myEmployeeId : (employeeId.trim() || undefined);

  const listQ = useTimesheets({
    employeeId: apiEmployeeId,
    payPeriodId: payPeriodId.trim() || undefined,
    status: (status.trim() || undefined) as any,
  });

  // safe for both array + {items} envelopes
  const data = listQ.data?.data as any;
  const items: Timesheet[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = [...items].sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
    if (!needle) return base;

    return base.filter((t) => {
      const blob = [t.id, t.employeeId, t.payPeriodId, t.status, t.decisionNote]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [items, q]);

  const submitM = useSubmitTimesheet();
  const approveM = useApproveTimesheet();
  const rejectM = useRejectTimesheet();

  const busy = listQ.isFetching || submitM.isPending || approveM.isPending || rejectM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["timesheets"] });
    await qc.invalidateQueries({ queryKey: ["pay-periods"] });
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  // dialogs
  const [submitOpen, setSubmitOpen] = React.useState(false);
  const [decideOpen, setDecideOpen] = React.useState(false);
  const [decideMode, setDecideMode] = React.useState<"approve" | "reject">("approve");
  const [active, setActive] = React.useState<Timesheet | null>(null);

  const reset = () => {
    setQ("");
    setStatus("");
    setEmployeeId("");
    setPayPeriodId("");
    setScope("workspace");
  };

  return (
    <TimeShell
      title="Timesheets"
      subtitle="Submit, review, approve, and audit payroll timesheets."
      pill="Time • Payroll • Timesheets"
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          {canSubmit ? (
            <Button
              onClick={() => {
                setActive(null);
                setSubmitOpen(true);
              }}
              disabled={busy}
            >
              <Plus className="h-4 w-4" />
              Submit
            </Button>
          ) : null}
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <PayrollNavCards />

        {scope === "me" && !myEmployeeId ? (
          <TimeBanner tone="warning" title="My timesheets unavailable">
            No employee context found in session. Switch to Workspace scope or wire employeeId into session payload.
          </TimeBanner>
        ) : null}

        <TimeHeroCard
          title="Timesheets"
          description="Timesheets are the approval boundary for payroll. Locked pay periods prevent changes to clocks/entries."
        />

        <TimesheetFilters
          q={q}
          onQ={setQ}
          scope={scope}
          onScope={setScope}
          canUseMeScope={canUseMeScope}
          status={status}
          onStatus={setStatus}
          employeeId={employeeId}
          onEmployeeId={setEmployeeId}
          payPeriodId={payPeriodId}
          onPayPeriodId={setPayPeriodId}
          onReset={reset}
          right={
            <span>
              Showing <span className="font-medium">{rows.length}</span> timesheet{rows.length === 1 ? "" : "s"}.
            </span>
          }
        />

        {listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading timesheets…</CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load timesheets.</CardContent>
          </Card>
        ) : rows.length ? (
          <TimesheetsTable
            rows={rows}
            busy={busy}
            canSubmit={canSubmit}
            canDecide={canDecide}
            onSubmit={(row) => {
              setActive(row);
              setSubmitOpen(true);
            }}
            onApprove={(row) => {
              setActive(row);
              setDecideMode("approve");
              setDecideOpen(true);
            }}
            onReject={(row) => {
              setActive(row);
              setDecideMode("reject");
              setDecideOpen(true);
            }}
          />
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No timesheets"
                description="Select a pay period and submit a timesheet to start approvals."
                action={
                  canSubmit ? (
                    <Button
                      onClick={() => {
                        setActive(null);
                        setSubmitOpen(true);
                      }}
                      disabled={busy}
                    >
                      <Plus className="h-4 w-4" />
                      Submit timesheet
                    </Button>
                  ) : null
                }
              />
            </CardContent>
          </Card>
        )}

        {/* dialogs */}
        <SubmitTimesheetDialog
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          busy={submitM.isPending}
          defaultEmployeeId={scope === "me" ? myEmployeeId : (active?.employeeId ?? myEmployeeId)}
          onSubmit={async (dto) => {
            try {
              await submitM.mutateAsync(dto as any);
              toast({ tone: "success", title: "Timesheet submitted" });
              await refresh();
            } catch {
              toast({ tone: "error", title: "Failed to submit timesheet" });
            }
          }}
        />

        <DecideTimesheetDialog
          open={decideOpen}
          onOpenChange={setDecideOpen}
          mode={decideMode}
          sheet={active}
          busy={approveM.isPending || rejectM.isPending}
          onDecide={async (id, dto) => {
            try {
              if (decideMode === "approve") {
                await approveM.mutateAsync({ id, dto });
                toast({ tone: "success", title: "Timesheet approved" });
              } else {
                await rejectM.mutateAsync({ id, dto });
                toast({ tone: "success", title: "Timesheet rejected" });
              }
              await refresh();
            } catch {
              toast({
                tone: "error",
                title: decideMode === "approve" ? "Failed to approve timesheet" : "Failed to reject timesheet",
              });
            }
          }}
        />
      </div>
    </TimeShell>
  );
}