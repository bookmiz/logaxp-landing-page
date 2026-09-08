"use client";

import * as React from "react";
import { LogOut, Sparkles } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import type { ClockOutDto, TimeClock } from "@/logaxp/lib/time-management/timeManagement.types";
import { toIsoFromDateTimeLocal } from "./clock.utils";
import { formatIsoDateTime } from "@/logaxp/components/time-management/time.ui";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clock?: TimeClock | null;
  busy?: boolean;
  onClockOut: (clockId: string, dto: ClockOutDto) => void | Promise<void>;
};

export function ClockOutDialog({ open, onOpenChange, clock, busy, onClockOut }: Props) {
  const [notes, setNotes] = React.useState("");
  const [clockOutLocal, setClockOutLocal] = React.useState("");
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setNotes("");
    setClockOutLocal("");
    setErr("");
  }, [open]);

  const submit = async () => {
    setErr("");
    if (!clock?.id) {
      setErr("Missing open clock context.");
      return;
    }

    await onClockOut(clock.id, {
      notes: notes.trim() || null,
      clockOutAt: toIsoFromDateTimeLocal(clockOutLocal) || null,
    });

    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Clock Out"
      subtitle="Close the open attendance record."
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white">
            <LogOut className="h-4 w-4" />
            Clock out
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Open clock
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Clocked in: <span className="font-medium">{formatIsoDateTime(clock?.clockInAt ?? null)}</span>
          </div>
        </div>

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {err}
          </div>
        ) : null}

        <div className="grid gap-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Clock-out time (optional)</div>
            <input
              type="datetime-local"
              value={clockOutLocal}
              onChange={(e) => setClockOutLocal(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Notes (optional)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes…"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}