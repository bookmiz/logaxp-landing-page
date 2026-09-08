"use client";

import * as React from "react";
import type { TestExecution, TestExecutionStatus, UpdateTestExecutionDto } from "@/logaxp/lib/testing/testing.types";
import { normalizeExecutionStatus } from "@/logaxp/components/testing/testing.ui";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";

const STATUSES: Array<{ value: TestExecutionStatus; label: string }> = [
  { value: "PASS", label: "Passed" },
  { value: "FAIL", label: "Failed" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "SKIPPED", label: "Not started" },
];

export function TestExecutionEditDialog({
  open,
  onOpenChange,
  execution,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  execution: TestExecution | null;
  busy?: boolean;
  onSubmit: (dto: UpdateTestExecutionDto) => void | Promise<void>;
}) {
  const [status, setStatus] = React.useState<TestExecutionStatus>("PASS");
  const [notes, setNotes] = React.useState("");
  const [durationSeconds, setDurationSeconds] = React.useState<string>("");

  React.useEffect(() => {
    if (!open || !execution) return;
    setStatus(normalizeExecutionStatus(execution.status) as TestExecutionStatus);
    setNotes(execution.notes ?? "");
    const seconds = typeof execution.durationMs === "number" ? Math.round(execution.durationMs / 1000) : execution.durationSeconds;
    setDurationSeconds(typeof seconds === "number" && Number.isFinite(seconds) ? String(seconds) : "");
  }, [open, execution]);

  const canSubmit = Boolean(execution);

  const submit = async () => {
    if (!execution) return;
    const d = durationSeconds.trim() === "" ? undefined : Math.max(0, Math.floor(Number(durationSeconds)));
    await onSubmit({
      status,
      notes: notes.trim() ? notes.trim() : null,
      durationSeconds: Number.isFinite(d as any) ? (d as number) : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Edit execution</DialogTitle>
          <DialogDescription>Update the result, notes, and timing for this test case execution.</DialogDescription>
        </DialogHeader>

        {!execution ? (
          <div className="text-sm text-slate-500">No execution selected.</div>
        ) : (
          <div className="space-y-3">
            <Select value={status} onValueChange={(v) => setStatus(v as TestExecutionStatus)}>
              <SelectTrigger label="Status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Execution status</SelectLabel>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              label="Duration (seconds)"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              placeholder="e.g., 45"
              hint="Optional. Useful for reporting and identifying slow tests."
            />

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Notes</div>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="What happened? Add repro notes, environment info, blockers, links..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={() => void submit()} loading={busy} disabled={!canSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
