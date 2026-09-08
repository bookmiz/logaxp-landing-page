"use client";

import * as React from "react";
import { Plus, RefreshCcw } from "lucide-react";

import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
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
  EmployeeAddress,
  CreateEmployeeAddressDto,
  UpdateEmployeeAddressDto,
} from "@/logaxp/lib/employee-management/employee-management.types";

import { unwrapApi, safeIso, BusyAction } from "./employee-detail.utils";
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
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
      >
        {children}
      </select>
    </div>
  );
}

export function EmployeeAddressesTab({
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

  const [rows, setRows] = React.useState<EmployeeAddress[]>([]);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<EmployeeAddress | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<EmployeeAddress | null>(null);
  const [primaryTarget, setPrimaryTarget] = React.useState<EmployeeAddress | null>(null);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        setBusyAction("panel");
        const res = await api.addresses.list(employeeId);
        setRows(unwrapApi(res) as EmployeeAddress[]);
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load addresses");
      } finally {
        setInitialLoading(false);
        setBusyAction(null);
      }
    },
    [api.addresses, employeeId, setBusyAction]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-600 dark:text-slate-300">Addresses on file.</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
            <Plus className="h-4 w-4" />
            Add address
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
            title="No addresses"
            description="Add an address (home, mailing, work)."
            action={<Button onClick={() => setCreateOpen(true)}>Add address</Button>}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Primary</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {a.isPrimary ? <Badge variant="success">PRIMARY</Badge> : <Badge variant="muted">—</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="muted">{String(a.type ?? "—").replaceAll("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {[a.line1, a.line2, a.city, a.state, a.postalCode, a.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </TableCell>
                    <TableCell>{safeIso(a.updatedAt ?? null)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {!a.isPrimary ? (
                          <Button size="sm" variant="outline" onClick={() => setPrimaryTarget(a)} disabled={busyAny}>
                            Set primary
                          </Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => setEdit(a)} disabled={busyAny}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(a)} disabled={busyAny}>
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

      <AddressCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        initial={null}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          await api.addresses.create(employeeId, dto as CreateEmployeeAddressDto);
          toast.success("Address created");
          setCreateOpen(false);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <AddressCreateEditDialog
        open={Boolean(edit)}
        onOpenChange={(o) => !o && setEdit(null)}
        mode="edit"
        initial={edit}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          if (!edit) return;
          await api.addresses.update(edit.id, dto as UpdateEmployeeAddressDto);
          toast.success("Address updated");
          setEdit(null);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(primaryTarget)}
        onOpenChange={(o) => !o && setPrimaryTarget(null)}
        title="Set primary address"
        description="This will mark this address as the primary address."
        confirmText="Set primary"
        busyAny={busyAny}
        onConfirm={async () => {
          if (!primaryTarget) return;
          await api.addresses.setPrimary(primaryTarget.id);
          toast.success("Primary address updated");
          setPrimaryTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove address"
        description="This will remove the address record."
        confirmText="Remove"
        destructive
        busyAny={busyAny}
        onConfirm={async () => {
          if (!removeTarget) return;
          await api.addresses.remove(removeTarget.id);
          toast.success("Address removed");
          setRemoveTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />
    </div>
  );
}

function AddressCreateEditDialog({
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
  initial: EmployeeAddress | null;
  busyAny: boolean;
  onSubmit: (dto: CreateEmployeeAddressDto | UpdateEmployeeAddressDto) => Promise<void> | void;
}) {
  const [type, setType] = React.useState(String(initial?.type ?? "HOME"));
  const [line1, setLine1] = React.useState("");
  const [line2, setLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [country, setCountry] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setType(String(initial?.type ?? "HOME"));
    setLine1(String(initial?.line1 ?? ""));
    setLine2(String(initial?.line2 ?? ""));
    setCity(String(initial?.city ?? ""));
    setState(String(initial?.state ?? ""));
    setPostalCode(String(initial?.postalCode ?? ""));
    setCountry(String(initial?.country ?? ""));
  }, [open, initial]);

  const canSave = line1.trim().length > 0 || city.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add address" : "Edit address"}</DialogTitle>
          <DialogDescription>Store employee address information.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SelectField label="Type" value={type} onChange={setType}>
            <option value="HOME">Home</option>
            <option value="MAILING">Mailing</option>
            <option value="WORK">Work</option>
            <option value="OTHER">Other</option>
          </SelectField>

          <Input label="Line 1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Street address" />
          <Input label="Line 2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Apt, suite, etc." />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
          <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              void onSubmit({
                type: (type || "HOME") as "HOME" | "MAILING" | "WORK" | "OTHER",
                line1: line1 || (mode === "edit" ? null : undefined),
                line2: line2 || (mode === "edit" ? null : undefined),
                city: city || (mode === "edit" ? null : undefined),
                state: state || (mode === "edit" ? null : undefined),
                postalCode: postalCode || (mode === "edit" ? null : undefined),
                country: country || (mode === "edit" ? null : undefined),
              })
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