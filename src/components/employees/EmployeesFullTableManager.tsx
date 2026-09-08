"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  ShieldCheck,
  RefreshCcw,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Users,
  Building2,
  BriefcaseBusiness,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";

import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";
import { useDebouncedValue } from "@/logaxp/hooks/useDebouncedValue";
import { useHasPermission } from "@/logaxp/hooks/useHasPermission";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { TableSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { toast } from "@/logaxp/components/ui/toast";
import { PermissionGate } from "@/logaxp/components/auth/PermissionGate";
import { StatusBadge } from "@/logaxp/components/ui/status-badge";
import { EmploymentTypeBadge } from "@/logaxp/components/ui/employment-type-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/logaxp/components/ui/dropdown-menu";

import type {
  EmployeeListItem,
  EmployeeStatus,
  EmploymentType,
  ChangeEmployeeStatusDto,
  EmployeeAssignment,
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
  ApiResponse,
  ListData,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

/* ---------------------------------------
 * utils
 * -------------------------------------- */
function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function safeDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString();
}

function human(s?: string | null) {
  if (!s) return "—";
  return String(s).replaceAll("_", " ");
}

function unwrapApi<T>(res: ApiResponse<T> | T): T {
  if (
    res &&
    typeof res === "object" &&
    "data" in (res as Record<string, unknown>) &&
    "statusCode" in (res as Record<string, unknown>)
  ) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

function unwrapList<T>(data: ListData<T> | unknown): { items: T[] } {
  if (!data) return { items: [] };
  if (Array.isArray(data)) return { items: data as T[] };
  if (
    typeof data === "object" &&
    data !== null &&
    "items" in (data as Record<string, unknown>) &&
    Array.isArray((data as { items?: unknown[] }).items)
  ) {
    return { items: ((data as { items?: unknown[] }).items ?? []) as T[] };
  }
  return { items: [] };
}

function fullName(emp?: EmployeeListItem | null) {
  if (!emp) return "—";
  return `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—";
}

function getPrimaryAssignment(emp?: EmployeeListItem | null): EmployeeAssignment | null {
  const withAssignments = emp as EmployeeListItem & {
    assignments?: EmployeeAssignment[];
    primaryAssignment?: EmployeeAssignment | null;
  };

  const assignments = withAssignments.assignments;
  if (Array.isArray(assignments) && assignments.length) {
    return assignments.find((a) => a.isPrimary) ?? assignments[0] ?? null;
  }

  return withAssignments.primaryAssignment ?? null;
}

function getAssignmentLabel(a?: EmployeeAssignment | null) {
  if (!a) return "—";

  const parts = [
    a.orgUnit?.name || null,
    a.position?.title || null,
    a.location?.name || null,
    a.costCenter?.name || null,
  ].filter(Boolean);

  return parts.length ? parts.join(" • ") : "—";
}

function isDeletedEmployee(emp: EmployeeListItem) {
  return Boolean((emp as EmployeeListItem & { deletedAt?: string | null }).deletedAt);
}

function getEmployeeNumber(emp: EmployeeListItem) {
  return String(
    (emp as EmployeeListItem & { employeeNumber?: string | number | null }).employeeNumber ?? "—"
  );
}

function getEmployeeStatus(emp?: EmployeeListItem | null) {
  return (emp as (EmployeeListItem & { status?: EmployeeStatus }) | null | undefined)?.status;
}

function getEmploymentType(emp?: EmployeeListItem | null) {
  return (emp as (EmployeeListItem & { employmentType?: EmploymentType }) | null | undefined)
    ?.employmentType;
}

function getEmployeeWorkEmail(emp: EmployeeListItem) {
  return (emp as EmployeeListItem & { workEmail?: string | null }).workEmail ?? "—";
}

function getEmployeePersonalEmail(emp: EmployeeListItem) {
  return (emp as EmployeeListItem & { personalEmail?: string | null }).personalEmail ?? "—";
}

function getEmployeeWorkPhone(emp: EmployeeListItem) {
  return (emp as EmployeeListItem & { workPhone?: string | null }).workPhone ?? "—";
}

function getEmployeePersonalPhone(emp: EmployeeListItem) {
  return (emp as EmployeeListItem & { personalPhone?: string | null }).personalPhone ?? "—";
}

function getEmployeeHireDate(emp: EmployeeListItem) {
  return (emp as EmployeeListItem & { hireDate?: string | null }).hireDate ?? null;
}

function getEmployeeStartDate(emp: EmployeeListItem) {
  return (emp as EmployeeListItem & { startDate?: string | null }).startDate ?? null;
}

function getPositionLabel(position: Position) {
  return String(position.title ?? position.name ?? "—");
}

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

type EmployeeListPayload = {
  items?: EmployeeListItem[];
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
};

/* ---------------------------------------
 * main
 * -------------------------------------- */
export function EmployeesFullTableManager() {
  const router = useRouter();

  const { employees } = useEmployeeManagement();
  const {
    orgUnits: orgUnitsApi,
    locations: locationsApi,
    positions: positionsApi,
    costCenters: costCentersApi,
  } = useOrgStructure();

  const canRead = useHasPermission("employee.read" as never);
  const canWrite = useHasPermission("employee.write" as never);

  const [rows, setRows] = React.useState<EmployeeListItem[]>([]);
  const [meta, setMeta] = React.useState<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const [initialLoading, setInitialLoading] = React.useState(true);
  const [busyEmployeeId, setBusyEmployeeId] = React.useState<string | null>(null);
  const [busyAction, setBusyAction] = React.useState<BusyAction>(null);

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<EmployeeStatus | "">("");
  const [employmentType, setEmploymentType] = React.useState<EmploymentType | "">("");
  const [orgUnitId, setOrgUnitId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [positionId, setPositionId] = React.useState("");
  const [costCenterId, setCostCenterId] = React.useState("");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(30);

  const [orgUnits, setOrgUnits] = React.useState<OrgUnit[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([]);

  const [removeTarget, setRemoveTarget] = React.useState<EmployeeListItem | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<EmployeeListItem | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<EmployeeListItem | null>(null);

  const debouncedQ = useDebouncedValue(q, 250);
  const busyAny = Boolean(busyAction);

  React.useEffect(() => {
    setPage(1);
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

        const res = await employees.list(queryObj as never);
        const data = unwrapApi(res) as EmployeeListPayload;

        const items = Array.isArray(data?.items) ? data.items : [];
        const m = data?.meta ?? null;

        setRows(items);

        if (m && typeof m === "object") {
          setMeta({
            page: Number(m.page ?? page),
            pageSize: Number(m.pageSize ?? pageSize),
            total: Number(m.total ?? items.length),
            totalPages: Number(m.totalPages ?? 1),
          });
        } else {
          const p = Number(data?.page ?? page);
          const ps = Number(data?.pageSize ?? pageSize);
          const total = Number(data?.total ?? items.length);
          const totalPages = Math.max(1, Math.ceil(total / Math.max(1, ps)));
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

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

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

  const total = meta?.total ?? rows.length;
  const totalPages = meta?.totalPages ?? 1;

  const activeFilterCount = [
    status,
    employmentType,
    orgUnitId,
    locationId,
    positionId,
    costCenterId,
    includeDeleted ? "includeDeleted" : "",
    q.trim(),
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Premium Header / Control Surface */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="flex flex-col gap-5 p-5 md:p-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Users className="h-3.5 w-3.5" />
              Employee Directory
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Employee Full Table
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                Dense enterprise view for workforce records, advanced filtering, status updates,
                restore flows, and fast row-level actions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {initialLoading ? "Loading…" : `${total} total employees`}
            </Badge>

            {includeDeleted ? (
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Including deleted
              </Badge>
            ) : null}

            {activeFilterCount > 0 ? (
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
              </Badge>
            ) : null}

            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              disabled={busyAny}
              className="gap-2 rounded-xl"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide filters" : "Show filters"}
            </Button>

            <Button
              variant="outline"
              onClick={() => void load()}
              disabled={busyAny}
              className="gap-2 rounded-xl"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>

            <PermissionGate permission="employee.write">
              <Button
                onClick={() => router.push("/portal/employees/new")}
                disabled={busyAny}
                className="gap-2 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Add employee
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-white/70 p-4 md:grid-cols-3 md:p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <MetricCard
            icon={<Users className="h-4 w-4" />}
            label="Visible Rows"
            value={String(rows.length)}
          />
          <MetricCard
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            label="Page"
            value={`${page} / ${Math.max(1, totalPages)}`}
          />
          <MetricCard
            icon={<Building2 className="h-4 w-4" />}
            label="Org Filters Loaded"
            value={String(orgUnits.length + locations.length + positions.length + costCenters.length)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[430px_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, employee #..."
              className="h-11 rounded-xl pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 text-xs text-slate-500 xl:justify-end dark:text-slate-400">
            <span>{rows.length} visible row{rows.length === 1 ? "" : "s"}</span>
            <span>•</span>
            <span>{total} total</span>
            <span>•</span>
            <span>Page {page} of {Math.max(1, totalPages)}</span>
          </div>
        </div>

        {showFilters ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <DenseSelect
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as EmployeeStatus | "")}
              disabled={busyAny}
            >
              <option value="">All</option>
              {EMPLOYEE_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {human(s)}
                </option>
              ))}
            </DenseSelect>

            <DenseSelect
              label="Employment"
              value={employmentType}
              onChange={(v) => setEmploymentType(v as EmploymentType | "")}
              disabled={busyAny}
            >
              <option value="">All</option>
              {EMPLOYMENT_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>
                  {human(t)}
                </option>
              ))}
            </DenseSelect>

            <DenseSelect
              label="Org Unit"
              value={orgUnitId}
              onChange={setOrgUnitId}
              disabled={busyAny}
              icon={<Building2 className="h-3.5 w-3.5" />}
            >
              <option value="">All</option>
              {orgUnits.map((x) => (
                <option key={x.id} value={x.id}>
                  {String(x.name ?? "—")}
                </option>
              ))}
            </DenseSelect>

            <DenseSelect
              label="Location"
              value={locationId}
              onChange={setLocationId}
              disabled={busyAny}
              icon={<Landmark className="h-3.5 w-3.5" />}
            >
              <option value="">All</option>
              {locations.map((x) => (
                <option key={x.id} value={x.id}>
                  {String(x.name ?? "—")}
                </option>
              ))}
            </DenseSelect>

            <DenseSelect
              label="Position"
              value={positionId}
              onChange={setPositionId}
              disabled={busyAny}
              icon={<BriefcaseBusiness className="h-3.5 w-3.5" />}
            >
              <option value="">All</option>
              {positions.map((x) => (
                <option key={x.id} value={x.id}>
                  {getPositionLabel(x)}
                </option>
              ))}
            </DenseSelect>

            <DenseSelect
              label="Cost Center"
              value={costCenterId}
              onChange={setCostCenterId}
              disabled={busyAny}
              icon={<Landmark className="h-3.5 w-3.5" />}
            >
              <option value="">All</option>
              {costCenters.map((x) => (
                <option key={x.id} value={x.id}>
                  {String(x.name ?? "—")}
                </option>
              ))}
            </DenseSelect>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="h-4 w-4 rounded"
              disabled={busyAny}
            />
            Include deleted employees
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={busyAny || activeFilterCount === 0}
              onClick={() => {
                setQ("");
                setStatus("");
                setEmploymentType("");
                setOrgUnitId("");
                setLocationId("");
                setPositionId("");
                setCostCenterId("");
                setIncludeDeleted(false);
                setPage(1);
              }}
              className="rounded-xl"
            >
              Clear filters
            </Button>

            <span className="text-sm text-slate-600 dark:text-slate-300">Page size</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              disabled={busyAny}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
            >
              {[20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              disabled={busyAny || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-2 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>

            <Badge variant="secondary" className="h-10 rounded-xl px-3">
              {page} / {Math.max(1, totalPages)}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              disabled={busyAny || page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-2 rounded-xl"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {!canRead ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <EmptyState
            title="No access"
            description="You do not have permission to view employee records."
          />
        </div>
      ) : initialLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <TableSkeleton rows={8} cols={8} />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <EmptyState
            title={q.trim() ? "No matches found" : "No employees found"}
            description={
              q.trim()
                ? "Try a different search term or broaden your filters."
                : "There are no employee rows for the current filter set."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="max-h-[72vh] overflow-auto">
            <table className="w-full min-w-[1540px] border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur dark:bg-slate-900/95">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold dark:border-slate-800">
                    Employee
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold dark:border-slate-800">
                    Status
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold dark:border-slate-800">
                    Employment
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold dark:border-slate-800">
                    Emails
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold dark:border-slate-800">
                    Phones
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold dark:border-slate-800">
                    Primary Assignment
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold dark:border-slate-800">
                    Hire / Start
                  </th>
                  <th className="w-[92px] border-b border-slate-200 px-4 py-3 text-right font-semibold dark:border-slate-800">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((emp) => {
                  const deleted = isDeletedEmployee(emp);
                  const primary = getPrimaryAssignment(emp);
                  const busy = busyEmployeeId === emp.id;

                  return (
                    <tr
                      key={emp.id}
                      className={cn(
                        "align-top transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40",
                        deleted && "opacity-70"
                      )}
                    >
                      <td className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate font-semibold text-slate-900 dark:text-slate-50">
                              {fullName(emp)}
                            </div>
                            {deleted ? (
                              <Badge variant="outline" className="rounded-full text-[10px]">
                                Deleted
                              </Badge>
                            ) : null}
                          </div>

                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            #{getEmployeeNumber(emp)}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            ID: {emp.id}
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <StatusBadge status={getEmployeeStatus(emp)} deleted={deleted} />
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <EmploymentTypeBadge type={getEmploymentType(emp)} />
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <div className="space-y-1">
                          <div className="text-slate-900 dark:text-slate-50">
                            {getEmployeeWorkEmail(emp)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {getEmployeePersonalEmail(emp)}
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <div className="space-y-1">
                          <div>{getEmployeeWorkPhone(emp)}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {getEmployeePersonalPhone(emp)}
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <div className="max-w-[320px]">
                          <div className="truncate text-slate-900 dark:text-slate-50">
                            {getAssignmentLabel(primary)}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {primary?.isPrimary ? "Primary assignment" : "—"}
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <div className="space-y-1">
                          <div>Hire: {safeDate(getEmployeeHireDate(emp))}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Start: {safeDate(getEmployeeStartDate(emp))}
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 text-right dark:border-slate-800">
                        <div className="flex justify-end">
                          <EmployeeRowActions
                            employee={emp}
                            deleted={deleted}
                            busy={busy}
                            busyAny={busyAny}
                            canWrite={canWrite}
                            onView={() => router.push(`/portal/employees/${emp.id}`)}
                            onEdit={() => router.push(`/portal/employees/${emp.id}/edit`)}
                            onManageAccess={() => router.push(`/portal/employees/${emp.id}/access`)}
                            onChangeStatus={() => setStatusTarget(emp)}
                            onDelete={() => setRemoveTarget(emp)}
                            onRestore={() => setRestoreTarget(emp)}
                          />
                        </div>

                        {busy ? (
                          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                            Working...
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Delete employee"
        description={`This will soft-delete ${removeTarget ? fullName(removeTarget) : "this employee"}.`}
        confirmText="Confirm delete"
        destructive
        busyAny={busyAny}
        onConfirm={remove}
      />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        onOpenChange={(o) => !o && setRestoreTarget(null)}
        title="Restore employee"
        description={`Restore ${restoreTarget ? fullName(restoreTarget) : "this employee"} back to active records.`}
        confirmText="Restore"
        busyAny={busyAny}
        onConfirm={restore}
      />

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
 * metric card
 * -------------------------------------- */
function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">{value}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------
 * row actions dropdown
 * -------------------------------------- */
function EmployeeRowActions({
  employee,
  deleted,
  busy,
  busyAny,
  canWrite,
  onView,
  onEdit,
  onManageAccess,
  onChangeStatus,
  onDelete,
  onRestore,
}: {
  employee: EmployeeListItem;
  deleted: boolean;
  busy: boolean;
  busyAny: boolean;
  canWrite: boolean;
  onView: () => void;
  onEdit: () => void;
  onManageAccess: () => void;
  onChangeStatus: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          disabled={busyAny}
          className="h-9 w-9 rounded-xl"
          aria-label={`Open actions for ${fullName(employee)}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel className="truncate">
          {fullName(employee)}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onView} className="gap-2">
          <Eye className="h-4 w-4" />
          View details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onManageAccess} className="gap-2">
          <Mail className="h-4 w-4" />
          Manage access
        </DropdownMenuItem>

        {canWrite ? (
          <>
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit employee
            </DropdownMenuItem>

            {!deleted ? (
              <DropdownMenuItem onClick={onChangeStatus} className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Change status
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuSeparator />

            {deleted ? (
              <DropdownMenuItem
                onClick={onRestore}
                className="gap-2 text-emerald-600 focus:text-emerald-700"
              >
                <RotateCcw className="h-4 w-4" />
                Restore employee
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 text-red-600 focus:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete employee
              </DropdownMenuItem>
            )}
          </>
        ) : null}

        {busy ? (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-slate-500">Working...</div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ---------------------------------------
 * dense filter select
 * -------------------------------------- */
function DenseSelect({
  label,
  value,
  onChange,
  children,
  disabled,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </label>
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

/* ---------------------------------------
 * confirm dialog
 * -------------------------------------- */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  destructive,
  busyAny,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  destructive?: boolean;
  busyAny: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => void onConfirm()}
            disabled={busyAny}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------
 * status dialog
 * -------------------------------------- */
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
  const current = React.useMemo(
    () => (String(getEmployeeStatus(employee) ?? "ACTIVE") as EmployeeStatus),
    [employee]
    );

  const [status, setStatus] = React.useState<EmployeeStatus>(current);
  const [terminationDate, setTerminationDate] = React.useState("");
  const [terminationReason, setTerminationReason] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const cur = String(getEmployeeStatus(employee) ?? "ACTIVE") as EmployeeStatus;
    setStatus(cur);
    setTerminationDate("");
    setTerminationReason("");
  }, [open, employee]);

  const needsTermination = status === "TERMINATED";
  const canSave = !busyAny && (!needsTermination || Boolean(terminationDate.trim()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Change employee status</DialogTitle>
          <DialogDescription>
            Update status for{" "}
            <span className="font-semibold">
              {employee ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() : "employee"}
            </span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <DenseSelect
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as EmployeeStatus)}
          >
            {EMPLOYEE_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {human(s)}
              </option>
            ))}
          </DenseSelect>

          {needsTermination ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Termination date *
                </label>
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                />
                <div className="text-[11px] text-slate-500">Required when terminating.</div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Reason (optional)
                </label>
                <Input
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  placeholder="e.g. Resignation"
                />
              </div>
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
                ...(needsTermination
                  ? { terminationDate, terminationReason: terminationReason || undefined }
                  : {}),
              })
            }
            disabled={!canSave}
            className="gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}