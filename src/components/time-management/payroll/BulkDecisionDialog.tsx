"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";

export function BulkDecisionDialog({
  open,
  onOpenChange,
  mode,
  count,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "approve" | "reject";
  count: number;
  busy?: boolean;
  onSubmit: (dto: { decisionNote?: string | null }) => void | Promise<void>;
}) {
  const [decisionNote, setDecisionNote] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setDecisionNote("");
  }, [open]);

  const submit = async () => {
    await onSubmit({ decisionNote: decisionNote.trim() || null });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={mode === "approve" ? "Bulk approve" : "Bulk reject"}
      subtitle={`You are about to ${mode} ${count} timesheet(s). This is auditable.`}
      widthClassName="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <Save className="h-4 w-4" />
            {mode === "approve" ? "Approve" : "Reject"}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Decision note (optional)</div>
        <textarea
          value={decisionNote}
          onChange={(e) => setDecisionNote(e.target.value)}
          rows={4}
          placeholder="Add a decision note…"
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
        />
      </div>
    </Modal>
  );
}