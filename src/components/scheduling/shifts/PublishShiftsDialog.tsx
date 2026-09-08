"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import { Button } from "@/logaxp/components/ui/button";
import type { PublishShiftsDto } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function PublishShiftsDialog({
  open,
  onOpenChange,
  defaultFrom,
  defaultTo,
  busy,
  onPublish,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  defaultFrom: string;
  defaultTo: string;

  busy?: boolean;
  onPublish: (dto: PublishShiftsDto) => void | Promise<void>;
}) {
  const [employeeId, setEmployeeId] = React.useState("");
  const [orgUnitId, setOrgUnitId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setEmployeeId("");
    setOrgUnitId("");
    setLocationId("");
  }, [open]);

  const submit = async () => {
    await onPublish({
      from: defaultFrom,
      to: defaultTo,
      employeeId: employeeId || undefined,
      orgUnitId: orgUnitId || undefined,
      locationId: locationId || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Publish shifts"
      subtitle="Publish draft shifts to make them visible to employees."
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <Send className="h-4 w-4" />
            Publish
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Publishing range: <span className="font-medium">{defaultFrom}</span> → <span className="font-medium">{defaultTo}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="employeeId (optional)"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          />
          <input
            value={orgUnitId}
            onChange={(e) => setOrgUnitId(e.target.value)}
            placeholder="orgUnitId (optional)"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          />
          <input
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            placeholder="locationId (optional)"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          />
          <div />
        </div>
      </div>
    </Modal>
  );
}