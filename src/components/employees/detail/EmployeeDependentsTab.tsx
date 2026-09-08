"use client";

import * as React from "react";
import { Plus, RefreshCcw } from "lucide-react";

import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
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
  Dependent,
  CreateDependentDto,
  UpdateDependentDto,
} from "@/logaxp/lib/employee-management/employee-management.types";

import { unwrapApi, safeIso, BusyAction } from "./employee-detail.utils";
import { ConfirmDialog } from "./EmployeeSharedDialogs";

export function EmployeeDependentsTab({
  employee,
  api,
  busyAny,
  setBusyAction,
  onRefresh,
}: {
  employee: EmployeeDetail;
  api: ReturnType<typeof import("@/logaxp/hooks/useEmployeeManagement").useEmployeeManagement>;
  busyAny: boolean;
  setBusyAction: (v: BusyAction) => void;
  onRefresh: () => void;
}) {
  const employeeId = employee.id;

  const [rows, setRows] = React.useState<Dependent[]>([]);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<Dependent | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<Dependent | null>(null);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        setBusyAction("panel");
        const res = await api.dependents.list(employeeId);
        setRows(unwrapApi(res) as Dependent[]);
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load dependents");
      } finally {
        setInitialLoading(false);
        setBusyAction(null);
      }
    },
    [api.dependents, employeeId, setBusyAction]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-600 dark:text-slate-300">Dependents on file.</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
            <Plus className="h-4 w-4" />
            Add dependent
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
            title="No dependents"
            description="Add dependent records for benefits and HR tracking."
            action={<Button onClick={() => setCreateOpen(true)}>Add dependent</Button>}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-semibold">{d.name ?? "—"}</TableCell>
                    <TableCell>{d.relationship ?? "—"}</TableCell>
                    <TableCell>{d.dob ?? "—"}</TableCell>
                    <TableCell>{safeIso(d.updatedAt ?? null)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEdit(d)} disabled={busyAny}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(d)} disabled={busyAny}>
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

      <DependentCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        initial={null}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          await api.dependents.create(employeeId, dto as CreateDependentDto);
          toast.success("Dependent created");
          setCreateOpen(false);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <DependentCreateEditDialog
        open={Boolean(edit)}
        onOpenChange={(o) => !o && setEdit(null)}
        mode="edit"
        initial={edit}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          if (!edit) return;
          await api.dependents.update(edit.id, dto);
          toast.success("Dependent updated");
          setEdit(null);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove dependent"
        description="This will remove the dependent record."
        confirmText="Remove"
        destructive
        busyAny={busyAny}
        onConfirm={async () => {
          if (!removeTarget) return;
          await api.dependents.remove(removeTarget.id);
          toast.success("Dependent removed");
          setRemoveTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />
    </div>
  );
}

function DependentCreateEditDialog({
  open,
  onOpenChange,
  mode,
  initial,
  busyAny,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "create" | "edit";
  initial: Dependent | null;
  busyAny: boolean;
  onSubmit: (dto: CreateDependentDto | UpdateDependentDto) => Promise<void> | void;
}) {
  const [name, setName] = React.useState("");
  const [relationship, setRelationship] = React.useState("");
  const [dob, setDob] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setName(String(initial?.name ?? ""));
    setRelationship(String(initial?.relationship ?? ""));
    setDob(String(initial?.dob ?? "").slice(0, 10));
  }, [open, initial]);

  const canSave = name.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add dependent" : "Edit dependent"}</DialogTitle>
          <DialogDescription>Dependent data for benefits and HR tracking.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} />

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">DOB (optional)</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
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
                name: name || (mode === "edit" ? undefined : ""),
                relationship: relationship || (mode === "edit" ? null : undefined),
                dob: dob || (mode === "edit" ? null : undefined),
              } as CreateDependentDto | UpdateDependentDto)
            }
            disabled={busyAny || !canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}