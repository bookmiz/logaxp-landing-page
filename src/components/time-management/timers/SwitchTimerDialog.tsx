"use client";

import * as React from "react";
import { GitMerge, Sparkles } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import type { SwitchTimerDto } from "@/logaxp/lib/time-management/timeManagement.types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  membershipId: string | null;
  defaultBillable?: boolean;
  busy?: boolean;
  onSwitch: (dto: SwitchTimerDto) => void | Promise<void>;
};

export function SwitchTimerDialog({
  open,
  onOpenChange,
  membershipId,
  defaultBillable,
  busy,
  onSwitch,
}: Props) {
  const [projectId, setProjectId] = React.useState("");
  const [workItemId, setWorkItemId] = React.useState("");
  const [billable, setBillable] = React.useState(Boolean(defaultBillable));
  const [notes, setNotes] = React.useState("");
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setProjectId("");
    setWorkItemId("");
    setBillable(Boolean(defaultBillable));
    setNotes("");
    setErr("");
  }, [open, defaultBillable]);

  const submit = async () => {
    setErr("");
    if (!membershipId) {
      setErr("Missing membership context.");
      return;
    }

    await onSwitch({
      membershipId,
      projectId: projectId.trim() || null,
      workItemId: workItemId.trim() || null,
      billable,
      notes: notes.trim() || null,
    });

    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Switch Timer"
      subtitle="Stop the current timer and immediately start a new one."
      widthClassName="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <GitMerge className="h-4 w-4" />
            Switch
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Switch
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Optionally mark the *stopped* timer as billable and attach notes.
          </div>
        </div>

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {err}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">New Project ID (optional)</div>
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="projectId…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">New Work Item ID (optional)</div>
            <input
              value={workItemId}
              onChange={(e) => setWorkItemId(e.target.value)}
              placeholder="workItemId…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Billable (stopped timer)</div>
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
              />
              Mark stopped time as billable
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Notes (stopped timer)</div>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}