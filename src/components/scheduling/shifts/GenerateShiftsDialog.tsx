"use client";

import * as React from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import type { GenerateShiftsDto } from "@/logaxp/lib/scheduling/scheduleManagement.types";

import { TemplatePicker, EmployeePicker, OrgUnitPicker } from "@/logaxp/components/scheduling/SchedulePickers";


export function GenerateShiftsDialog({
  open,
  onOpenChange,
  defaultFrom,
  defaultTo,
  busy,
  onGenerate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  defaultFrom: string;
  defaultTo: string;

  busy?: boolean;
  onGenerate: (dto: GenerateShiftsDto) => void | Promise<void>;
}) {
  const [templateId, setTemplateId] = React.useState<string | null>(null);
  const [templateLabel, setTemplateLabel] = React.useState<string | null>(null);

  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [employeeLabel, setEmployeeLabel] = React.useState<string | null>(null);

  const [orgUnitId, setOrgUnitId] = React.useState<string | null>(null);
  const [orgUnitLabel, setOrgUnitLabel] = React.useState<string | null>(null);

  const [publish, setPublish] = React.useState(false);
  const [overwriteDrafts, setOverwriteDrafts] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTemplateId(null);
    setTemplateLabel(null);
    setEmployeeId(null);
    setEmployeeLabel(null);
    setOrgUnitId(null);
    setOrgUnitLabel(null);
    setPublish(false);
    setOverwriteDrafts(false);
  }, [open]);

  const submit = async () => {
    await onGenerate({
      from: defaultFrom,
      to: defaultTo,
      templateId: templateId ?? undefined,
      employeeId: employeeId ?? undefined,
      orgUnitId: orgUnitId ?? undefined,
      publish,
      overwriteDrafts,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Generate shifts"
      subtitle="Generate from templates + assignments with rest rules and conflict protection."
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <Wand2 className="h-4 w-4" />
            Generate
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Generation Wizard
          </Badge>
          <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            Range: {defaultFrom} → {defaultTo}
          </Badge>
        </div>

        <div className="grid gap-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Template (optional)</div>
            <TemplatePicker
              valueId={templateId}
              valueLabel={templateLabel}
              onSelect={(it) => {
                setTemplateId(it?.id ?? null);
                setTemplateLabel(it?.label ?? null);
              }}
              allowClear
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Employee (optional)</div>
              <EmployeePicker
                valueId={employeeId}
                valueLabel={employeeLabel}
                onSelect={(it) => {
                  setEmployeeId(it?.id ?? null);
                  setEmployeeLabel(it?.label ?? null);
                }}
                allowClear
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Org unit (optional)</div>
              <OrgUnitPicker
                valueId={orgUnitId}
                valueLabel={orgUnitLabel}
                onSelect={(it) => {
                  setOrgUnitId(it?.id ?? null);
                  setOrgUnitLabel(it?.label ?? null);
                }}
                allowClear
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
              Publish after generate
            </label>

            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <input type="checkbox" checked={overwriteDrafts} onChange={(e) => setOverwriteDrafts(e.target.checked)} />
              Overwrite drafts in range
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}