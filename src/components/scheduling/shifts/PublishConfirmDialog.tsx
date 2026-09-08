"use client";

import * as React from "react";
import { Send, ShieldAlert } from "lucide-react";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";

import type { PublishShiftsDto, ShiftConflictsResponse } from "@/logaxp/lib/scheduling/scheduleManagement.types";
import { EmployeePicker, LocationPicker, OrgUnitPicker } from "@/logaxp/components/scheduling/SchedulePickers";

export function PublishConfirmDialog({
  open,
  onOpenChange,
  defaultFrom,
  defaultTo,
  conflicts,
  busy,
  onPublish,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  defaultFrom: string;
  defaultTo: string;

  conflicts: ShiftConflictsResponse | null;

  busy?: boolean;
  onPublish: (dto: PublishShiftsDto) => void | Promise<void>;
}) {
  const overlaps = conflicts?.data?.overlaps?.length ?? 0;
  const rest = conflicts?.data?.restViolations?.length ?? 0;
  const invalid = conflicts?.data?.invalid?.length ?? 0;

  const blocked = overlaps > 0 || rest > 0 || invalid > 0;

  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [employeeLabel, setEmployeeLabel] = React.useState<string | null>(null);

  const [orgUnitId, setOrgUnitId] = React.useState<string | null>(null);
  const [orgUnitLabel, setOrgUnitLabel] = React.useState<string | null>(null);

  const [locationId, setLocationId] = React.useState<string | null>(null);
  const [locationLabel, setLocationLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setEmployeeId(null); setEmployeeLabel(null);
    setOrgUnitId(null); setOrgUnitLabel(null);
    setLocationId(null); setLocationLabel(null);
  }, [open]);

  const submit = async () => {
    await onPublish({
      from: defaultFrom,
      to: defaultTo,
      employeeId: employeeId ?? undefined,
      orgUnitId: orgUnitId ?? undefined,
      locationId: locationId ?? undefined,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Publish shifts"
      subtitle="Publishing makes shifts visible to employees. Conflicts must be resolved first."
      widthClassName="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || blocked}>
            <Send className="h-4 w-4" />
            Publish
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <ShieldAlert className="h-3.5 w-3.5" />
            Range: {defaultFrom} → {defaultTo}
          </Badge>

          <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            Overlaps: {overlaps}
          </Badge>

          <Badge className="rounded-full border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            Rest: {rest}
          </Badge>

          <Badge variant="muted" className="rounded-full">Invalid: {invalid}</Badge>
        </div>

        {blocked ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            Conflicts detected. Fix overlaps/rest/invalid shifts before publishing. (Use the Conflicts drawer.)
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
            ✅ No conflicts detected. Safe to publish.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Employee (optional)</div>
            <EmployeePicker
              valueId={employeeId}
              valueLabel={employeeLabel}
              onSelect={(it) => { setEmployeeId(it?.id ?? null); setEmployeeLabel(it?.label ?? null); }}
              allowClear
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Org unit (optional)</div>
            <OrgUnitPicker
              valueId={orgUnitId}
              valueLabel={orgUnitLabel}
              onSelect={(it) => { setOrgUnitId(it?.id ?? null); setOrgUnitLabel(it?.label ?? null); }}
              allowClear
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Location (optional)</div>
            <LocationPicker
              valueId={locationId}
              valueLabel={locationLabel}
              onSelect={(it) => { setLocationId(it?.id ?? null); setLocationLabel(it?.label ?? null); }}
              allowClear
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}