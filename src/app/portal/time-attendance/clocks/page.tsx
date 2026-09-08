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

import type { TimeClock } from "@/logaxp/lib/time-management/timeManagement.types";
import { normalizeTimeList, toIsoStart, toIsoEnd } from "@/logaxp/components/time-management/time.ui";

import { useTimeClocks } from "@/logaxp/hooks/time-management/useTimeClocks";
import { useAddBreak, useAdjustTimeClock, useClockIn, useClockOut, useSetBreak } from "@/logaxp/hooks/time-management/useTimeClockMutations";
import { useOpenTimeClock, useTimeClockSummary } from "@/logaxp/hooks/time-management/useTimeHubQueries";

import { TimeClockFilters, type ClockScope } from "@/logaxp/components/time-management/clocks/TimeClockFilters";
import { TimeClockSummaryCards } from "@/logaxp/components/time-management/clocks/TimeClockSummaryCards";
import { ClockStatusCard } from "@/logaxp/components/time-management/clocks/ClockStatusCard";
import { TimeClocksTable } from "@/logaxp/components/time-management/clocks/TimeClocksTable";

import { ClockInDialog } from "@/logaxp/components/time-management/clocks/ClockInDialog";
import { ClockOutDialog } from "@/logaxp/components/time-management/clocks/ClockOutDialog";
import { BreakMinutesDialog } from "@/logaxp/components/time-management/clocks/BreakMinutesDialog";
import { TimeClockAdjustDialog } from "@/logaxp/components/time-management/clocks/TimeClockAdjustDialog";

