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
  EmergencyContact,
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
} from "@/logaxp/lib/employee-management/employee-management.types";

import { unwrapApi, BusyAction } from "./employee-detail.utils";
import { ConfirmDialog } from "./EmployeeSharedDialogs";

export function EmployeeEmergencyTab({
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

  const [rows, setRows] = React.useState<EmergencyContact[]>([]);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<EmergencyContact | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<EmergencyContact | null>(null);
  const [primaryTarget, setPrimaryTarget] = React.useState<EmergencyContact | null>(null);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        setBusyAction("panel");
        const res = await api.emergencyContacts.list(employeeId);
        setRows(unwrapApi(res) as EmergencyContact[]);
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load emergency contacts");
      } finally {
        setInitialLoading(false);
        setBusyAction(null);
      }
    },
    [api.emergencyContacts, employeeId, setBusyAction]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-600 dark:text-slate-300">Emergency contacts on file.</div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
            <Plus className="h-4 w-4" />
            Add contact
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
            title="No emergency contacts"
            description="Add at least one emergency contact for the employee."
            action={<Button onClick={() => setCreateOpen(true)}>Add contact</Button>}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-950">
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Primary</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.isPrimary ? <Badge variant="success">PRIMARY</Badge> : <Badge variant="muted">—</Badge>}
                    </TableCell>
                    <TableCell className="font-semibold">{c.name ?? "—"}</TableCell>
                    <TableCell>{c.relationship ?? "—"}</TableCell>
                    <TableCell>{c.phone ?? "—"}</TableCell>
                    <TableCell>{c.email ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {!c.isPrimary ? (
                          <Button size="sm" variant="outline" onClick={() => setPrimaryTarget(c)} disabled={busyAny}>
                            Set primary
                          </Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => setEdit(c)} disabled={busyAny}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(c)} disabled={busyAny}>
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

      <EmergencyContactCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        initial={null}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          await api.emergencyContacts.create(employeeId, dto as CreateEmergencyContactDto);
          toast.success("Contact created");
          setCreateOpen(false);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <EmergencyContactCreateEditDialog
        open={Boolean(edit)}
        onOpenChange={(o) => !o && setEdit(null)}
        mode="edit"
        initial={edit}
        busyAny={busyAny}
        onSubmit={async (dto) => {
          if (!edit) return;
          await api.emergencyContacts.update(edit.id, dto);
          toast.success("Contact updated");
          setEdit(null);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(primaryTarget)}
        onOpenChange={(o) => !o && setPrimaryTarget(null)}
        title="Set primary emergency contact"
        description="This will mark this emergency contact as the primary contact."
        confirmText="Set primary"
        busyAny={busyAny}
        onConfirm={async () => {
          if (!primaryTarget) return;
          await api.emergencyContacts.setPrimary(primaryTarget.id);
          toast.success("Primary contact updated");
          setPrimaryTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove emergency contact"
        description="This will remove the contact record."
        confirmText="Remove"
        destructive
        busyAny={busyAny}
        onConfirm={async () => {
          if (!removeTarget) return;
          await api.emergencyContacts.remove(removeTarget.id);
          toast.success("Contact removed");
          setRemoveTarget(null);
          await load({ silent: true });
          onRefresh();
        }}
      />
    </div>
  );
}

function EmergencyContactCreateEditDialog({
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
  initial: EmergencyContact | null;
  busyAny: boolean;
  onSubmit: (dto: CreateEmergencyContactDto | UpdateEmergencyContactDto) => Promise<void> | void;
}) {
  const [name, setName] = React.useState("");
  const [relationship, setRelationship] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setName(String(initial?.name ?? ""));
    setRelationship(String(initial?.relationship ?? ""));
    setPhone(String(initial?.phone ?? ""));
    setEmail(String(initial?.email ?? ""));
    setAddress(String(initial?.address ?? ""));
  }, [open, initial]);

  const canSave = name.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add emergency contact" : "Edit emergency contact"}</DialogTitle>
          <DialogDescription>Emergency contact details for HR and safety procedures.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="md:col-span-2">
            <Input label="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
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
                phone: phone || (mode === "edit" ? null : undefined),
                email: email || (mode === "edit" ? null : undefined),
                address: address || (mode === "edit" ? null : undefined),
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