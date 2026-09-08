"use client";

import * as React from "react";
import { Save, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Label } from "@/logaxp/components/ui/label";
import { Input } from "@/logaxp/components/ui/input";
import { Switch } from "@/logaxp/components/ui/switch";
import { Badge } from "@/logaxp/components/ui/badge";
import { Separator } from "@/logaxp/components/ui/separator";
import { cn } from "@/logaxp/lib/cn";

import {
  TemplatePicker,
  EmployeePicker,
  OrgUnitPicker,
} from "@/logaxp/components/scheduling/SchedulePickers";

import type {
  ScheduleAssignment,
  CreateScheduleAssignmentDto,
  UpdateScheduleAssignmentDto,
} from "@/logaxp/lib/scheduling/scheduleManagement.types";

type Mode = "create" | "edit";

export function AssignmentCreateEditDialog({
  open,
  onOpenChange,
  mode,
  assignment,
  busy,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  assignment?: ScheduleAssignment | null;
  busy?: boolean;
  onCreate: (dto: CreateScheduleAssignmentDto) => void | Promise<void>;
  onUpdate: (id: string, dto: UpdateScheduleAssignmentDto) => void | Promise<void>;
}) {
  const [template, setTemplate] = React.useState<{ id: string; label: string } | null>(null);
  const [employee, setEmployee] = React.useState<{ id: string; label: string } | null>(null);
  const [orgUnit, setOrgUnit] = React.useState<{ id: string; label: string } | null>(null);
  const [effectiveFrom, setEffectiveFrom] = React.useState("");
  const [effectiveTo, setEffectiveTo] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);

    if (mode === "edit" && assignment) {
      setTemplate(
        assignment.templateId
          ? { id: assignment.templateId, label: String(assignment.templateName ?? "Template") }
          : null
      );
      setEmployee(
        assignment.employeeId
          ? { id: assignment.employeeId, label: String(assignment.employeeName ?? "Employee") }
          : null
      );
      setOrgUnit(
        assignment.orgUnitId
          ? { id: assignment.orgUnitId, label: String(assignment.orgUnitName ?? "Org Unit") }
          : null
      );
      setEffectiveFrom(assignment.effectiveFrom?.split("T")[0] ?? "");
      setEffectiveTo(assignment.effectiveTo?.split("T")[0] ?? "");
      setIsPrimary(!!assignment.isPrimary);
    } else {
      setTemplate(null);
      setEmployee(null);
      setOrgUnit(null);
      setEffectiveFrom("");
      setEffectiveTo("");
      setIsPrimary(true);
    }
  }, [open, mode, assignment]);

  const validateAndSubmit = async () => {
    setError(null);

    if (!template?.id) {
      setError("Please select a schedule template.");
      return;
    }

    if (!employee?.id && !orgUnit?.id) {
      setError("Select either an employee or an organization unit.");
      return;
    }

    const dto: CreateScheduleAssignmentDto | UpdateScheduleAssignmentDto = {
      templateId: template.id,
      employeeId: employee?.id ?? null,
      orgUnitId: orgUnit?.id ?? null,
      isPrimary,
      effectiveFrom: effectiveFrom ? `${effectiveFrom}T00:00:00Z` : undefined,
      effectiveTo: effectiveTo ? `${effectiveTo}T23:59:59Z` : null,
    };

    try {
      if (mode === "create") {
        await onCreate(dto as CreateScheduleAssignmentDto);
      } else if (assignment?.id) {
        await onUpdate(assignment.id, dto as UpdateScheduleAssignmentDto);
      }
      onOpenChange(false);
    } catch (err) {
      setError("Failed to save assignment. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {mode === "create" ? "Create Assignment" : "Edit Assignment"}
          </DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Assign a schedule template to an employee or organization unit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Template */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-sm font-medium">
              Schedule Template <span className="text-destructive">*</span>
            </Label>
            <TemplatePicker
              valueId={template?.id ?? null}
              valueLabel={template?.label ?? null}
              onSelect={setTemplate}
              allowClear={false}
            />
          </div>

          <Separator className="my-2" />

          {/* Assignment Target */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employee" className="text-sm font-medium">
                Employee
              </Label>
              <EmployeePicker
                valueId={employee?.id ?? null}
                valueLabel={employee?.label ?? null}
                onSelect={(v) => {
                  setEmployee(v);
                  if (v) setOrgUnit(null); // mutually exclusive
                }}
                allowClear
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgUnit" className="text-sm font-medium">
                Organization Unit
              </Label>
              <OrgUnitPicker
                valueId={orgUnit?.id ?? null}
                valueLabel={orgUnit?.label ?? null}
                onSelect={(v) => {
                  setOrgUnit(v);
                  if (v) setEmployee(null); // mutually exclusive
                }}
                allowClear
              />
            </div>
          </div>

          <Separator className="my-2" />

          {/* Dates & Primary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from" className="text-sm font-medium">
                Effective From
              </Label>
              <Input
                id="from"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Start date (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to" className="text-sm font-medium">
                Effective To
              </Label>
              <Input
                id="to"
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                End date (optional)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Primary Assignment</Label>
              <p className="text-xs text-muted-foreground">
                Mark as the main schedule for this assignee
              </p>
            </div>
            <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={validateAndSubmit}
            disabled={busy}
            className="min-w-32 bg-emerald-600 hover:bg-emerald-700"
          >
            {busy ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create Assignment"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}