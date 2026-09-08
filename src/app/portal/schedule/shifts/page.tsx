"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, Plus, Wand2, Send, ShieldAlert, CalendarDays, LayoutGrid, List } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ToggleGroup, ToggleGroupItem } from "@/logaxp/components/ui/toggle-group";

import { ScheduleShell } from "@/logaxp/components/scheduling/ScheduleShell";
import { ScheduleBanner } from "@/logaxp/components/scheduling/feedback/ScheduleBanner";

import { useShiftSelection } from "@/logaxp/hooks/scheduling/useShiftSelection";
import { useShiftConflictsMap } from "@/logaxp/hooks/scheduling/useShiftConflictsMap";

import { ShiftsCalendarWeekDnd } from "@/logaxp/components/scheduling/shifts/ShiftsCalendarWeekDnd";
import { ShiftsBulkActionBar } from "@/logaxp/components/scheduling/shifts/ShiftsBulkActionBar";
import { ShiftsFilters } from "@/logaxp/components/scheduling/shifts/ShiftsFilters";
import { ShiftsExportMenu } from "@/logaxp/components/scheduling/shifts/ShiftsExportMenu";
import { PublishConfirmDialog } from "@/logaxp/components/scheduling/shifts/PublishConfirmDialog";
import { ShiftsTable } from "@/logaxp/components/scheduling/shifts/ShiftsTable";
import { ShiftCreateEditDialog } from "@/logaxp/components/scheduling/shifts/ShiftCreateEditDialog";
import { GenerateShiftsDialog } from "@/logaxp/components/scheduling/shifts/GenerateShiftsDialog";
import { ConflictsDrawer } from "@/logaxp/components/scheduling/shifts/ConflictsDrawer";

import { useTimeRange } from "@/logaxp/hooks/time-management/useTimeRange";
import { TimeRangePicker } from "@/logaxp/components/time-management/TimeRangePicker";
import { toIsoStart, toIsoEnd, normalizeTimeList } from "@/logaxp/components/time-management/time.ui";

