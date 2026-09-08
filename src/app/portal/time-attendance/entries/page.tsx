"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { useTimeRange } from "@/logaxp/hooks/time-management/useTimeRange";

import { TimeEntryFilters, type BillableFilter, type ScopeFilter } from "@/logaxp/components/time-management/entries/TimeEntryFilters";
import { TimeEntriesTable } from "@/logaxp/components/time-management/entries/TimeEntriesTable";
import { TimeEntryCreateEditDialog } from "@/logaxp/components/time-management/entries/TimeEntryCreateEditDialog";
import { ConfirmDialog } from "@/logaxp/components/time-management/dialogs/ConfirmDialog";

import {
  normalizeTimeList,
  formatIsoDateTime,
  toIsoStart,
  toIsoEnd,
} from "@/logaxp/components/time-management/time.ui";
import { useTimeEntries } from "@/logaxp/hooks/time-management/useTimeEntries";
import {
  useCreateTimeEntry,
  useHardDeleteTimeEntry,
  useRestoreTimeEntry,
  useSoftDeleteTimeEntry,
  useUpdateTimeEntry,
} from "@/logaxp/hooks/time-management/useTimeEntryMutations";

import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import type { TimeEntry } from "@/logaxp/lib/time-management/timeManagement.types";
import { useTimeEntriesDailySummary, useTimeEntriesStats } from "@/logaxp/hooks/time-management/useTimeHubQueries";
import { TimeEntryStatsStrip } from "@/logaxp/components/time-management/entries/TimeEntryStatsStrip";
import { TimeEntryDailySummaryCard } from "@/logaxp/components/time-management/entries/TimeEntryDailySummaryCard";

import { ExportMenu } from "@/logaxp/components/time-management/export/ExportMenu";
import { toCsv, downloadCsv, type CsvColumn } from "@/logaxp/components/time-management/export/exportCsv";
import { fetchAllPages } from "@/logaxp/components/time-management/export/exportFetchAll";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import { TimeBanner } from "@/logaxp/components/time-management/feedback/TimeBanner";
import { defaultTimeScope } from "@/logaxp/components/time-management/state/timeDefaults";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function boolFromQs(v: string | null, def = false) {
  if (v == null) return def;
  return v === "true" || v === "1" || v === "yes";
}

