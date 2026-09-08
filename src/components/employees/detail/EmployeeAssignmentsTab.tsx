"use client";

import * as React from "react";
import { Plus, RefreshCcw } from "lucide-react";

import { EmployeeSelect } from "@/logaxp/components/lookups/EmployeeSelect";
import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { toast } from "@/logaxp/components/ui/toast";
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

import type {
  EmployeeDetail,
  EmployeeAssignment,
  CreateEmployeeAssignmentDto,
  UpdateEmployeeAssignmentDto,
} from "@/logaxp/lib/employee-management/employee-management.types";
import type {
  OrgUnit,
  Location,
  Position,
  CostCenter,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

import { unwrapApi, safeDate, BusyAction } from "./employee-detail.utils";
import { ConfirmDialog } from "./EmployeeSharedDialogs";

function SelectField({
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
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
      >
        {children}
      </select>
    </div>
  );
}

export function EmployeeAssignmentsTab({
  employee,
  api,
  busyAny,
  setBusyAction,
  lookups,
  onRefresh,
}: {
  employee: EmployeeDetail;
  api: ReturnType<typeof import("@/logaxp/hooks/useEmployeeManagement").useEmployeeManagement>;
  busyAny: boolean;
  setBusyAction: (v: BusyAction) => void;
  lookups: {
    orgUnits: OrgUnit[];
    locations: Location[];
    positions: Position[];
    costCenters: CostCenter[];
  };
  onRefresh: () => void;
}) {
  const employeeId = employee.id;

  const [rows, setRows] = React.useState<EmployeeAssignment[]>(
    Array.isArray(employee.assignments) ? employee.assignments : []
  );
  const [initialLoading, setInitialLoading] = React.useState(true);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<EmployeeAssignment | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<EmployeeAssignment | null>(null);
  const [endTarget, setEndTarget] = React.useState<EmployeeAssignment | null>(null);
  const [setPrimaryTarget, setSetPrimaryTarget] = React.useState<EmployeeAssignment | null>(null);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        setBusyAction("panel");
        const res = await api.assignments.list(employeeId);
        setRows(unwrapApi(res) as EmployeeAssignment[]);
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load assignments");
      } finally {
        setInitialLoading(false);
        setBusyAction(null);
      }
    },
    [api.assignments, employeeId, setBusyAction]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Manage org unit, location, position, cost center assignments.
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
            <Plus className="h-4 w-4" />
            Add assignment
          </Button>
        </div>
      </div>

      {initialLoading ? (
        <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <LoadingSkeleton lines={6} />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <EmptyState
            title="No assignments"
            description="Add an assignment to attach org structure, position, and location."
            action={<Button onClick={() => setCreateOpen(true)}>Add assignment</Button>}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Primary</TableHead>
                  <TableHead>Org Unit</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cost Center</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {a.isPrimary ? <Badge variant="success">PRIMARY</Badge> : <Badge variant="muted">—</Badge>}
                    </TableCell>
                    <TableCell>{(a as any).orgUnit?.name ?? "—"}</TableCell>
                    <TableCell>{(a as any).position?.title ?? (a as any).position?.name ?? "—"}</TableCell>
                    <TableCell>{(a as any).location?.name ?? "—"}</TableCell>
                    <TableCell>{(a as any).costCenter?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      <div>From: {safeDate(a.effectiveFrom)}</div>
                      <div>To: {safeDate(a.effectiveTo)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {!a.isPrimary ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSetPrimaryTarget(a)}
                            disabled={busyAny}
                          >
                            Make primary
                          </Button>
                        ) : null}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEdit(a)}
                          disabled={busyAny}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEndTarget(a)}
                          disabled={busyAny}
                        >
                          End
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRemoveTarget(a)}
                          disabled={busyAny}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        </div>
      )}

      <AssignmentCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        lookups={lookups}
        initial={null}
        onSubmit={async (dto) => {
          await api.assignments.create(employeeId, dto);
          toast.success("Assignment created");
          setCreateOpen(false);
          await load({ silent: true });
          onRefresh();
        }}
        busyAny={busyAny}
      />

      <AssignmentCreateEditDialog
        open={Boolean(edit)}
        onOpenChange={(o) => !o && setEdit(null)}
        mode="edit"
        lookups={lookups}
        initial={edit}
        onSubmit={async (dto) => {
          if (!edit) return;
          await api.assignments.update(edit.id, dto);
          toast.success("Assignment updated");
          setEdit(null);
          await load({ silent: true });
          onRefresh();
        }}
        busyAny={busyAny}
      />

      <ConfirmDialog
        open={Boolean(setPrimaryTarget)}
        onOpenChange={(o) => !o && setSetPrimaryTarget(null)}
        title="Set primary assignment"
        description="This will mark this assignment as the employee's primary assignment."
        confirmText="Set primary"
        busyAny={busyAny}
        onConfirm={async () => {
          if (!setPrimaryTarget) return;
          await api.assignments.setPrimary(setPrimaryTarget.id);
          toast.success("Primary assignment updated");
          setSetPrimaryTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <AssignmentEndDialog
        open={Boolean(endTarget)}
        onOpenChange={(o) => !o && setEndTarget(null)}
        busyAny={busyAny}
        onConfirm={async (effectiveTo) => {
          if (!endTarget) return;
          await api.assignments.end(endTarget.id, effectiveTo);
          toast.success("Assignment ended");
          setEndTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove assignment"
        description="This will remove the assignment record."
        confirmText="Remove"
        destructive
        busyAny={busyAny}
        onConfirm={async () => {
          if (!removeTarget) return;
          await api.assignments.remove(removeTarget.id);
          toast.success("Assignment removed");
          setRemoveTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />
    </div>
  );
}

function AssignmentCreateEditDialog({
  open,
  onOpenChange,
  mode,
  initial,
  lookups,
  busyAny,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "create" | "edit";
  initial: EmployeeAssignment | null;
  lookups: { orgUnits: OrgUnit[]; locations: Location[]; positions: Position[]; costCenters: CostCenter[] };
  busyAny: boolean;
  onSubmit: (dto: CreateEmployeeAssignmentDto | UpdateEmployeeAssignmentDto) => Promise<void> | void;
}) {
  const [orgUnitId, setOrgUnitId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [positionId, setPositionId] = React.useState("");
  const [costCenterId, setCostCenterId] = React.useState("");
  const [managerId, setManagerId] = React.useState("");
  const [effectiveFrom, setEffectiveFrom] = React.useState("");
  const [effectiveTo, setEffectiveTo] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setOrgUnitId(String(initial?.orgUnitId ?? ""));
    setLocationId(String(initial?.locationId ?? ""));
    setPositionId(String(initial?.positionId ?? ""));
    setCostCenterId(String(initial?.costCenterId ?? ""));
    setManagerId(String(initial?.managerId ?? ""));
    setEffectiveFrom(String(initial?.effectiveFrom ?? "").slice(0, 10));
    setEffectiveTo(String(initial?.effectiveTo ?? "").slice(0, 10));
    setNotes(String(initial?.notes ?? ""));
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add assignment" : "Edit assignment"}</DialogTitle>
          <DialogDescription>Attach org structure and job placement information.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SelectField label="Org Unit" value={orgUnitId} onChange={setOrgUnitId}>
            <option value="">—</option>
            {lookups.orgUnits.map((x) => (
              <option key={x.id} value={x.id}>
                {String(x.name ?? "—")}
              </option>
            ))}
          </SelectField>

          <SelectField label="Location" value={locationId} onChange={setLocationId}>
            <option value="">—</option>
            {lookups.locations.map((x) => (
              <option key={x.id} value={x.id}>
                {String(x.name ?? "—")}
              </option>
            ))}
          </SelectField>

          <SelectField label="Position" value={positionId} onChange={setPositionId}>
            <option value="">—</option>
            {lookups.positions.map((x: any) => (
              <option key={x.id} value={x.id}>
                {String(x.title ?? x.name ?? "—")}
              </option>
            ))}
          </SelectField>

          <SelectField label="Cost Center" value={costCenterId} onChange={setCostCenterId}>
            <option value="">—</option>
            {lookups.costCenters.map((x) => (
              <option key={x.id} value={x.id}>
                {String(x.name ?? "—")}
              </option>
            ))}
          </SelectField>

          <EmployeeSelect
            label="Manager (optional)"
            value={managerId}
            onChange={setManagerId}
            placeholder="Search manager…"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Effective From</label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Effective To</label>
              <input
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              resize="y"
              size="sm"
              className="min-h-[96px]"
              placeholder="Assignment notes..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              void onSubmit({
                orgUnitId: orgUnitId || null,
                locationId: locationId || null,
                positionId: positionId || null,
                costCenterId: costCenterId || null,
                managerId: managerId || null,
                effectiveFrom: effectiveFrom || undefined,
                effectiveTo: effectiveTo || null,
                notes: notes || null,
              })
            }
            disabled={busyAny}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignmentEndDialog({
  open,
  onOpenChange,
  busyAny,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  busyAny: boolean;
  onConfirm: (effectiveTo: string) => Promise<void> | void;
}) {
  const [effectiveTo, setEffectiveTo] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setEffectiveTo("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>End assignment</DialogTitle>
          <DialogDescription>Provide an effective end date for this assignment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Effective To</label>
          <input
            type="date"
            value={effectiveTo}
            onChange={(e) => setEffectiveTo(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
          />
          <div className="text-[11px] text-slate-500">Required.</div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button onClick={() => void onConfirm(effectiveTo)} disabled={busyAny || !effectiveTo.trim()}>
            End assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}