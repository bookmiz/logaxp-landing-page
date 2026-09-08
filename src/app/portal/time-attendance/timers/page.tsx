"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { TimeRangePicker } from "@/logaxp/components/time-management/TimeRangePicker";

import { useTimeRange } from "@/logaxp/hooks/time-management/useTimeRange";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

import { normalizeTimeList, toIsoStart, toIsoEnd } from "@/logaxp/components/time-management/time.ui";
import type { TimerRecord } from "@/logaxp/lib/time-management/timeManagement.types";

import { useTimerHistory } from "@/logaxp/hooks/time-management/useTimerHistory";
import { useStartTimer, useStopRunningTimer, useSwitchTimer } from "@/logaxp/hooks/time-management/useTimerMutations";
import { useRunningTimer } from "@/logaxp/hooks/time-management/useTimeHubQueries";

import { RunningTimerCard } from "@/logaxp/components/time-management/timers/RunningTimerCard";
import { StartTimerDialog } from "@/logaxp/components/time-management/timers/StartTimerDialog";
import { SwitchTimerDialog } from "@/logaxp/components/time-management/timers/SwitchTimerDialog";
import { TimerHistoryFilters } from "@/logaxp/components/time-management/timers/TimerHistoryFilters";
import { TimerHistoryTable } from "@/logaxp/components/time-management/timers/TimerHistoryTable";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}
function numFromQs(v: string | null, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export default function PortalTimersPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const range = useTimeRange({ syncToUrl: true, defaultDaysBack: 7 });

  const fromIso = toIsoStart(range.from);
  const toIso = toIsoEnd(range.to);
  const rangeOk = Boolean(fromIso && toIso);

  const membershipId = useAuthStore((s) => s.membership?.id ?? null);

  // URL filters
  const q0 = sp.get("q") ?? "";
  const page0 = numFromQs(sp.get("page"), 1);
  const pageSize0 = numFromQs(sp.get("pageSize"), 20);
  const projectId0 = sp.get("projectId") ?? "";
  const workItemId0 = sp.get("workItemId") ?? "";

  const [q, setQ] = React.useState(q0);
  const [page, setPage] = React.useState(page0);
  const [pageSize, setPageSize] = React.useState(pageSize0);
  const [projectId, setProjectId] = React.useState(projectId0);
  const [workItemId, setWorkItemId] = React.useState(workItemId0);

  React.useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));

    setOrDel("q", q.trim());
    next.set("page", String(page));
    next.set("pageSize", String(pageSize));
    setOrDel("projectId", projectId.trim());
    setOrDel("workItemId", workItemId.trim());

    const nextQs = next.toString();
    if (nextQs !== sp.toString()) router.replace(`${pathname}?${nextQs}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, pageSize, projectId, workItemId]);

  React.useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, pageSize, projectId, workItemId, range.from, range.to]);

  // Queries
  const runningQ = useRunningTimer(membershipId, Boolean(membershipId));

  const historyQ = useTimerHistory(
    {
      membershipId: membershipId ?? undefined,
      projectId: projectId || undefined,
      workItemId: workItemId || undefined,
      from: fromIso,
      to: toIso,
      page,
      pageSize,
    },
    Boolean(membershipId) && rangeOk
  );

  const { items, meta } = normalizeTimeList<TimerRecord>(historyQ.data ?? null);

  // local search
  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = [...items].sort((a, b) => String(b.startedAt ?? "").localeCompare(String(a.startedAt ?? "")));
    if (!needle) return base;
    return base.filter((r) => {
      const blob = [r.id, r.projectId, r.workItemId, r.notes, r.membershipId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [items, q]);

  // Mutations
  const startM = useStartTimer();
  const stopRunningM = useStopRunningTimer();
  const switchM = useSwitchTimer();

  const busy =
    runningQ.isLoading ||
    historyQ.isFetching ||
    startM.isPending ||
    stopRunningM.isPending ||
    switchM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  // dialogs
  const [startOpen, setStartOpen] = React.useState(false);
  const [switchOpen, setSwitchOpen] = React.useState(false);

  const resetFilters = () => {
    setQ("");
    setProjectId("");
    setWorkItemId("");
    setPageSize(20);
  };

  return (
    <TimeShell
      title="Timers"
      subtitle="Focused work sessions with start/stop/switch — fast, auditable, and tenant-scoped."
      pill="Time & Leave • Timers"
      actions={
        <Button variant="outline" onClick={refresh} disabled={busy}>
          <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
          Refresh
        </Button>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard
          title="Timers"
          description="Track focused work sessions and produce clean, analyzable history."
          right={
            <TimeRangePicker
              from={range.from}
              to={range.to}
              onChange={(v) => {
                range.setFrom(v.from);
                range.setTo(v.to);
              }}
              onLast7={() => range.setLastNDays(7)}
              onLast30={() => range.setLastNDays(30)}
              onThisMonth={() => range.setThisMonth()}
              compact
            />
          }
        />

        <RunningTimerCard
          running={runningQ.data ?? null}
          membershipId={membershipId}
          busy={busy}
          onStartClick={() => setStartOpen(true)}
          onSwitchClick={() => setSwitchOpen(true)}
          onStopRunning={async ({ membershipId, billable, notes }) => {
            await stopRunningM.mutateAsync({ membershipId, billable, notes: notes ?? null });
            await refresh();
          }}
        />

        <TimerHistoryFilters
          q={q}
          onQ={setQ}
          projectId={projectId}
          onProjectId={setProjectId}
          workItemId={workItemId}
          onWorkItemId={setWorkItemId}
          pageSize={pageSize}
          onPageSize={setPageSize}
          onReset={resetFilters}
          right={
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Range: <span className="font-medium">{range.from}</span> →{" "}
              <span className="font-medium">{range.to}</span>
            </div>
          }
        />

        {historyQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
              Loading timer history…
            </CardContent>
          </Card>
        ) : historyQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
              Failed to load timer history.
            </CardContent>
          </Card>
        ) : rows.length ? (
          <TimerHistoryTable
            rows={rows}
            meta={meta}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            busy={busy}
          />
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No timer history"
                description="Start a timer to generate history in this date range."
                action={
                  <Button onClick={() => setStartOpen(true)} disabled={!membershipId}>
                    Start timer
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

        <StartTimerDialog
          open={startOpen}
          onOpenChange={setStartOpen}
          membershipId={membershipId}
          busy={startM.isPending}
          onStart={async (dto) => {
            await startM.mutateAsync(dto);
            await refresh();
          }}
        />

        <SwitchTimerDialog
          open={switchOpen}
          onOpenChange={setSwitchOpen}
          membershipId={membershipId}
          defaultBillable={Boolean(runningQ.data?.data?.billable)}
          busy={switchM.isPending}
          onSwitch={async (dto) => {
            await switchM.mutateAsync(dto);
            await refresh();
          }}
        />
      </div>
    </TimeShell>
  );
}