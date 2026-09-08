"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  RefreshCcw,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Mail,
} from "lucide-react";

import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";
import { useDebouncedValue } from "@/logaxp/hooks/useDebouncedValue";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { toast } from "@/logaxp/components/ui/toast";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { TableSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";

import { StatusBadge } from "@/logaxp/components/ui/status-badge";
import { EmploymentTypeBadge } from "@/logaxp/components/ui/employment-type-badge";

// same pattern as LocationsPage
import { PermissionGate } from "@/logaxp/components/auth/PermissionGate";
import { useHasPermission } from "@/logaxp/hooks/useHasPermission";

import type {
  EmployeeListItem,
  EmployeeStatus,
  EmploymentType,
  EmployeeAssignment,
  ChangeEmployeeStatusDto,
} from "@/logaxp/lib/employee-management/employee-management.types";
import {
  EMPLOYEE_STATUS_VALUES,
  EMPLOYMENT_TYPE_VALUES,
} from "@/logaxp/lib/employee-management/employee-management.types";

import type {
  OrgUnit,
  Location,
  Position,
  CostCenter,
  ListData,
  ApiResponse,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

/* ---------------------------------------
 * tiny utils
 * -------------------------------------- */
function safeIso(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function unwrapApi<T>(res: ApiResponse<T> | T): T {
  if (res && typeof res === "object" && "data" in (res as any) && "statusCode" in (res as any)) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

function unwrapList<T>(data: ListData<T> | any): { items: T[] } {
  if (!data) return { items: [] };
  if (Array.isArray(data)) return { items: data as T[] };
  if (typeof data === "object" && Array.isArray((data as any).items)) return { items: (data as any).items as T[] };
  return { items: [] };
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

function humanStatus(s?: string | null) {
  if (!s) return "—";
  return String(s).replaceAll("_", " ");
}

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

/* ---------------------------------------
 * types
 * -------------------------------------- */
type BusyAction = "refresh" | "delete" | "restore" | "status" | null;

type EmployeeListQuery = {
  q?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;

  orgUnitId?: string;
  locationId?: string;
  positionId?: string;
  costCenterId?: string;

  includeDeleted?: boolean;

  page?: number;
  pageSize?: number;
};

/* ---------------------------------------
 * main
 * -------------------------------------- */
export function EmployeesManager() {
  const router = useRouter();

  const { employees } = useEmployeeManagement();
  const { orgUnits: orgUnitsApi, locations: locationsApi, positions: positionsApi, costCenters: costCentersApi } =
    useOrgStructure();

  // permissions (same style as LocationsPage)
  const canRead = useHasPermission("employee.read" as any);
  const canWrite = useHasPermission("employee.write" as any);

  const [rows, setRows] = React.useState<EmployeeListItem[]>([]);
  const [meta, setMeta] = React.useState<{ page: number; pageSize: number; total: number; totalPages: number } | null>(null);

  const [initialLoading, setInitialLoading] = React.useState(true);

  const [busyEmployeeId, setBusyEmployeeId] = React.useState<string | null>(null);
  const [busyAction, setBusyAction] = React.useState<BusyAction>(null);

  // filters
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<EmployeeStatus | "">("");
  const [employmentType, setEmploymentType] = React.useState<EmploymentType | "">("");

  const [orgUnitId, setOrgUnitId] = React.useState<string>("");
  const [locationId, setLocationId] = React.useState<string>("");
  const [positionId, setPositionId] = React.useState<string>("");
  const [costCenterId, setCostCenterId] = React.useState<string>("");

  const [includeDeleted, setIncludeDeleted] = React.useState(false);

  // pagination
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // lookups (for filters)
  const [orgUnits, setOrgUnits] = React.useState<OrgUnit[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([]);

  // dialogs
  const [removeTarget, setRemoveTarget] = React.useState<EmployeeListItem | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<EmployeeListItem | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<EmployeeListItem | null>(null);

  const busyAny = Boolean(busyAction);
  const rowBusy = (id: string) => busyEmployeeId === id;

  // debounced search
  const debouncedQ = useDebouncedValue(q, 250);

  // reset page when filters change (except page itself)
  React.useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, status, employmentType, orgUnitId, locationId, positionId, costCenterId, includeDeleted, pageSize]);

  const queryObj: EmployeeListQuery = React.useMemo(
    () => ({
      q: debouncedQ.trim() ? debouncedQ.trim() : undefined,
      status: status || undefined,
      employmentType: employmentType || undefined,

      orgUnitId: orgUnitId || undefined,
      locationId: locationId || undefined,
      positionId: positionId || undefined,
      costCenterId: costCenterId || undefined,

      includeDeleted,
      page,
      pageSize,
    }),
    [debouncedQ, status, employmentType, orgUnitId, locationId, positionId, costCenterId, includeDeleted, page, pageSize]
  );

  // load org lookups (best-effort)
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [ou, lo, po, cc] = await Promise.all([
          orgUnitsApi.list({ includeDeleted: false }),
          locationsApi.list({ includeDeleted: false }),
          positionsApi.list({ includeDeleted: false }),
          costCentersApi.list({ includeDeleted: false }),
        ]);

        const ouItems = unwrapList<OrgUnit>(unwrapApi(ou)).items;
        const loItems = unwrapList<Location>(unwrapApi(lo)).items;
        const poItems = unwrapList<Position>(unwrapApi(po)).items;
        const ccItems = unwrapList<CostCenter>(unwrapApi(cc)).items;

        if (!mounted) return;

        setOrgUnits(ouItems);
        setLocations(loItems);
        setPositions(poItems);
        setCostCenters(ccItems);
      } catch (e) {
        console.warn("Org structure lookups failed", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orgUnitsApi, locationsApi, positionsApi, costCentersApi]);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!canRead) {
        setRows([]);
        setMeta({ page: 1, pageSize, total: 0, totalPages: 1 });
        setInitialLoading(false);
        return;
      }

      try {
        setBusyAction("refresh");

        const res = await employees.list(queryObj as any);
        const data = unwrapApi(res);

        // preferred backend shape: { items, page, pageSize, total } OR { items, meta }
        const items = Array.isArray((data as any)?.items) ? ((data as any).items as EmployeeListItem[]) : [];
        const m = (data as any)?.meta ?? null;

        setRows(items);

        if (m && typeof m === "object") {
          setMeta({
            page: Number(m.page ?? page),
            pageSize: Number(m.pageSize ?? pageSize),
            total: Number(m.total ?? items.length),
            totalPages: Number(m.totalPages ?? 1),
          });
        } else {
          // if service returns { page, pageSize, total, items }
          const p = Number((data as any)?.page ?? page);
          const ps = Number((data as any)?.pageSize ?? pageSize);
          const total = Number((data as any)?.total ?? items.length);
          const totalPages = Math.max(1, Math.ceil(total / ps));

          setMeta({ page: p, pageSize: ps, total, totalPages });
        }
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load employees");
      } finally {
        setInitialLoading(false);
        setBusyAction(null);
      }
    },
    [canRead, employees, queryObj, page, pageSize]
  );

  // reload whenever query changes
  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  const confirmRemove = (emp: EmployeeListItem) => setRemoveTarget(emp);
  const confirmRestore = (emp: EmployeeListItem) => setRestoreTarget(emp);
  const openStatus = (emp: EmployeeListItem) => setStatusTarget(emp);

  const remove = async () => {
    const emp = removeTarget;
    if (!emp?.id) return;

    try {
      setBusyEmployeeId(emp.id);
      setBusyAction("delete");
      await employees.softDelete(emp.id);
      toast.success("Employee deleted");
      setRemoveTarget(null);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete employee");
    } finally {
      setBusyEmployeeId(null);
      setBusyAction(null);
    }
  };

  const restore = async () => {
    const emp = restoreTarget;
    if (!emp?.id) return;

    try {
      setBusyEmployeeId(emp.id);
      setBusyAction("restore");
      await employees.restore(emp.id);
      toast.success("Employee restored");
      setRestoreTarget(null);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to restore employee");
    } finally {
      setBusyEmployeeId(null);
      setBusyAction(null);
    }
  };

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? rows.length;
  const showingDeleted = Boolean(includeDeleted);

  return (
    <div className="space-y-5">
      {/* Top shell header (Locations-style) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Search, filter, and manage employees across your organization.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {initialLoading ? "Loading…" : `${total} employee${total === 1 ? "" : "s"}`}
            </Badge>
            {showingDeleted ? (
              <Badge variant="outline" className="rounded-full">
                Including deleted
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>

            <PermissionGate permission="employee.write">
              <Button onClick={() => router.push("/portal/employees/new")} disabled={busyAny} className="gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Add employee
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Main content card (Locations-style) */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-base">Directory</CardTitle>
              <CardDescription>Review employee records, statuses, and assignments.</CardDescription>
            </div>

            {/* Quick search (synced to q) */}
            <div className="w-full md:w-[360px]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search employees…"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Tip: try name, email, or employee #</span>
                <button
                  type="button"
                  className="hover:text-slate-700 dark:hover:text-slate-200"
                  onClick={() => setQ("")}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-6">
          {/* Full filter bar (like LocationsFiltersBar container) */}
          <div className="rounded-xl border bg-white p-3 md:p-4 dark:border-slate-800 dark:bg-slate-950">
            <EmployeesFiltersBar
              status={status}
              onStatus={setStatus}
              employmentType={employmentType}
              onEmploymentType={setEmploymentType}
              orgUnitId={orgUnitId}
              onOrgUnitId={setOrgUnitId}
              locationId={locationId}
              onLocationId={setLocationId}
              positionId={positionId}
              onPositionId={setPositionId}
              costCenterId={costCenterId}
              onCostCenterId={setCostCenterId}
              includeDeleted={includeDeleted}
              onIncludeDeleted={setIncludeDeleted}
              pageSize={pageSize}
              onPageSize={setPageSize}
              orgUnits={orgUnits}
              locations={locations}
              positions={positions}
              costCenters={costCenters}
              disabled={busyAny}
            />
          </div>

          {!canRead ? (
            <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <EmptyState title="No access" description="You don't have permission to view employees." />
            </div>
          ) : initialLoading ? (
            <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <TableSkeleton rows={5} cols={7} />
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <EmptyState
                title={q.trim() ? "No matches" : "No employees yet"}
                description={
                  q.trim()
                    ? "Try a different search term or clear the search."
                    : "Add your first employee to start managing workforce records."
                }
                action={
                  canWrite ? (
                    <Button onClick={() => router.push("/portal/employees/new")}>Add employee</Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              {/* Pagination strip (Locations-like lightweight status row) */}
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <div>
                  Showing <span className="font-semibold">{rows.length}</span> of{" "}
                  <span className="font-semibold">{total}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyAny || page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Badge variant="muted" className="h-8 px-3">
                    Page {page} / {Math.max(1, totalPages)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyAny || page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Table container (exact style as LocationsPage) */}
              <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Employment</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Primary Assignment</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {rows.map((emp) => {
                        const busy = rowBusy(emp.id);
                        const deleted = Boolean((emp as any)?.deletedAt);

                        const fullName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—";
                        const employeeNumber = (emp as any)?.employeeNumber ? String((emp as any).employeeNumber) : null;

                        const primary = (emp as any)?.primaryAssignment ?? null;

                        return (
                          <TableRow key={emp.id} className={cn(deleted && "opacity-70")}>
                            <TableCell>
                              <div className="min-w-0">
                                <div className="font-semibold truncate">{fullName}</div>
                                <div className="text-xs text-slate-500 truncate">
                                  {employeeNumber ? `#${employeeNumber}` : "—"}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <StatusBadge status={(emp as any)?.status} deleted={deleted} />
                            </TableCell>

                            <TableCell>
                              <EmploymentTypeBadge type={(emp as any)?.employmentType} />
                            </TableCell>

                            <TableCell className="truncate">
                              <span className="text-sm">{(emp as any)?.workEmail ?? (emp as any)?.personalEmail ?? "—"}</span>
                            </TableCell>

                            <TableCell className="truncate">
                              <span className="text-sm">{getPrimaryAssignmentLabel(primary)}</span>
                            </TableCell>

                            <TableCell>
                              {safeIso(((emp as any)?.updatedAt ?? (emp as any)?.createdAt) as string | null | undefined)}
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/portal/employees/${emp.id}`)}
                                  disabled={busyAny}
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>

                                <PermissionGate permission="employee.write">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.push(`/portal/employees/${emp.id}/edit`)}
                                    disabled={busyAny}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.push(`/portal/employees/${emp.id}/access`)}
                                    disabled={busyAny}
                                    title="Manage access"
                                  >
                                    <Mail className="h-4 w-4" />
                                    Access
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openStatus(emp)}
                                    disabled={busyAny || deleted}
                                    loading={busy && busyAction === "status"}
                                    title={deleted ? "Restore to update status" : "Change status"}
                                  >
                                    <ShieldCheck className="h-4 w-4" />
                                    Status
                                  </Button>

                                  {deleted ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => confirmRestore(emp)}
                                      disabled={busyAny}
                                      loading={busy && busyAction === "restore"}
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                      Restore
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => confirmRemove(emp)}
                                      disabled={busyAny}
                                      loading={busy && busyAction === "delete"}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </Button>
                                  )}
                                </PermissionGate>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableWrapper>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm */}
      <Dialog open={Boolean(removeTarget)} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete employee</DialogTitle>
            <DialogDescription>
              This will soft-delete{" "}
              <span className="font-semibold">
                {removeTarget ? `${removeTarget.firstName} ${removeTarget.lastName}` : "this employee"}
              </span>
              . You can restore later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={busyAny}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void remove()} loading={busyAction === "delete"}>
              Confirm delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore confirm */}
      <Dialog open={Boolean(restoreTarget)} onOpenChange={(o) => !o && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore employee</DialogTitle>
            <DialogDescription>
              Restore{" "}
              <span className="font-semibold">
                {restoreTarget ? `${restoreTarget.firstName} ${restoreTarget.lastName}` : "this employee"}
              </span>{" "}
              back to active records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)} disabled={busyAny}>
              Cancel
            </Button>
            <Button onClick={() => void restore()} loading={busyAction === "restore"}>
              <RotateCcw className="h-4 w-4" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change status dialog (your existing dialog kept) */}
      <EmployeeChangeStatusDialog
        open={Boolean(statusTarget)}
        onOpenChange={(o) => !o && setStatusTarget(null)}
        employee={statusTarget}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          const emp = statusTarget;
          if (!emp?.id) return;

          try {
            setBusyEmployeeId(emp.id);
            setBusyAction("status");

            await employees.changeStatus(emp.id, dto);

            toast.success("Status updated");
            setStatusTarget(null);
            await load({ silent: true });
          } catch (e) {
            console.error(e);
            toast.error("Failed to update status");
          } finally {
            setBusyEmployeeId(null);
            setBusyAction(null);
          }
        }}
      />
    </div>
  );
}

/* ---------------------------------------
 * Filters Bar (Locations-style container)
 * -------------------------------------- */
function EmployeesFiltersBar(props: {
  status: EmployeeStatus | "";
  onStatus: (v: EmployeeStatus | "") => void;

  employmentType: EmploymentType | "";
  onEmploymentType: (v: EmploymentType | "") => void;

  orgUnitId: string;
  onOrgUnitId: (v: string) => void;

  locationId: string;
  onLocationId: (v: string) => void;

  positionId: string;
  onPositionId: (v: string) => void;

  costCenterId: string;
  onCostCenterId: (v: string) => void;

  includeDeleted: boolean;
  onIncludeDeleted: (v: boolean) => void;

  pageSize: number;
  onPageSize: (v: number) => void;

  orgUnits: OrgUnit[];
  locations: Location[];
  positions: Position[];
  costCenters: CostCenter[];

  disabled?: boolean;
}) {
  const {
    status,
    onStatus,
    employmentType,
    onEmploymentType,
    orgUnitId,
    onOrgUnitId,
    locationId,
    onLocationId,
    positionId,
    onPositionId,
    costCenterId,
    onCostCenterId,
    includeDeleted,
    onIncludeDeleted,
    pageSize,
    onPageSize,
    orgUnits,
    locations,
    positions,
    costCenters,
    disabled,
  } = props;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SelectField label="Status" value={status} onChange={(v) => onStatus(v as any)} disabled={disabled}>
          <option value="">All</option>
          {EMPLOYEE_STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {humanStatus(s)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Employment"
          value={employmentType}
          onChange={(v) => onEmploymentType(v as any)}
          disabled={disabled}
        >
          <option value="">All</option>
          {EMPLOYMENT_TYPE_VALUES.map((t) => (
            <option key={t} value={t}>
              {humanStatus(t)}
            </option>
          ))}
        </SelectField>

        <SelectField label="Org Unit" value={orgUnitId} onChange={onOrgUnitId} disabled={disabled}>
          <option value="">All</option>
          {orgUnits.map((x) => (
            <option key={x.id} value={x.id}>
              {String(x.name ?? "—")}
            </option>
          ))}
        </SelectField>

        <SelectField label="Location" value={locationId} onChange={onLocationId} disabled={disabled}>
          <option value="">All</option>
          {locations.map((x) => (
            <option key={x.id} value={x.id}>
              {String(x.name ?? "—")}
            </option>
          ))}
        </SelectField>

        <SelectField label="Position" value={positionId} onChange={onPositionId} disabled={disabled}>
          <option value="">All</option>
          {positions.map((x) => (
            <option key={x.id} value={x.id}>
              {String((x as any).title ?? (x as any).name ?? "—")}
            </option>
          ))}
        </SelectField>

        <SelectField label="Cost Center" value={costCenterId} onChange={onCostCenterId} disabled={disabled}>
          <option value="">All</option>
          {costCenters.map((x) => (
            <option key={x.id} value={x.id}>
              {String(x.name ?? "—")}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => onIncludeDeleted(e.target.checked)}
            className="h-4 w-4 rounded"
            disabled={disabled}
          />
          Include deleted
        </label>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="hidden sm:inline">Page size</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            disabled={disabled}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------
 * tiny reusable bits
 * -------------------------------------- */
function SelectField({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
      >
        {children}
      </select>
    </div>
  );
}

function EmployeeChangeStatusDialog({
  open,
  onOpenChange,
  employee,
  busyAny,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeListItem | null;
  busyAny: boolean;
  onSubmit: (dto: ChangeEmployeeStatusDto) => Promise<void> | void;
}) {
  const current = String((employee as any)?.status ?? "ACTIVE") as EmployeeStatus;

  const [status, setStatus] = React.useState<EmployeeStatus>(current);
  const [terminationDate, setTerminationDate] = React.useState("");
  const [terminationReason, setTerminationReason] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    const cur = String((employee as any)?.status ?? "ACTIVE") as EmployeeStatus;
    setStatus(cur);
    setTerminationDate("");
    setTerminationReason("");
  }, [open, employee]);

  const needsTermination = status === "TERMINATED";
  const canSave = !busyAny && (!needsTermination || Boolean(terminationDate.trim()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Change employee status</DialogTitle>
          <DialogDescription>
            Update status for{" "}
            <span className="font-semibold">
              {employee ? `${employee.firstName} ${employee.lastName}` : "employee"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <SelectField label="Status" value={status} onChange={(v) => setStatus(v as EmployeeStatus)}>
            {EMPLOYEE_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {humanStatus(s)}
              </option>
            ))}
          </SelectField>

          {needsTermination ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Termination date *</label>
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                />
                <div className="text-[11px] text-slate-500">Required when terminating.</div>
              </div>

              <Input
                label="Reason (optional)"
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                placeholder="e.g. Resignation"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              void onSubmit({
                status,
                ...(needsTermination ? { terminationDate, terminationReason: terminationReason || undefined } : {}),
              })
            }
            disabled={!canSave}
          >
            <ShieldCheck className="h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}