import { toCsv, downloadCsv, type CsvColumn } from "@/logaxp/components/time-management/export/exportCsv";
import { fetchAllPages } from "@/logaxp/components/time-management/export/exportFetchAll";
import { scheduleManagementService } from "@/logaxp/lib/scheduling/scheduleManagementService";
import type { Shift } from "@/logaxp/lib/scheduling/scheduleManagement.types";
import { useShifts } from "@/logaxp/hooks/scheduling/useShifts";
import {
  useCreateShift,
  useUpdateShift,
  useCancelShift,
  useGenerateShifts,
  usePublishShifts,
} from "@/logaxp/hooks/scheduling/useShiftMutations";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function numFromQs(v: string | null, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

const SHIFT_COLUMNS: CsvColumn<Shift>[] = [
  { header: "id", value: (r) => r.id },
  { header: "employeeId", value: (r) => r.employeeId ?? "" },
  { header: "orgUnitId", value: (r) => r.orgUnitId ?? "" },
  { header: "locationId", value: (r) => r.locationId ?? "" },
  { header: "positionId", value: (r) => r.positionId ?? "" },
  { header: "status", value: (r) => String((r as any).status ?? "") },
  { header: "startAt", value: (r) => (r as any).startAt ?? "" },
  { header: "endAt", value: (r) => (r as any).endAt ?? "" },
  { header: "source", value: (r) => String((r as any).source ?? "") },
  { header: "publishedAt", value: (r) => (r as any).publishedAt ?? "" },
  { header: "notes", value: (r) => (r as any).notes ?? "" },
];

type ViewMode = "calendar" | "table";

export default function PortalScheduleShiftsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const range = useTimeRange({ syncToUrl: true, defaultDaysBack: 7 });
  const fromIso = React.useMemo(() => toIsoStart(range.from), [range.from]);
  const toIso = React.useMemo(() => toIsoEnd(range.to), [range.to]);
  const rangeOk = Boolean(fromIso && toIso);

  // Persisted view mode
  const [viewMode, setViewMode] = React.useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("shiftsViewMode") as ViewMode) || "calendar";
    }
    return "calendar";
  });

  React.useEffect(() => {
    localStorage.setItem("shiftsViewMode", viewMode);
  }, [viewMode]);

  // URL state (filters, pagination)
  const q0 = sp.get("q") ?? "";
  const page0 = numFromQs(sp.get("page"), 1);
  const pageSize0 = numFromQs(sp.get("pageSize"), 20);
  const status0 = sp.get("status") ?? "";
  const employeeId0 = sp.get("employeeId") ?? "";
  const orgUnitId0 = sp.get("orgUnitId") ?? "";
  const locationId0 = sp.get("locationId") ?? "";

  const [q, setQ] = React.useState(q0);
  const [page, setPage] = React.useState(page0);
  const [pageSize, setPageSize] = React.useState(pageSize0);
  const [status, setStatus] = React.useState(status0);
  const [employeeId, setEmployeeId] = React.useState(employeeId0);
  const [orgUnitId, setOrgUnitId] = React.useState(orgUnitId0);
  const [locationId, setLocationId] = React.useState(locationId0);

  React.useEffect(() => {
    const next = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));

    setOrDel("q", q.trim());
    next.set("page", String(page));
    next.set("pageSize", String(pageSize));
    setOrDel("status", status.trim());
    setOrDel("employeeId", employeeId.trim());
    setOrDel("orgUnitId", orgUnitId.trim());
    setOrDel("locationId", locationId.trim());

    const nextQs = next.toString();
    if (nextQs !== sp.toString()) router.replace(`${pathname}?${nextQs}`);
  }, [q, page, pageSize, status, employeeId, orgUnitId, locationId, pathname, router, sp]);

  React.useEffect(() => {
    setPage(1);
  }, [q, pageSize, status, employeeId, orgUnitId, locationId, fromIso, toIso]);

  const apiEmployeeId = employeeId.trim() || undefined;
  const apiOrgUnitId = orgUnitId.trim() || undefined;
  const apiLocationId = locationId.trim() || undefined;

  const listQ = useShifts(
    rangeOk
      ? {
          from: fromIso!,
          to: toIso!,
          employeeId: apiEmployeeId,
          orgUnitId: apiOrgUnitId,
          locationId: apiLocationId,
          status: status.trim() || undefined,
          page,
          pageSize,
        }
      : null,
    rangeOk
  );

  const conflicts = useShiftConflictsMap(
    {
      from: fromIso!,
      to: toIso!,
      employeeId: apiEmployeeId,
      orgUnitId: apiOrgUnitId,
      locationId: apiLocationId,
    },
    rangeOk
  );

  const sel = useShiftSelection();

  const { items, meta } = normalizeTimeList<Shift>(listQ.data ?? null);

  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = [...items].sort((a, b) =>
      String((b as any).startAt ?? "").localeCompare(String((a as any).startAt ?? ""))
    );
    if (!needle) return base;
    return base.filter((r) => {
      const blob = [
        r.id,
        r.employeeId,
        r.orgUnitId,
        r.locationId,
        r.positionId,
        (r as any).status,
        (r as any).notes,
        (r as any).startAt,
        (r as any).endAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [items, q]);

  const createM = useCreateShift();
  const updateM = useUpdateShift();
  const cancelM = useCancelShift();
  const generateM = useGenerateShifts();
  const publishM = usePublishShifts();

  const updateShiftM = updateM;

  const busy =
    listQ.isFetching ||
    Boolean((conflicts as any)?.isFetching) ||
    createM.isPending ||
    updateM.isPending ||
    cancelM.isPending ||
    generateM.isPending ||
    publishM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["schedule"] as any });
  };

  const resetFilters = () => {
    setQ("");
    setStatus("");
    setEmployeeId("");
    setOrgUnitId("");
    setLocationId("");
    setPageSize(20);
  };

  // dialogs
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [active, setActive] = React.useState<Shift | null>(null);

  const [genOpen, setGenOpen] = React.useState(false);
  const [pubOpen, setPubOpen] = React.useState(false);
  const [confOpen, setConfOpen] = React.useState(false);

  const overlaps = (conflicts as any)?.data?.data?.overlaps?.length ?? 0;
  const restViolations = (conflicts as any)?.data?.data?.restViolations?.length ?? 0;

  // Export handlers (unchanged)
  const [exportBusy, setExportBusy] = React.useState(false);
  const [exportNote, setExportNote] = React.useState("");

  const exportPage = async () => {
    setExportNote("");
    downloadCsv(`shifts_page-${page}_${range.from}_to_${range.to}.csv`, toCsv(rows, SHIFT_COLUMNS));
  };

  const exportAll = async () => {
    if (!rangeOk) return;
    setExportBusy(true);
    setExportNote("");
    try {
      const { items: all, truncated } = await fetchAllPages<Shift>({
        fetchPage: ({ page, pageSize }) =>
          scheduleManagementService.shifts.list({
            from: fromIso!,
            to: toIso!,
            employeeId: apiEmployeeId,
            orgUnitId: apiOrgUnitId,
            locationId: apiLocationId,
            status: status.trim() || undefined,
            page,
            pageSize,
          } as any),
        pageSize: 200,
        maxRows: 5000,
        hardMaxPages: 50,
      });

      downloadCsv(`shifts_ALL_${range.from}_to_${range.to}.csv`, toCsv(all, SHIFT_COLUMNS));
      if (truncated) setExportNote("Export truncated at 5,000 rows. Narrow filters/date range.");
    } finally {
      setExportBusy(false);
    }
  };

  const bulkPublish = async () => {
    const ids = sel.list;
    if (!ids.length) return;
    await Promise.allSettled(
      ids.map((id) => updateM.mutateAsync({ id, dto: { status: "PUBLISHED" } } as any))
    );
  };

  const bulkUnpublish = async () => {
    const ids = sel.list;
    if (!ids.length) return;
    await Promise.allSettled(
      ids.map((id) => updateM.mutateAsync({ id, dto: { status: "DRAFT" } } as any))
    );
  };

  const bulkCancel = async () => {
    const ids = sel.list;
    if (!ids.length) return;
    await Promise.allSettled(
      ids.map((id) => cancelM.mutateAsync({ id, dto: { reason: "Bulk canceled from UI" } } as any))
    );
  };

  return (
    <ScheduleShell
      title="Shifts"
      subtitle="Create, manage, publish, and resolve conflicts across your workforce schedule."
      pill="Scheduling • People • Shifts"
      requiredAnyCapabilities={["portal.schedule"]}
    >
      <div className="space-y-6 pb-8">
        {/* ─── Modern Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
           

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                <span>
                  Conflicts: <strong className="text-amber-700">{overlaps + restViolations}</strong>
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                <span>{rows.length} shifts in view</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border bg-background p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={busy}
                className="h-9 px-3 gap-1.5"
              >
                <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
                Refresh
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfOpen(true)}
                disabled={!rangeOk || busy}
                className="h-9 px-3 gap-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50/50"
              >
                <ShieldAlert className="h-4 w-4" />
                Conflicts ({overlaps + restViolations})
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGenOpen(true)}
                disabled={!rangeOk || busy}
                className="gap-1.5"
              >
                <Wand2 className="h-4 w-4" />
                Generate
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPubOpen(true)}
                disabled={!rangeOk || busy}
                className="gap-1.5"
              >
                <Send className="h-4 w-4" />
                Publish
              </Button>

              <ShiftsExportMenu
                disabled={busy}
                busy={exportBusy}
                onExportPage={exportPage}
                onExportAll={exportAll}
                hint="Export capped at 5,000 rows"
              />

              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                disabled={busy}
                className="gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Shift
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {(overlaps || restViolations) ? (
            <ScheduleBanner tone="warning" title="Conflicts detected">
              Overlaps: <strong>{overlaps}</strong> • Rest violations:{" "}
              <strong>{restViolations}</strong>. Review before publishing.
            </ScheduleBanner>
          ) : null}

          {exportNote ? (
            <ScheduleBanner tone="info" title="Export note">
              {exportNote}
            </ScheduleBanner>
          ) : null}

          {/* Time picker + filters + VIEW TOGGLE */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
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
                
              />

              <ShiftsFilters
                q={q}
                onQ={setQ}
                employeeId={employeeId}
                onEmployeeId={setEmployeeId}
                orgUnitId={orgUnitId}
                onOrgUnitId={setOrgUnitId}
                locationId={locationId}
                onLocationId={setLocationId}
                status={status}
                onStatus={setStatus}
                pageSize={pageSize}
                onPageSize={setPageSize}
                onReset={resetFilters}
              />
            </div>

            {/* ─── VIEW TOGGLE ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v: string) => v && setViewMode(v as ViewMode)}
                className="border rounded-lg bg-background p-1 shadow-sm"
              >
                <ToggleGroupItem
                  value="calendar"
                  aria-label="Calendar view"
                  className="h-9 px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Calendar
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="table"
                  aria-label="Table view"
                  className="h-9 px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </ToggleGroupItem>
              </ToggleGroup>

              <div className="text-xs text-muted-foreground">
                Showing {rows.length} shifts
              </div>
            </div>

            <ShiftsBulkActionBar
              count={sel.count}
              disabled={busy}
              canPublish={true}
              canCancel={true}
              canDelete={false}
              onClear={sel.clear}
              onPublish={async () => {
                await bulkPublish();
                sel.clear();
                await refresh();
              }}
              onUnpublish={async () => {
                await bulkUnpublish();
                sel.clear();
                await refresh();
              }}
              onCancel={async () => {
                await bulkCancel();
                sel.clear();
                await refresh();
              }}
              onDelete={async () => {
                sel.clear();
                await refresh();
              }}
            />

            {rangeOk ? (
              viewMode === "calendar" ? (
                <ShiftsCalendarWeekDnd
                  anchorFromIso={fromIso!}
                  rows={rows}
                  conflictMap={(conflicts as any)?.conflictMap ?? {}}
                  selectedIds={sel.selected}
                  onSelect={(s) => {
                    sel.toggle(String((s as any).id ?? s.id));
                  }}
                  canEdit={true}
                  onMove={async (shiftId, nextStartAt, nextEndAt) => {
                    await updateShiftM.mutateAsync({ id: shiftId, dto: { startAt: nextStartAt, endAt: nextEndAt } } as any);
                    await refresh();
                  }}
                />
              ) : (
                <ShiftsTable
                  rows={rows}
                  meta={meta}
                  page={page}
                  pageSize={pageSize}
                  onPage={setPage}
                  busy={busy}
                  onEdit={(row) => {
                    setActive(row);
                    setEditOpen(true);
                  }}
                  onCancel={(row) => {
                    setActive(row);
                    cancelM.mutateAsync({ id: row.id, dto: { reason: "Canceled from UI" } } as any).then(refresh);
                  }}
                />
              )
            ) : (
              <Card className="rounded-2xl border bg-card shadow-sm">
                <CardContent className="p-12 text-center text-muted-foreground">
                  Select a valid date range to view shifts.
                </CardContent>
              </Card>
            )}

            {listQ.isLoading && !rows.length ? (
              <Card className="rounded-2xl border bg-card shadow-sm">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading shifts…
                </CardContent>
              </Card>
            ) : listQ.isError ? (
              <Card className="rounded-2xl border bg-card shadow-sm">
                <CardContent className="p-8 text-center text-destructive">
                  Failed to load shifts. Please try again.
                </CardContent>
              </Card>
            ) : rows.length === 0 && !listQ.isLoading ? (
              <Card className="rounded-2xl border bg-card shadow-sm">
                <CardContent className="p-12 text-center">
                  <EmptyState
                    title="No shifts found"
                    description="Generate shifts from templates or create one manually."
                    action={
                      <Button onClick={() => setCreateOpen(true)} disabled={busy}>
                        Create Shift
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : null}

            {/* Dialogs */}
            <ShiftCreateEditDialog
              open={createOpen}
              onOpenChange={setCreateOpen}
              mode="create"
              busy={createM.isPending}
              onCreate={async (dto) => {
                await createM.mutateAsync(dto);
                await refresh();
              }}
              onUpdate={async () => {}}
            />

            <ShiftCreateEditDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              mode="edit"
              shift={active}
              busy={updateM.isPending}
              onCreate={async () => {}}
              onUpdate={async (id, dto) => {
                await updateM.mutateAsync({ id, dto });
                await refresh();
              }}
            />

            <GenerateShiftsDialog
              open={genOpen}
              onOpenChange={setGenOpen}
              defaultFrom={fromIso ?? ""}
              defaultTo={toIso ?? ""}
              busy={generateM.isPending}
              onGenerate={async (dto) => {
                await generateM.mutateAsync(dto);
                await refresh();
              }}
            />

            <PublishConfirmDialog
              open={pubOpen}
              onOpenChange={setPubOpen}
              defaultFrom={fromIso ?? ""}
              defaultTo={toIso ?? ""}
              conflicts={(conflicts as any)?.data ?? null}
              busy={publishM.isPending}
              onPublish={async (dto) => {
                await publishM.mutateAsync(dto);
                await refresh();
              }}
            />

            <ConflictsDrawer
              open={confOpen}
              onOpenChange={setConfOpen}
              conflicts={(conflicts as any)?.data ?? null}
              rangeLabel={`${fromIso ?? ""} → ${toIso ?? ""}`}
            />
          </div>
        </div>
      </div>
    </ScheduleShell>
  );
}