function numFromQs(v: string | null, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

const ENTRY_COLUMNS: CsvColumn<TimeEntry>[] = [
  { header: "id", value: (r) => r.id },
  { header: "employeeId", value: (r) => r.employeeId ?? "" },
  { header: "membershipId", value: (r) => r.membershipId ?? "" },
  { header: "projectId", value: (r) => r.projectId ?? "" },
  { header: "workItemId", value: (r) => r.workItemId ?? "" },
  { header: "source", value: (r) => r.source ?? "" },
  { header: "billable", value: (r) => (r.billable ? "true" : "false") },
  { header: "startAt", value: (r) => r.startAt ?? "" },
  { header: "endAt", value: (r) => r.endAt ?? "" },
  { header: "durationMinutes", value: (r) => r.durationMinutes ?? "" },
  { header: "notes", value: (r) => r.notes ?? "" },
  { header: "createdAt", value: (r) => r.createdAt ?? "" },
  { header: "deletedAt", value: (r) => r.deletedAt ?? "" },
];

export default function PortalTimeEntriesPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const range = useTimeRange({ syncToUrl: true, defaultDaysBack: 7 });
  const fromIso = React.useMemo(() => toIsoStart(range.from), [range.from]);
  const toIso = React.useMemo(() => toIsoEnd(range.to), [range.to]);
  const rangeOk = Boolean(fromIso && toIso);

  const membership = useAuthStore((s) => s.membership);
  const membershipId = useAuthStore((s) => s.membership?.id ?? null);
  const employeeId = useAuthStore((s) => s.employee?.id ?? null);

  // URL state
  const q0 = sp.get("q") ?? "";
  const page0 = numFromQs(sp.get("page"), 1);
  const pageSize0 = numFromQs(sp.get("pageSize"), 20);
  const includeDeleted0 = boolFromQs(sp.get("includeDeleted"), false);
  const billable0 = (sp.get("billable") as BillableFilter | null) ?? "any";
  const source0 = sp.get("source") ?? "";
  const scopeFromUrl = sp.get("scope") as ScopeFilter | null;
  const scope0 = scopeFromUrl ?? defaultTimeScope(membership);
  const projectId0 = sp.get("projectId") ?? "";
  const workItemId0 = sp.get("workItemId") ?? "";

  const [q, setQ] = React.useState(q0);
  const [page, setPage] = React.useState(page0);
  const [pageSize, setPageSize] = React.useState(pageSize0);
  const [includeDeleted, setIncludeDeleted] = React.useState(includeDeleted0);
  const [billable, setBillable] = React.useState<BillableFilter>(billable0);
  const [source, setSource] = React.useState(source0);
  const [scope, setScope] = React.useState<ScopeFilter>(scope0);
  const [projectId, setProjectId] = React.useState(projectId0);
  const [workItemId, setWorkItemId] = React.useState(workItemId0);

  // URL sync
  React.useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));

    setOrDel("q", q.trim());
    next.set("page", String(page));
    next.set("pageSize", String(pageSize));
    next.set("includeDeleted", includeDeleted ? "true" : "false");
    next.set("billable", billable);
    setOrDel("source", source);
    next.set("scope", scope);
    setOrDel("projectId", projectId.trim());
    setOrDel("workItemId", workItemId.trim());

    const nextQs = next.toString();
    if (nextQs !== sp.toString()) router.replace(`${pathname}?${nextQs}`);
  }, [q, page, pageSize, includeDeleted, billable, source, scope, projectId, workItemId, pathname, router, sp]);

  React.useEffect(() => {
    setPage(1);
  }, [q, includeDeleted, billable, source, scope, projectId, workItemId, fromIso, toIso]);

  const apiBillable = billable === "any" ? undefined : billable === "billable";
  const apiEmployeeId = scope === "me" && employeeId ? employeeId : undefined;

  // Queries
  const listQ = useTimeEntries(
    rangeOk
      ? {
          membershipId: membershipId ?? undefined,
          employeeId: apiEmployeeId,
          projectId: projectId || undefined,
          workItemId: workItemId || undefined,
          source: source || undefined,
          billable: apiBillable,
          includeDeleted,
          from: fromIso,
          to: toIso,
          page,
          pageSize,
        }
      : undefined,
    rangeOk
  );

  const statsQ = useTimeEntriesStats(
    rangeOk
      ? {
          membershipId: membershipId ?? undefined,
          employeeId: apiEmployeeId,
          projectId: projectId || undefined,
          workItemId: workItemId || undefined,
          source: source || undefined,
          billable: apiBillable,
          from: fromIso,
          to: toIso,
        }
      : undefined,
    rangeOk
  );

  const dailyQ = useTimeEntriesDailySummary(
    rangeOk && fromIso && toIso ? { from: fromIso, to: toIso, groupBy: "day" } : undefined,
    rangeOk
  );

  const { items, meta } = normalizeTimeList<TimeEntry>(listQ.data ?? null);

  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = [...items].sort((a, b) =>
      String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))
    );
    if (!needle) return base;

    return base.filter((r) => {
      const blob = [
        r.id,
        r.projectId,
        r.workItemId,
        r.notes,
        r.source,
        r.employeeId,
        r.membershipId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [items, q]);

  // Mutations
  const createM = useCreateTimeEntry();
  const updateM = useUpdateTimeEntry();
  const softDeleteM = useSoftDeleteTimeEntry();
  const restoreM = useRestoreTimeEntry();
  const hardDeleteM = useHardDeleteTimeEntry();

  const busy =
    listQ.isFetching ||
    createM.isPending ||
    updateM.isPending ||
    softDeleteM.isPending ||
    restoreM.isPending ||
    hardDeleteM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["time"] });
  };

  // Dialogs
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [active, setActive] = React.useState<TimeEntry | null>(null);

  const [confirm, setConfirm] = React.useState<{
    open: boolean;
    kind: "softDelete" | "restore" | "hardDelete";
    id: string;
  }>({ open: false, kind: "softDelete", id: "" });

  const resetFilters = () => {
    setQ("");
    setIncludeDeleted(false);
    setBillable("any");
    setSource("");
    setScope(defaultTimeScope(membership) as ScopeFilter);
    setProjectId("");
    setWorkItemId("");
    setPageSize(20);
  };

  // Export
  const [exportBusy, setExportBusy] = React.useState(false);
  const [exportNote, setExportNote] = React.useState("");

  const exportPage = async () => {
    setExportNote("");
    const csv = toCsv(rows, ENTRY_COLUMNS);
    downloadCsv(`time-entries_page-${page}_${range.from}_to_${range.to}.csv`, csv);
  };

  const exportAll = async () => {
    if (!membershipId || !rangeOk) return;
    setExportBusy(true);
    setExportNote("");

    try {
      const { items: all, truncated } = await fetchAllPages<TimeEntry>({
        fetchPage: ({ page, pageSize }) =>
          timeManagementService.entries.list({
            membershipId,
            employeeId: apiEmployeeId,
            projectId: projectId || undefined,
            workItemId: workItemId || undefined,
            source: source || undefined,
            billable: apiBillable,
            includeDeleted,
            from: fromIso,
            to: toIso,
            page,
            pageSize,
          }),
        pageSize: 200,
        maxRows: 5000,
        hardMaxPages: 50,
      });

      const csv = toCsv(all, ENTRY_COLUMNS);
      downloadCsv(`time-entries_ALL_${range.from}_to_${range.to}.csv`, csv);

      if (truncated) {
        setExportNote("Export limited to 5,000 rows. Narrow filters/date range for full export.");
      }
    } finally {
      setExportBusy(false);
    }
  };

  const total = meta?.total;

  return (
    <TimeShell
      title="Time Entries"
      subtitle="Track, edit, audit, and export time records with full role-based scoping."
      pill="Time & Leave • Entries"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={refresh} disabled={busy} className="gap-1.5">
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          <ExportMenu
            disabled={!membershipId || busy}
            busy={exportBusy}
            onExportPage={exportPage}
            onExportAll={exportAll}
            hint="Current filters applied. All export capped at 5,000 rows."
          />

          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={busy} className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-6">
        {/* Export notice banner */}
        {exportNote && <TimeBanner tone="info" title="Export Info">{exportNote}</TimeBanner>}

        {/* Scope warning for "me" mode without employee */}
        {scope === "me" && !employeeId && (
          <TimeBanner tone="warning" title="Limited View">
            No employee linked to your account. Showing workspace-wide entries instead.
          </TimeBanner>
        )}

        {/* Filters + Stats */}
        <div className="sticky top-0 z-20 -mx-4 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8">
          <div className="py-5">
            <TimeEntryFilters
              q={q}
              onQ={setQ}
              scope={scope}
              onScope={setScope}
              canUseMeScope={Boolean(employeeId)}
              includeDeleted={includeDeleted}
              onIncludeDeleted={setIncludeDeleted}
              billable={billable}
              onBillable={setBillable}
              source={source}
              onSource={setSource}
              projectId={projectId}
              onProjectId={setProjectId}
              workItemId={workItemId}
              onWorkItemId={setWorkItemId}
              pageSize={pageSize}
              onPageSize={setPageSize}
              onReset={resetFilters}
              right={
                <div className="text-xs text-muted-foreground">
                  Range: <span className="font-medium">{range.from}</span> →{" "}
                  <span className="font-medium">{range.to}</span>
                </div>
              }
            />
          </div>
        </div>

        {/* Stats & Daily Summary */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TimeEntryStatsStrip stats={statsQ.data ?? null} loading={statsQ.isLoading} />
          </div>
          <div>
            <TimeEntryDailySummaryCard summary={dailyQ.data ?? null} loading={dailyQ.isLoading} />
          </div>
        </div>

        {/* Main Table / Empty State */}
        {listQ.isLoading ? (
          <Card className="rounded-3xl border bg-card shadow-sm">
            <CardContent className="p-12 text-center text-muted-foreground">
              Loading time entries...
            </CardContent>
          </Card>
        ) : listQ.isError ? (
          <Card className="rounded-3xl border bg-card shadow-sm">
            <CardContent className="p-12 text-center text-destructive">
              Failed to load entries. Please refresh or check your filters.
            </CardContent>
          </Card>
        ) : rows.length ? (
          <TimeEntriesTable
            rows={rows}
            meta={meta}
            busy={busy}
            page={page}
            pageSize={pageSize}
            total={total}
            onPage={setPage}
            onEdit={(r) => {
              setActive(r);
              setEditOpen(true);
            }}
            onSoftDelete={(id) => setConfirm({ open: true, kind: "softDelete", id })}
            onRestore={(id) => setConfirm({ open: true, kind: "restore", id })}
            onHardDelete={(id) => setConfirm({ open: true, kind: "hardDelete", id })}
          />
        ) : (
          <Card className="rounded-3xl border bg-card shadow-sm">
            <CardContent className="p-16 text-center">
              <EmptyState
                title="No time entries found"
                description="Create your first entry or adjust filters/date range."
                action={
                  <Button onClick={() => setCreateOpen(true)} size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Create Time Entry
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

        {/* Audit Info Panel */}
        <Card className="rounded-3xl border bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Audit & Safety Rules</CardTitle>
            <CardDescription>Stage 6 hardened behavior</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <li>Exports capped at 5,000 rows for performance</li>
            <li>Soft delete preserves full audit trail</li>
            <li>Hard delete is permanent and irreversible</li>
            <li>&quot;My&quot; scope auto-defaults for non-admins</li>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <TimeEntryCreateEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          membershipId={membershipId}
          defaultEmployeeId={employeeId}
          busy={createM.isPending}
          onCreate={async (dto) => {
            await createM.mutateAsync(dto as any);
            await refresh();
          }}
          onUpdate={async () => {}}
        />

        <TimeEntryCreateEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          entry={active}
          membershipId={membershipId}
          defaultEmployeeId={employeeId}
          busy={updateM.isPending}
          onCreate={async () => {}}
          onUpdate={async (id, dto) => {
            await updateM.mutateAsync({ id, dto });
            await refresh();
          }}
        />

        <ConfirmDialog
          open={confirm.open}
          onOpenChange={(v) => setConfirm((c) => ({ ...c, open: v }))}
          title={
            confirm.kind === "softDelete"
              ? "Soft Delete Entry?"
              : confirm.kind === "restore"
              ? "Restore Entry?"
              : "Permanently Delete Entry?"
          }
          description={
            confirm.kind === "softDelete"
              ? "This entry will be soft-deleted and can be restored later."
              : confirm.kind === "restore"
              ? "This will restore the entry to active status."
              : "This action is permanent and cannot be undone."
          }
          destructive={confirm.kind !== "restore"}
          confirmText={
            confirm.kind === "softDelete"
              ? "Soft Delete"
              : confirm.kind === "restore"
              ? "Restore"
              : "Hard Delete"
          }
          busy={busy}
          onConfirm={async () => {
            if (confirm.kind === "softDelete") await softDeleteM.mutateAsync(confirm.id);
            else if (confirm.kind === "restore") await restoreM.mutateAsync(confirm.id);
            else await hardDeleteM.mutateAsync(confirm.id);
            await refresh();
          }}
        />
      </div>
    </TimeShell>
  );
}