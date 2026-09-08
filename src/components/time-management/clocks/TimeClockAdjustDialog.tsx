"use client";

import * as React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import type { TimeClock, TimeClockAdjustDto, TimeClockStatus } from "@/logaxp/lib/time-management/timeManagement.types";
import { toIsoFromDateTimeLocal, toDateTimeLocalFromIso } from "./clock.utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clock?: TimeClock | null;
  busy?: boolean;
  onAdjust: (clockId: string, dto: TimeClockAdjustDto) => void | Promise<void>;
};

export function TimeClockAdjustDialog({ open, onOpenChange, clock, busy, onAdjust }: Props) {
  const [status, setStatus] = React.useState<TimeClockStatus | "">("");
  const [clockInLocal, setClockInLocal] = React.useState("");
  const [clockOutLocal, setClockOutLocal] = React.useState("");
  const [breakMinutes, setBreakMinutes] = React.useState<string>("");
  const [locationId, setLocationId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    setStatus((clock?.status as any) ?? "");
    setClockInLocal(toDateTimeLocalFromIso(clock?.clockInAt ?? null));
    setClockOutLocal(toDateTimeLocalFromIso(clock?.clockOutAt ?? null));
    setBreakMinutes(clock?.breakMinutes != null ? String(clock.breakMinutes) : "");
    setLocationId(String(clock?.locationId ?? ""));
    setNotes(String(clock?.notes ?? ""));
    setErr("");
  }, [open, clock?.id]);

  const submit = async () => {
    setErr("");
    if (!clock?.id) {
      setErr("Missing clock context.");
      return;
    }

    const br = breakMinutes === "" ? undefined : Number(breakMinutes);
    if (br !== undefined && (!Number.isFinite(br) || br < 0)) {
      setErr("Break minutes must be a valid non-negative number.");
      return;
    }

    const dto: TimeClockAdjustDto = {
      status: (status || undefined) as any,
      clockInAt: toIsoFromDateTimeLocal(clockInLocal) || undefined,
      clockOutAt: clockOutLocal ? toIsoFromDateTimeLocal(clockOutLocal) : undefined,
      breakMinutes: br,
      locationId: locationId.trim() ? locationId.trim() : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    await onAdjust(clock.id, dto);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Adjust Time Clock"
      subtitle="Manager correction: timestamps, status, breaks, and notes."
      widthClassName="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <ShieldCheck className="h-4 w-4" />
            Save adjustment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Adjustment
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Use carefully — Stage 6 can add audit logging and approval workflows.
          </div>
        </div>

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {err}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            >
              <option value="">(no change)</option>
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ADJUSTED">ADJUSTED</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Location ID</div>
            <input
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="locationId…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Clock-in time</div>
            <input
              type="datetime-local"
              value={clockInLocal}
              onChange={(e) => setClockInLocal(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Clock-out time</div>
            <input
              type="datetime-local"
              value={clockOutLocal}
              onChange={(e) => setClockOutLocal(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Break minutes</div>
            <input
              type="number"
              min={0}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              placeholder="e.g. 30"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Adjustment notes…"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}