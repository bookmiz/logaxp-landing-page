"use client";

import * as React from "react";
import { Coffee, Sparkles } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import type { TimeClock } from "@/logaxp/lib/time-management/timeManagement.types";

type Mode = "add" | "set";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  clock?: TimeClock | null;
  busy?: boolean;
  onSubmit: (clockId: string, minutes: number) => void | Promise<void>;
};

export function BreakMinutesDialog({ open, onOpenChange, mode, clock, busy, onSubmit }: Props) {
  const [minutes, setMinutes] = React.useState<number>(0);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setMinutes(0);
    setErr("");
  }, [open]);

  const submit = async () => {
    setErr("");
    if (!clock?.id) {
      setErr("Missing clock context.");
      return;
    }
    const m = Number(minutes);
    if (!Number.isFinite(m) || m < 0) {
      setErr("Minutes must be a valid non-negative number.");
      return;
    }

    await onSubmit(clock.id, m);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={mode === "add" ? "Add Break Minutes" : "Set Break Minutes"}
      subtitle={mode === "add" ? "Increment break minutes on the open clock." : "Override break minutes on the open clock."}
      widthClassName="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <Coffee className="h-4 w-4" />
            {mode === "add" ? "Add" : "Set"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Breaks
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current break: <span className="font-medium">{Number(clock?.breakMinutes ?? 0)}m</span>
          </div>
        </div>

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {err}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Minutes</div>
          <input
            type="number"
            min={0}
            value={String(minutes)}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
          />
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Use <span className="font-medium">Add</span> for incremental breaks; use <span className="font-medium">Set</span> to correct to the exact total.
          </div>
        </div>
      </div>
    </Modal>
  );
}