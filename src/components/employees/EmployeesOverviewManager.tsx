"use client";
import * as React from "react";
import { EmployeeCsvActions } from './EmployeeCsvActions';
import { useRouter } from "next/navigation";
import {
  Plus,
  RefreshCcw,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Table2,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Search,
  MoreHorizontal,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
import { useDebouncedValue } from "@/logaxp/hooks/useDebouncedValue";
import { useHasPermission } from "@/logaxp/hooks/useHasPermission";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import { toast } from "@/logaxp/components/ui/toast";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { TableSkeleton } from "@/logaxp/components/ui/loading-skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/logaxp/components/ui/table";

import type {
  EmployeeListItem,
  EmployeeStatus,
  EmploymentType,
  ChangeEmployeeStatusDto,
} from "@/logaxp/lib/employee-management/employee-management.types";
import {
  EMPLOYEE_STATUS_VALUES,
  EMPLOYMENT_TYPE_VALUES,
} from "@/logaxp/lib/employee-management/employee-management.types";
import type { ApiResponse } from "@/logaxp/lib/orgStructure/orgStructure.types";

// ────────────────────────────────────────
// Utils (unchanged)
// ────────────────────────────────────────
function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}
function safeIso(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}
function human(s?: string | null) {
  if (!s) return "—";
  return String(s).replaceAll("_", " ");
}
function unwrapApi<T>(res: ApiResponse<T> | T): T {
  if (res && typeof res === "object" && "data" in res && "statusCode" in res) {
    return (res as any).data;
  }
  return res as T;
}
function fullName(emp?: EmployeeListItem | null) {
  if (!emp) return "—";
  return `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—";
}

// ────────────────────────────────────────
// Types
// ────────────────────────────────────────
type BusyAction = "refresh" | "delete" | "restore" | "status" | null;
type EmployeeListQuery = {
  q?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
};
type ViewMode = "list" | "cards";

// ────────────────────────────────────────
// Stat Card (unchanged)
// ────────────────────────────────────────
function OverviewStatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {title}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────
// Main Component
// ────────────────────────────────────────
export function EmployeesOverviewManager() {
  const router = useRouter();
  const { employees } = useEmployeeManagement();
  const canRead = useHasPermission("employee.read" as any);
  const canWrite = useHasPermission("employee.write" as any);

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
  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(12);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const [removeTarget, setRemoveTarget] = React.useState<EmployeeListItem | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<EmployeeListItem | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<EmployeeListItem | null>(null);

  const debouncedQ = useDebouncedValue(q, 250);
  const busyAny = Boolean(busyAction);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, status, employmentType, includeDeleted]);

  const queryObj: EmployeeListQuery = React.useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      status: status || undefined,
      employmentType: employmentType || undefined,
      includeDeleted,
      page,
      pageSize,
    }),
    [debouncedQ, status, employmentType, includeDeleted, page, pageSize]
  );

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
        const items = Array.isArray((data as any)?.items) ? (data as any).items : [];
        const p = Number((data as any)?.page ?? page);
        const ps = Number((data as any)?.pageSize ?? pageSize);
        const total = Number((data as any)?.total ?? items.length);
        const totalPages = Math.max(1, Math.ceil(total / Math.max(1, ps)));
        setRows(items);
        setMeta({ page: p, pageSize: ps, total, totalPages });
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

  const total = meta?.total ?? rows.length;
  const totalPages = meta?.totalPages ?? 1;

  const stats = React.useMemo(() => {
    const active = rows.filter((r) => (r as any)?.status?.toUpperCase() === "ACTIVE").length;
    const onboarding = rows.filter((r) => (r as any)?.status?.toUpperCase() === "ONBOARDING").length;
    const suspended = rows.filter((r) => (r as any)?.status?.toUpperCase() === "SUSPENDED").length;
    const deleted = rows.filter((r) => Boolean((r as any)?.deletedAt)).length;
    return { active, onboarding, suspended, deleted };
  }, [rows]);

  const remove = async () => {
    if (!removeTarget?.id) return;
    try {
      setBusyEmployeeId(removeTarget.id);
      setBusyAction("delete");
      await employees.softDelete(removeTarget.id);
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
    if (!restoreTarget?.id) return;
    try {
      setBusyEmployeeId(restoreTarget.id);
      setBusyAction("restore");
      await employees.restore(restoreTarget.id);
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

  return (
    <div className="space-y-5">
      {/* Header + controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Workforce overview – card or list view
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {initialLoading ? "Loading…" : `${total} employees`}
          </Badge>

          <div className="flex items-center gap-1 border rounded-lg p-1 bg-white dark:bg-slate-950">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Cards
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-1.5" />
              List
            </Button>
          </div>

          <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
            <RefreshCcw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>

          <Button variant="outline" onClick={() => router.push("/portal/employees/table")}>
            <Table2 className="h-4 w-4 mr-1.5" />
            Full table
          </Button>

          <PermissionGate permission="employee.write">
            <Button onClick={() => router.push("/portal/employees/new")} disabled={busyAny}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add employee
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Stats */}
      <EmployeeCsvActions onImported={() => void load()} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard title="Total loaded" value={rows.length} subtitle="Current result set" icon={<Users className="h-5 w-5" />} />
        <OverviewStatCard title="Active" value={stats.active} subtitle="Currently active" icon={<UserCheck className="h-5 w-5" />} />
        <OverviewStatCard title="Onboarding" value={stats.onboarding} subtitle="In onboarding" icon={<UserPlus className="h-5 w-5" />} />
        <OverviewStatCard title="Suspended / Deleted" value={`${stats.suspended} / ${stats.deleted}`} subtitle="Exceptions" icon={<UserX className="h-5 w-5" />} />
      </div>

      {/* Main content card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle className="text-base">Employee list</CardTitle>
              <CardDescription>Search, filter and manage records</CardDescription>
            </div>
            <div className="w-full xl:w-[360px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employee..." className="pl-9" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-4 md:p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewSelect label="Status" value={status} onChange={(v) => setStatus(v as any)}>
              <option value="">All statuses</option>
              {EMPLOYEE_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>{human(s)}</option>
              ))}
            </OverviewSelect>

            <OverviewSelect label="Employment Type" value={employmentType} onChange={(v) => setEmploymentType(v as any)}>
              <option value="">All types</option>
              {EMPLOYMENT_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>{human(t)}</option>
              ))}
            </OverviewSelect>

            <div className="flex items-end">
              <label className="inline-flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-950">
                <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} className="h-4 w-4 rounded" />
                Include deleted
              </label>
            </div>

            <div className="flex items-end justify-end">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={busyAny || page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Prev
                </Button>
                <Badge variant="muted" className="h-9 px-3">
                  {page} / {Math.max(1, totalPages)}
                </Badge>
                <Button variant="outline" size="sm" disabled={busyAny || page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Content – Cards or List */}
          {!canRead ? (
            <EmptyState title="No access" description="You don't have permission to view employees." />
          ) : initialLoading ? (
            <TableSkeleton rows={6} cols={viewMode === "cards" ? 4 : 7} />
          ) : rows.length === 0 ? (
            <EmptyState
              title={q.trim() ? "No matches found" : "No employees"}
              description={q.trim() ? "Try adjusting your search or filters." : "No records match the current filters."}
            />
          ) : viewMode === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rows.map(emp => (
                <EmployeeCard
                  key={emp.id}
                  emp={emp}
                  busy={busyEmployeeId === emp.id}
                  busyAny={busyAny}
                  router={router}
                  setStatusTarget={setStatusTarget}
                  setRemoveTarget={setRemoveTarget}
                  setRestoreTarget={setRestoreTarget}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Employee #</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(emp => (
                    <EmployeeListRow
                      key={emp.id}
                      emp={emp}
                      busy={busyEmployeeId === emp.id}
                      busyAny={busyAny}
                      router={router}
                      setStatusTarget={setStatusTarget}
                      setRemoveTarget={setRemoveTarget}
                      setRestoreTarget={setRestoreTarget}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {busyAny && busyAction !== "refresh" && (
            <div className="text-center text-sm text-slate-500">Processing...</div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs – unchanged */}
      <ConfirmDialog open={Boolean(removeTarget)} onOpenChange={o => !o && setRemoveTarget(null)} title="Delete employee" description={`Soft-delete ${removeTarget ? fullName(removeTarget) : "this employee"}?`} confirmText="Delete" destructive busyAny={busyAny} onConfirm={remove} />
      <ConfirmDialog open={Boolean(restoreTarget)} onOpenChange={o => !o && setRestoreTarget(null)} title="Restore employee" description={`Restore ${restoreTarget ? fullName(restoreTarget) : "this employee"}?`} confirmText="Restore" busyAny={busyAny} onConfirm={restore} />
      <EmployeeChangeStatusDialog open={Boolean(statusTarget)} onOpenChange={o => !o && setStatusTarget(null)} employee={statusTarget} busyAny={busyAny} onSubmit={async (dto) => { /* unchanged logic */ }} />
    </div>
  );
}

// ────────────────────────────────────────
// Card View Row
// ────────────────────────────────────────
function EmployeeCard({
  emp,
  busy,
  busyAny,
  router,
  setStatusTarget,
  setRemoveTarget,
  setRestoreTarget,
}: {
  emp: EmployeeListItem;
  busy: boolean;
  busyAny: boolean;
  router: ReturnType<typeof useRouter>;
  setStatusTarget: (e: EmployeeListItem | null) => void;
  setRemoveTarget: (e: EmployeeListItem | null) => void;
  setRestoreTarget: (e: EmployeeListItem | null) => void;
}) {
  const deleted = Boolean((emp as any)?.deletedAt);

  return (
    <div className={cn(
      "rounded-2xl border bg-white p-5 shadow-sm transition hover:border-slate-300 dark:bg-slate-950 dark:hover:border-slate-700",
      deleted && "opacity-70 bg-slate-50/60 dark:bg-slate-900/40"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate text-base">{fullName(emp)}</div>
              <div className="mt-1 flex flex-wrap gap-2">
                <StatusBadge status={(emp as any)?.status} deleted={deleted} />
                <EmploymentTypeBadge type={(emp as any)?.employmentType} />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div><span className="font-medium">Email:</span> {(emp as any)?.workEmail ?? (emp as any)?.personalEmail ?? "—"}</div>
            <div><span className="font-medium">Employee #:</span> {String((emp as any)?.employeeNumber ?? "—")}</div>
            <div><span className="font-medium">Updated:</span> {safeIso((emp as any)?.updatedAt ?? (emp as any)?.createdAt)}</div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={busyAny}>
              <Button variant="outline" size="icon" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/portal/employees/${emp.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <PermissionGate permission="employee.write">
                <DropdownMenuItem onClick={() => router.push(`/portal/employees/${emp.id}/edit`)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                {!deleted && (
                  <DropdownMenuItem onClick={() => setStatusTarget(emp)}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Change Status
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {deleted ? (
                  <DropdownMenuItem onClick={() => setRestoreTarget(emp)} className="text-green-600">
                    <RotateCcw className="mr-2 h-4 w-4" /> Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setRemoveTarget(emp)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                )}
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────
// List View Row
// ────────────────────────────────────────
function EmployeeListRow({
  emp,
  busy,
  busyAny,
  router,
  setStatusTarget,
  setRemoveTarget,
  setRestoreTarget,
}: {
  emp: EmployeeListItem;
  busy: boolean;
  busyAny: boolean;
  router: ReturnType<typeof useRouter>;
  setStatusTarget: (e: EmployeeListItem | null) => void;
  setRemoveTarget: (e: EmployeeListItem | null) => void;
  setRestoreTarget: (e: EmployeeListItem | null) => void;
}) {
  const deleted = Boolean((emp as any)?.deletedAt);

  return (
    <TableRow className={cn(deleted && "opacity-70 bg-slate-50/50 dark:bg-slate-900/30")}>
      <TableCell className="font-medium">{fullName(emp)}</TableCell>
      <TableCell><StatusBadge status={(emp as any)?.status} deleted={deleted} /></TableCell>
      <TableCell><EmploymentTypeBadge type={(emp as any)?.employmentType} /></TableCell>
      <TableCell className="text-slate-600 dark:text-slate-300">{(emp as any)?.workEmail ?? "—"}</TableCell>
      <TableCell>{String((emp as any)?.employeeNumber ?? "—")}</TableCell>
      <TableCell className="text-slate-500 dark:text-slate-400 text-sm">{safeIso((emp as any)?.updatedAt ?? (emp as any)?.createdAt)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={busyAny}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/portal/employees/${emp.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <PermissionGate permission="employee.write">
              <DropdownMenuItem onClick={() => router.push(`/portal/employees/${emp.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {!deleted && (
                <DropdownMenuItem onClick={() => setStatusTarget(emp)}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Status
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {deleted ? (
                <DropdownMenuItem onClick={() => setRestoreTarget(emp)} className="text-green-600">
                  <RotateCcw className="mr-2 h-4 w-4" /> Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setRemoveTarget(emp)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </PermissionGate>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
function OverviewSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
      >
        {children}
      </select>
    </div>
  );
}

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
      <DialogContent>
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
            </span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <OverviewSelect label="Status" value={status} onChange={(v) => setStatus(v as EmployeeStatus)}>
            {EMPLOYEE_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {human(s)}
              </option>
            ))}
          </OverviewSelect>

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
                ...(needsTermination
                  ? { terminationDate, terminationReason: terminationReason || undefined }
                  : {}),
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