import { ExportMenu } from "@/logaxp/components/time-management/export/ExportMenu";
import { toCsv, downloadCsv, type CsvColumn } from "@/logaxp/components/time-management/export/exportCsv";
import { fetchAllPages } from "@/logaxp/components/time-management/export/exportFetchAll";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import { TimeBanner } from "@/logaxp/components/time-management/feedback/TimeBanner";
import { defaultTimeScope } from "@/logaxp/components/time-management/state/timeDefaults";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}
function numFromQs(v: string | null, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

const CLOCK_COLUMNS: CsvColumn<TimeClock>[] = [
  { header: "id", value: (r) => r.id },
  { header: "employeeId", value: (r) => r.employeeId ?? "" },
  { header: "locationId", value: (r) => r.locationId ?? "" },
  { header: "status", value: (r) => r.status ?? "" },
  { header: "clockInAt", value: (r) => r.clockInAt ?? "" },
  { header: "clockOutAt", value: (r) => r.clockOutAt ?? "" },
  { header: "breakMinutes", value: (r) => r.breakMinutes ?? 0 },
  { header: "notes", value: (r) => r.notes ?? "" },
  { header: "createdAt", value: (r) => r.createdAt ?? "" },
];

export default function PortalTimeClocksPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const range = useTimeRange({ syncToUrl: true, defaultDaysBack: 7 });
  const fromIso = React.useMemo(() => toIsoStart(range.from), [range.from]);
  const toIso = React.useMemo(() => toIsoEnd(range.to), [range.to]);
  const rangeOk = Boolean(fromIso && toIso);

  const membership = useAuthStore((s) => s.membership);
  const employeeIdFromSession = useAuthStore((s) => s.employee?.id ?? null);

  // URL filters
  const q0 = sp.get("q") ?? "";
  const page0 = numFromQs(sp.get("page"), 1);
  const pageSize0 = numFromQs(sp.get("pageSize"), 20);
  const status0 = sp.get("status") ?? "";
  const employeeId0 = sp.get("employeeId") ?? "";
  const locationId0 = sp.get("locationId") ?? "";

  // Stage 6: role-aware default scope if not specified in URL
  const scopeFromUrl = sp.get("scope") as ClockScope | null;
  const scope0 = (scopeFromUrl ?? (defaultTimeScope(membership) as any)) as ClockScope;

  const [q, setQ] = React.useState(q0);
  const [page, setPage] = React.useState(page0);
  const [pageSize, setPageSize] = React.useState(pageSize0);
  const [status, setStatus] = React.useState(status0);
  const [employeeId, setEmployeeId] = React.useState(employeeId0);
  const [locationId, setLocationId] = React.useState(locationId0);
  const [scope, setScope] = React.useState<ClockScope>(scope0);

  React.useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));

    setOrDel("q", q.trim());
    next.set("page", String(page));
    next.set("pageSize", String(pageSize));
    setOrDel("status", status.trim());
    setOrDel("employeeId", employeeId.trim());
    setOrDel("locationId", locationId.trim());
    next.set("scope", scope);

    const nextQs = next.toString();
    if (nextQs !== sp.toString()) router.replace(`${pathname}?${nextQs}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, pageSize, status, employeeId, locationId, scope]);

  React.useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, pageSize, status, employeeId, locationId, scope, fromIso, toIso]);

  const meEmployeeId = employeeIdFromSession;
  const canClock = Boolean(meEmployeeId);

  const apiEmployeeId =
    scope === "me" && meEmployeeId ? meEmployeeId : (employeeId.trim() || undefined);

  // Queries
  const openQ = useOpenTimeClock(meEmployeeId, Boolean(meEmployeeId));
  const summaryQ = useTimeClockSummary(
    { from: fromIso!, to: toIso!, employeeId: apiEmployeeId, includeOpen: true, groupBy: "day" },
    rangeOk
  );

  const listQ = useTimeClocks(
    {
      from: fromIso!,
      to: toIso!,
      employeeId: apiEmployeeId,
      locationId: locationId.trim() || undefined,
      status: status.trim() || undefined,
      page,
      pageSize,
    },
    rangeOk
  );

  const { items, meta } = normalizeTimeList<TimeClock>(listQ.data ?? null);

  // local search
  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = [...items].sort((a, b) => String(b.clockInAt ?? "").localeCompare(String(a.clockInAt ?? "")));
    if (!needle) return base;
    return base.filter((r) => {
      const blob = [r.id, r.employeeId, r.locationId, r.status, r.notes, r.clockInAt, r.clockOutAt]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [items, q]);

  // Mutations
  const clockInM = useClockIn();
  const clockOutM = useClockOut();
  const addBreakM = useAddBreak();
  const setBreakM = useSetBreak();
  const adjustM = useAdjustTimeClock();

  const busy =
    listQ.isFetching ||
    openQ.isFetching ||
    summaryQ.isFetching ||
    clockInM.isPending ||
    clockOutM.isPending ||
    addBreakM.isPending ||
    setBreakM.isPending ||
    adjustM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  // dialogs
  const [clockInOpen, setClockInOpen] = React.useState(false);
  const [clockOutOpen, setClockOutOpen] = React.useState(false);
  const [breakOpen, setBreakOpen] = React.useState(false);
  const [breakMode, setBreakMode] = React.useState<"add" | "set">("add");
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [activeClock, setActiveClock] = React.useState<TimeClock | null>(null);

  const resetFilters = () => {
    setQ("");
    setStatus("");
    setEmployeeId("");
    setLocationId("");
    setScope(defaultTimeScope(membership) as any);
    setPageSize(20);
  };

  const openClock = openQ.data ?? null;

  // Export
  const [exportBusy, setExportBusy] = React.useState(false);
  const [exportNote, setExportNote] = React.useState("");

  const exportPage = async () => {
    setExportNote("");
    downloadCsv(`time-clocks_page-${page}_${range.from}_to_${range.to}.csv`, toCsv(rows, CLOCK_COLUMNS));
  };

  const exportAll = async () => {
    if (!rangeOk) return;
    setExportBusy(true);
    setExportNote("");
    try {
      const { items: all, truncated } = await fetchAllPages<TimeClock>({
        fetchPage: ({ page, pageSize }) =>
          timeManagementService.clocks.list({
            from: fromIso!,
            to: toIso!,
            employeeId: apiEmployeeId,
            locationId: locationId.trim() || undefined,
            status: status.trim() || undefined,
            page,
            pageSize,
          }),
        pageSize: 200,
        maxRows: 5000,
        hardMaxPages: 50,
      });

      downloadCsv(`time-clocks_ALL_${range.from}_to_${range.to}.csv`, toCsv(all, CLOCK_COLUMNS));
      if (truncated) setExportNote("Export truncated at 5,000 rows for safety. Narrow filters/date range.");
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <TimeShell
      title="Time Clocks"
      subtitle=""
      pill=""
      actions={
        <>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          <ExportMenu
            disabled={busy}
            busy={exportBusy}
            onExportPage={exportPage}
            onExportAll={exportAll}
            hint="All export capped at 5,000 rows."
          />
        </>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        {exportNote ? <TimeBanner tone="warning" title="Export notice">{exportNote}</TimeBanner> : null}

        {scope === "me" && !meEmployeeId ? (
          <TimeBanner tone="warning" title="My clocks unavailable">
            No employee context was found in session. Switch to Workspace scope or wire employeeId into membership/user payload.
          </TimeBanner>
        ) : null}

        <TimeHeroCard
          title="Time Clocks"
          description="Open clock detection, breaks, adjustments, and exports."
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

        <ClockStatusCard
          openClock={openClock}
          canClock={canClock}
          busy={busy}
          onClockInClick={() => setClockInOpen(true)}
          onClockOutClick={(clock) => {
            setActiveClock(clock);
            setClockOutOpen(true);
          }}
          onAddBreakClick={(clock) => {
            setActiveClock(clock);
            setBreakMode("add");
            setBreakOpen(true);
          }}
          onSetBreakClick={(clock) => {
            setActiveClock(clock);
            setBreakMode("set");
            setBreakOpen(true);
          }}
          onAdjustClick={(clock) => {
            setActiveClock(clock);
            setAdjustOpen(true);
          }}
        />

        <TimeClockSummaryCards
            summary={summaryQ.data ?? null}
            loading={summaryQ.isLoading}
            hasOpenClock={Boolean(openClock?.id && !openClock?.clockOutAt)}
          />

        <TimeClockFilters
          q={q}
          onQ={setQ}
          scope={scope}
          onScope={setScope}
          canUseMeScope={Boolean(meEmployeeId)}
          status={status}
          onStatus={setStatus}
          employeeId={employeeId}
          onEmployeeId={setEmployeeId}
          locationId={locationId}
          onLocationId={setLocationId}
          pageSize={pageSize}
          onPageSize={setPageSize}
          onReset={resetFilters}
          right={
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Range: <span className="font-medium">{range.from}</span> → <span className="font-medium">{range.to}</span>
            </div>
          }
        />

        {listQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading clocks…</CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load clocks.</CardContent>
          </Card>
        ) : rows.length ? (
          <TimeClocksTable
            rows={rows}
            meta={meta}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            busy={busy}
            onClockOut={(row) => {
              setActiveClock(row);
              setClockOutOpen(true);
            }}
            onAddBreak={(row) => {
              setActiveClock(row);
              setBreakMode("add");
              setBreakOpen(true);
            }}
            onSetBreak={(row) => {
              setActiveClock(row);
              setBreakMode("set");
              setBreakOpen(true);
            }}
            onAdjust={(row) => {
              setActiveClock(row);
              setAdjustOpen(true);
            }}
          />
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6">
              <EmptyState
                title="No clock records"
                description="Try a wider date range or remove filters."
                action={
                  <Button onClick={() => setClockInOpen(true)} disabled={!canClock}>
                    Clock in
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

        {/* dialogs */}
        <ClockInDialog
          open={clockInOpen}
          onOpenChange={setClockInOpen}
          defaultEmployeeId={meEmployeeId}
          busy={clockInM.isPending}
          onClockIn={async (dto) => {
            await clockInM.mutateAsync(dto);
            await refresh();
          }}
        />

        <ClockOutDialog
          open={clockOutOpen}
          onOpenChange={setClockOutOpen}
          clock={activeClock}
          busy={clockOutM.isPending}
          onClockOut={async (clockId, dto) => {
            await clockOutM.mutateAsync({ clockId, dto });
            await refresh();
          }}
        />

        <BreakMinutesDialog
          open={breakOpen}
          onOpenChange={setBreakOpen}
          mode={breakMode}
          clock={activeClock}
          busy={breakMode === "add" ? addBreakM.isPending : setBreakM.isPending}
          onSubmit={async (clockId, minutes) => {
            if (breakMode === "add") await addBreakM.mutateAsync({ clockId, dto: { minutes } });
            else await setBreakM.mutateAsync({ clockId, dto: { minutes } });
            await refresh();
          }}
        />

        <TimeClockAdjustDialog
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          clock={activeClock}
          busy={adjustM.isPending}
          onAdjust={async (clockId, dto) => {
            await adjustM.mutateAsync({ clockId, dto });
            await refresh();
          }}
        />
      </div>
    </TimeShell>
  );
}