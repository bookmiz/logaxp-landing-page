"use client";

import * as React from "react";
import { AlertCircle, Clock } from "lucide-react";

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
import { Badge } from "@/logaxp/components/ui/badge";
import { Separator } from "@/logaxp/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";
import { cn } from "@/logaxp/lib/cn";

import {
  EmployeePicker,
  OrgUnitPicker,
  LocationPicker,
  PositionPicker,
  // CostCenterPicker, // if you add it to the dialog later
} from "@/logaxp/components/scheduling/SchedulePickers";

import { employeeManagementService } from "@/logaxp/lib/employee-management/employeeManagementService";

import type {
  Shift,
  CreateShiftDto,
  UpdateShiftDto,
} from "@/logaxp/lib/scheduling/scheduleManagement.types";

type Mode = "create" | "edit";
type PickerItem = { id: string; label: string };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** ISO -> datetime-local (LOCAL time, not UTC) */
function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

/** datetime-local -> ISO (UTC) */
function localInputToIso(local: string): string {
  const d = new Date(local); // interpreted as local time
  return d.toISOString();
}

/** labels for refs */
function orgUnitLabel(u: any) {
  return `${u?.name ?? "Org Unit"}${u?.code ? ` (${u.code})` : ""}`;
}
function locationLabel(l: any) {
  return `${l?.name ?? "Location"}${l?.code ? ` (${l.code})` : ""}`;
}
function positionLabel(p: any) {
  return `${p?.title ?? p?.name ?? "Position"}${p?.code ? ` (${p.code})` : ""}`;
}

/** choose primary assignment (prefer active primary, then any primary, then first) */
function pickPrimaryAssignment(emp: any) {
  const assignments: any[] = Array.isArray(emp?.assignments) ? emp.assignments : [];
  if (!assignments.length) return null;

  const now = Date.now();

  const activePrimary = assignments.find((a) => {
    if (!a?.isPrimary) return false;
    const to = a?.effectiveTo ? new Date(a.effectiveTo).getTime() : Infinity;
    return to > now;
  });
  if (activePrimary) return activePrimary;

  const anyPrimary = assignments.find((a) => a?.isPrimary);
  if (anyPrimary) return anyPrimary;

  return assignments[0] ?? null;
}

