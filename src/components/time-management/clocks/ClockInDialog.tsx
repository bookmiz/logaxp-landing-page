"use client";

import * as React from "react";
import { LogIn, Sparkles } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import type { ClockInDto } from "@/logaxp/lib/time-management/timeManagement.types";
import { toIsoFromDateTimeLocal } from "./clock.utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultEmployeeId?: string | null;
  busy?: boolean;
  onClockIn: (dto: ClockInDto) => void | Promise<void>;
};

export function ClockInDialog({ open, onOpenChange, defaultEmployeeId, busy, onClockIn }: Props) {
  const [employeeId, setEmployeeId] = React.useState(defaultEmployeeId ?? "");
  const [locationId, setLocationId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [clockInLocal, setClockInLocal] = React.useState("");
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setEmployeeId(defaultEmployeeId ?? "");
    setLocationId("");
    setNotes("");
    setClockInLocal("");
    setErr("");
  }, [open, defaultEmployeeId]);

  const submit = async () => {
    setErr("");
    if (!employeeId.trim()) {
      setErr("Employee ID is required to clock in.");
      return;
    }

    await onClockIn({
      employeeId: employeeId.trim(),
      locationId: locationId.trim() || null,
      notes: notes.trim() || null,
      clockInAt: toIsoFromDateTimeLocal(clockInLocal) || null,
    });

    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Clock In"
      subtitle="Start an attendance record. Optionally set location and timestamp."
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <LogIn className="h-4 w-4" />
            Clock in
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Attendance
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            If you leave timestamp empty, backend should use “now”.
          </div>
        </div>

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {err}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Employee ID</div>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="employeeId…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Location ID (optional)</div>
            <input
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="locationId…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Clock-in time (optional)</div>
            <input
              type="datetime-local"
              value={clockInLocal}
              onChange={(e) => setClockInLocal(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Notes (optional)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional attendance notes…"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}