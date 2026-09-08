"use client";

import * as React from "react";
import { AlertCircle, CalendarDays, User } from "lucide-react";

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
import { Textarea } from "@/logaxp/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";
import { cn } from "@/logaxp/lib/cn";

import { EmployeePicker } from "../../scheduling/SchedulePickers";

import type {
  LeaveRequest,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  LeaveType,
} from "@/logaxp/lib/leave/leave.types";
import { isRequested, shortId, unwrapApi } from "@/logaxp/lib/leave/leave.types";
import { useCheckLeaveOverlap } from "@/logaxp/hooks/leave/useLeaveRequests";

// Example LeaveType options (expand as needed)
const LEAVE_TYPES: LeaveType[] = ["VACATION", "SICK", "PERSONAL", "UNPAID", "OTHER"];

type Mode = "create" | "edit";

export function LeaveCreateEditDialog({
  open,
  onOpenChange,
  mode,
  row,
  busy,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  row?: LeaveRequest | null;
  busy?: boolean;
  onCreate: (dto: CreateLeaveRequestDto) => void | Promise<void>;
  onUpdate: (id: string, dto: UpdateLeaveRequestDto) => void | Promise<void>;
}) {
  const overlapM = useCheckLeaveOverlap();

  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [employeeLabel, setEmployeeLabel] = React.useState<string | null>(null);

  const [type, setType] = React.useState<LeaveType>("VACATION");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [reason, setReason] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [overlap, setOverlap] = React.useState<{ overlaps: boolean; conflictingId: string | null } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setOverlap(null);

    if (mode === "edit" && row) {
      const empId = String(row.employeeId ?? "");
      setEmployeeId(empId);
      // Use a fallback label; ideally fetch real name later via employeeId
      setEmployeeLabel(String(row.employee?.name || `Employee ${shortId(empId)}`));
      setType((row.type as LeaveType) ?? "VACATION");
      setStartDate(row.startDate ? new Date(row.startDate).toISOString().slice(0, 10) : "");
      setEndDate(row.endDate ? new Date(row.endDate).toISOString().slice(0, 10) : "");
      setReason(String(row.reason ?? ""));
    } else {
      setEmployeeId(null);
      setEmployeeLabel(null);
      setType("VACATION");
      setStartDate("");
      setEndDate("");
      setReason("");
    }
  }, [open, mode, row]);

  // Overlap check (debounced)
  // Overlap check (debounced + deduped)
const lastOverlapKeyRef = React.useRef<string>("");
const overlapTimerRef = React.useRef<number | null>(null);

React.useEffect(() => {
  if (!open) return;

  // clear any pending debounce timer
  if (overlapTimerRef.current) {
    window.clearTimeout(overlapTimerRef.current);
    overlapTimerRef.current = null;
  }

  // reset when incomplete
  if (!employeeId || !startDate || !endDate) {
    lastOverlapKeyRef.current = "";
    setOverlap(null);
    return;
  }

  // basic range sanity
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (e < s) {
    lastOverlapKeyRef.current = "";
    setOverlap(null);
    return;
  }

  const excludeId = mode === "edit" && row?.id ? String(row.id) : "";
  const key = `${employeeId}|${startDate}|${endDate}|${excludeId}`;

  // dedupe identical inputs (prevents repeated calls on rerenders)
  if (key === lastOverlapKeyRef.current) return;

  overlapTimerRef.current = window.setTimeout(async () => {
    // mark this key as requested BEFORE calling (prevents “pending rerender loop”)
    lastOverlapKeyRef.current = key;

    try {
      const res = await overlapM.mutateAsync({
        employeeId,
        startDate, // "YYYY-MM-DD" ok
        endDate,
        ...(excludeId ? { excludeId } : {}),
      });

      const data = (unwrapApi<any>(res as any) ?? (res as any)) as any;

      setOverlap({
        overlaps: Boolean(data?.overlaps),
        conflictingId: (data?.conflictingId ?? null) as string | null,
      });
    } catch {
      // allow retry on next change
      lastOverlapKeyRef.current = "";
      setOverlap(null);
    }
  }, 450);

  return () => {
    if (overlapTimerRef.current) window.clearTimeout(overlapTimerRef.current);
  };

// IMPORTANT: do NOT put `overlapM` in deps
}, [open, employeeId, startDate, endDate, mode, row?.id]);

  const submitting = busy || overlapM.isPending;

  const handleSubmit = async () => {
    setError(null);

    if (mode === "edit" && row && !isRequested(row.status)) {
      setError("Only REQUESTED leave can be edited.");
      return;
    }

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }
    if (!type) {
      setError("Leave type is required.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Start and end dates are required.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setError("End date must be on or after start date.");
      return;
    }

    if (overlap?.overlaps) {
      setError(
        `Date range overlaps with existing request${
          overlap.conflictingId ? ` (ID ${shortId(overlap.conflictingId)})` : ""
        }. Adjust dates or resolve conflict.`
      );
      return;
    }

    const startIso = `${startDate}T00:00:00.000Z`;
    const endIso = `${endDate}T23:59:59.999Z`;

    try {
      if (mode === "create") {
        await onCreate({
          employeeId,
          type,
          startDate: startIso,
          endDate: endIso,
          reason: reason.trim() || null,
        });
      } else if (row?.id) {
        await onUpdate(String(row.id), {
          type,
          startDate: startIso,
          endDate: endIso,
          reason: reason.trim() || null,
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save leave request.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {mode === "create" ? "Create Leave Request" : "Edit Leave Request"}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Request time off with overlap protection for scheduling integrity.
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {type}
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

          {overlapM.isPending && (
            <div className="text-sm text-muted-foreground italic">
              Checking for overlapping requests...
            </div>
          )}

          {/* Employee & Type */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Employee <span className="text-destructive">*</span>
              </Label>
              <EmployeePicker
                valueId={employeeId}
                valueLabel={employeeLabel}
                onSelect={(item) => {
                  setEmployeeId(item?.id ?? null);
                  setEmployeeLabel(item?.label ?? null);
                }}
                allowClear={true}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Leave Type <span className="text-destructive">*</span></Label>
              <Select value={type} onValueChange={(v) => setType(v as LeaveType)}>
                <SelectTrigger className={cn(!type && error && "border-destructive")}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(!startDate && error && "border-destructive")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className={cn(!endDate && error && "border-destructive")}
              />
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason / Notes
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Medical certificate required? Emergency? Vacation plans?..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="min-w-32 bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create Request"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}