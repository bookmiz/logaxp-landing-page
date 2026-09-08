"use client";

import * as React from "react";
import { Save, Users, BriefcaseBusiness, Mail } from "lucide-react";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import type { OnboardingTemplate } from "@/logaxp/lib/onboarding/onboarding.types";
import type { EmployeeListItem } from "@/logaxp/lib/employee-management/employee-management.types";

import { unwrapApi } from "@/logaxp/components/onboarding/onboarding.utils";
import { EmployeeSelect } from "@/logaxp/components/lookups/EmployeeSelect";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { toast } from "@/logaxp/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";

function safeEmployeeName(emp?: EmployeeListItem | null) {
  if (!emp) return "—";
  return `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—";
}

function safeEmployeeEmail(emp?: EmployeeListItem | null) {
  if (!emp) return "—";
  return emp.workEmail ?? emp.personalEmail ?? "—";
}

function safeEmployeeNumber(emp?: EmployeeListItem | null) {
  if (!emp) return "—";
  return emp.employeeNumber ? String(emp.employeeNumber) : "—";
}

function getPrimaryAssignmentLabel(emp?: EmployeeListItem | null) {
  const primary =
    (emp as EmployeeListItem & {
      primaryAssignment?: {
        orgUnit?: { name?: string | null } | null;
        position?: { title?: string | null } | null;
        location?: { name?: string | null } | null;
        costCenter?: { name?: string | null } | null;
      } | null;
    })?.primaryAssignment ?? null;

  if (!primary) return "—";

  const parts = [
    primary.orgUnit?.name || null,
    primary.position?.title || null,
    primary.location?.name || null,
    primary.costCenter?.name || null,
  ].filter(Boolean);

  return parts.length ? parts.join(" • ") : "—";
}

export function OnboardingInstanceCreateDialog({
  open,
  onOpenChange,
  templates,
  onCreated,
  members, // kept optional for backward compatibility; not used anymore
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: OnboardingTemplate[];
  onCreated: (instanceId: string) => void | Promise<void>;
  members?: unknown[];
}) {
  const { instances } = useOnboarding();

  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState("");
  const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeListItem | null>(null);

  const [templateId, setTemplateId] = React.useState<string>("");
  const [startNow, setStartNow] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    setSelectedEmployeeId("");
    setSelectedEmployee(null);
    setTemplateId(templates?.[0]?.id ?? "");
    setStartNow(true);
    setSaving(false);
  }, [open, templates]);

  const canSave = Boolean(selectedEmployeeId) && Boolean(templateId) && !saving;

  const submit = async () => {
    if (!canSave) return;

    try {
      setSaving(true);

      const res = await instances.create({
        employeeId: selectedEmployeeId,
        templateId,
      });

      const created = unwrapApi(res);

      if (startNow) {
        try {
          await instances.start(created.id, {});
        } catch (e) {
          console.error(e);
          toast.error("Instance created, but failed to start. Start it from the detail page.");
        }
      }

      toast.success("Onboarding instance created");
      await onCreated(created.id);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create onboarding instance");
    } finally {
      setSaving(false);
    }
  };

  const hasTemplates = templates.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Create Onboarding Instance
          </DialogTitle>
          <DialogDescription>
            Select an employee and assign an onboarding template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <EmployeeSelect
            label="Employee"
            value={selectedEmployeeId}
            onChange={setSelectedEmployeeId}
            onPick={(emp) => setSelectedEmployee(emp)}
            placeholder="Search employee by name or email…"
            hint="Search and select the employee you want to onboard."
            disabled={saving}
            required
            pageSize={8}
            emptyStateText="No employees found. Create an employee first before creating an onboarding instance."
          />

          {selectedEmployee ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Selected Employee
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Name</div>
                  <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {safeEmployeeName(selectedEmployee)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Employee #: {safeEmployeeNumber(selectedEmployee)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>
                  <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {safeEmployeeEmail(selectedEmployee)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    Primary Assignment
                  </div>
                  <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {getPrimaryAssignmentLabel(selectedEmployee)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400">
              Select an employee to continue.
            </div>
          )}

          <div className="space-y-2">
            <Select
              value={templateId}
              onValueChange={setTemplateId}
              disabled={saving || !hasTemplates}
            >
              <SelectTrigger label="Template">
                <SelectValue placeholder={hasTemplates ? "Select a template" : "No templates available"} />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Templates</SelectLabel>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {!hasTemplates ? (
              <div className="text-xs text-amber-600 dark:text-amber-400">
                No onboarding templates available. Create a template first.
              </div>
            ) : null}
          </div>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
            <input
              type="checkbox"
              checked={startNow}
              onChange={(e) => setStartNow(e.target.checked)}
              className="h-4 w-4 rounded"
              disabled={saving}
            />
            Start immediately after creation
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={saving} disabled={!canSave}>
            <Save className="h-4 w-4" />
            Create instance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}