export function ShiftCreateEditDialog({
  open,
  onOpenChange,
  mode,
  shift,
  busy,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  shift?: Shift | null;
  busy?: boolean;
  onCreate: (dto: CreateShiftDto) => void | Promise<void>;
  onUpdate: (id: string, dto: UpdateShiftDto) => void | Promise<void>;
}) {
  const [employee, setEmployee] = React.useState<PickerItem | null>(null);
  const [orgUnit, setOrgUnit] = React.useState<PickerItem | null>(null);
  const [location, setLocation] = React.useState<PickerItem | null>(null);
  const [position, setPosition] = React.useState<PickerItem | null>(null);

  // “dirty flags”: if user manually changes, we stop auto-overwriting
  const [orgUnitDirty, setOrgUnitDirty] = React.useState(false);
  const [locationDirty, setLocationDirty] = React.useState(false);
  const [positionDirty, setPositionDirty] = React.useState(false);

  const [startAt, setStartAt] = React.useState("");
  const [endAt, setEndAt] = React.useState("");
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED" | "CANCELED">("DRAFT");
  const [notes, setNotes] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);

  // cache employee defaults so we don't refetch repeatedly
  const defaultsCache = React.useRef(
    new Map<
      string,
      {
        orgUnit: PickerItem | null;
        location: PickerItem | null;
        position: PickerItem | null;
      }
    >()
  );

  // avoid race conditions when rapidly switching employees
  const applySeq = React.useRef(0);
  const employeeIdRef = React.useRef<string | null>(null);

  const loadEmployeeDefaults = React.useCallback(async (employeeId: string) => {
    const cached = defaultsCache.current.get(employeeId);
    if (cached) return cached;

    const res = await employeeManagementService.getEmployee(employeeId);
    const emp = (res as any)?.data ?? res;

    const primary = pickPrimaryAssignment(emp);

    const org =
      primary?.orgUnitId || primary?.orgUnit?.id
        ? {
            id: String(primary?.orgUnitId ?? primary?.orgUnit?.id),
            label: primary?.orgUnit ? orgUnitLabel(primary.orgUnit) : "Org Unit",
          }
        : null;

    const loc =
      primary?.locationId || primary?.location?.id
        ? {
            id: String(primary?.locationId ?? primary?.location?.id),
            label: primary?.location ? locationLabel(primary.location) : "Location",
          }
        : null;

    const pos =
      primary?.positionId || primary?.position?.id
        ? {
            id: String(primary?.positionId ?? primary?.position?.id),
            label: primary?.position ? positionLabel(primary.position) : "Position",
          }
        : null;

    const out = { orgUnit: org, location: loc, position: pos };
    defaultsCache.current.set(employeeId, out);
    return out;
  }, []);

  const applyEmployeeDefaults = React.useCallback(
    async (employeeId: string, opts?: { force?: boolean }) => {
      const force = Boolean(opts?.force);

      const mySeq = ++applySeq.current;
      const defaults = await loadEmployeeDefaults(employeeId);

      // if another employee selection happened while awaiting, ignore
      if (mySeq !== applySeq.current) return;
      if (employeeIdRef.current !== employeeId) return;

      // Apply only if not dirty OR force
      if (force || !orgUnitDirty) setOrgUnit(defaults.orgUnit);
      if (force || !locationDirty) setLocation(defaults.location);
      if (force || !positionDirty) setPosition(defaults.position);
    },
    [loadEmployeeDefaults, orgUnitDirty, locationDirty, positionDirty]
  );

  React.useEffect(() => {
    if (!open) return;

    setError(null);

    // reset dirty flags whenever dialog opens
    setOrgUnitDirty(false);
    setLocationDirty(false);
    setPositionDirty(false);

    if (mode === "edit" && shift) {
      const emp = shift.employeeId
        ? { id: String(shift.employeeId), label: String((shift as any).employeeName ?? "Employee") }
        : null;
      setEmployee(emp);
      employeeIdRef.current = emp?.id ?? null;

      setOrgUnit(
        shift.orgUnitId
          ? { id: String(shift.orgUnitId), label: String((shift as any).orgUnitName ?? "Org Unit") }
          : null
      );

      setLocation(
        shift.locationId
          ? { id: String(shift.locationId), label: String((shift as any).locationName ?? "Location") }
          : null
      );

      setPosition(
        shift.positionId
          ? { id: String(shift.positionId), label: String((shift as any).positionName ?? "Position") }
          : null
      );

      setStartAt(isoToLocalInput(shift.startAt as any));
      setEndAt(isoToLocalInput(shift.endAt as any));
      setStatus(((shift.status as any) ?? "DRAFT") as any);
      setNotes((shift as any).notes ?? "");

      // OPTIONAL enhancement:
      // If editing and employee is set but some fields are empty, auto-fill missing fields.
      // This avoids “blank” orgUnit/location/position in old records.
      if (emp?.id) {
        void applyEmployeeDefaults(emp.id, { force: false });
      }
    } else {
      setEmployee(null);
      employeeIdRef.current = null;

      setOrgUnit(null);
      setLocation(null);
      setPosition(null);

      setStartAt("");
      setEndAt("");
      setStatus("DRAFT");
      setNotes("");
    }
  }, [open, mode, shift, applyEmployeeDefaults]);

  const handleSubmit = async () => {
    setError(null);

    if (!startAt || !endAt) {
      setError("Start and end time are required.");
      return;
    }

    const startIso = localInputToIso(startAt);
    const endIso = localInputToIso(endAt);

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setError("End time must be after start time.");
      return;
    }

    // business rule: allow employee OR orgUnit; you can keep this
    if (!employee?.id && !orgUnit?.id) {
      setError("Select either an employee or an organization unit.");
      return;
    }

    const dto: CreateShiftDto | UpdateShiftDto = {
      startAt: startIso,
      endAt: endIso,
      employeeId: employee?.id ?? null,
      orgUnitId: orgUnit?.id ?? null,
      locationId: location?.id ?? null,
      positionId: position?.id ?? null,
      status,
      source: "MANUAL",
      notes: notes.trim() || null,
    } as any;

    try {
      if (mode === "create") {
        await onCreate(dto as CreateShiftDto);
      } else if (shift?.id) {
        await onUpdate(String(shift.id), dto as UpdateShiftDto);
      }
      onOpenChange(false);
    } catch {
      setError("Failed to save shift. Please check your input and try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {mode === "create" ? "Create Shift" : "Edit Shift"}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Manually assign a work shift with time, assignee, and details.
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Clock className="h-3.5 w-3.5" />
              {status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Assignee */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Employee {!employee && !orgUnit && <span className="text-destructive">*</span>}
              </Label>
              <EmployeePicker
                valueId={employee?.id ?? null}
                valueLabel={employee?.label ?? null}
                onSelect={(v) => {
                  setEmployee(v);
                  employeeIdRef.current = v?.id ?? null;

                  // When employee changes, reset dirty so we can safely auto-fill from that employee
                  setOrgUnitDirty(false);
                  setLocationDirty(false);
                  setPositionDirty(false);

                  if (v?.id) {
                    // do not mark fields dirty; just apply defaults
                    void applyEmployeeDefaults(v.id, { force: true });
                  } else {
                    // cleared employee: do nothing; keep orgUnit/location/position as user set them
                  }
                }}
                allowClear
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Organization Unit</Label>
              <OrgUnitPicker
                valueId={orgUnit?.id ?? null}
                valueLabel={orgUnit?.label ?? null}
                onSelect={(v) => {
                  setOrgUnit(v);
                  setOrgUnitDirty(true);
                }}
                allowClear
              />
            </div>
          </div>

          <Separator />

          {/* Location & Position */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Location & Position</Label>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!employee?.id}
                onClick={() => {
                  if (!employee?.id) return;
                  setOrgUnitDirty(false);
                  setLocationDirty(false);
                  setPositionDirty(false);
                  void applyEmployeeDefaults(employee.id, { force: true });
                }}
              >
                Use employee defaults
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <LocationPicker
                  valueId={location?.id ?? null}
                  valueLabel={location?.label ?? null}
                  onSelect={(v) => {
                    setLocation(v);
                    setLocationDirty(true);
                  }}
                  allowClear
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Position</Label>
                <PositionPicker
                  valueId={position?.id ?? null}
                  valueLabel={position?.label ?? null}
                  onSelect={(v) => {
                    setPosition(v);
                    setPositionDirty(true);
                  }}
                  allowClear
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start" className="text-sm font-medium">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className={cn(!startAt && error && "border-destructive")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end" className="text-sm font-medium">
                End Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className={cn(!endAt && error && "border-destructive")}
              />
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional shift notes, comments, or instructions…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={busy}
            className="min-w-32 bg-emerald-600 hover:bg-emerald-700"
          >
            {busy ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create Shift"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}