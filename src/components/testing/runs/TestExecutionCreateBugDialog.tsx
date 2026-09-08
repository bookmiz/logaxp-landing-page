"use client";

import * as React from "react";
import type { CreateBugFromExecutionDto, TestExecution } from "@/logaxp/lib/testing/testing.types";

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

export function TestExecutionCreateBugDialog({
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
  onSubmit: (dto: CreateBugFromExecutionDto) => void | Promise<void>;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [labels, setLabels] = React.useState("");
  const [priority, setPriority] = React.useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");

  React.useEffect(() => {
    if (!open || !execution) return;
    setTitle(`Bug from execution ${execution.id}`);
    setDescription(execution.notes ?? "");
    setLabels("testing,automation");
    setPriority("MEDIUM");
  }, [open, execution]);

  const canSubmit = Boolean(execution);

  const submit = async () => {
    if (!execution) return;

    const dto: CreateBugFromExecutionDto = {
      title: title.trim() ? title.trim() : undefined,
      description: description.trim() ? description.trim() : undefined,
      labels: labels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      priority,
    };

    await onSubmit(dto);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Create Bug</DialogTitle>
          <DialogDescription>
            Convert this failing/blocking execution into a tracked work item (bug).
          </DialogDescription>
        </DialogHeader>

        {!execution ? (
          <div className="text-sm text-slate-500">No execution selected.</div>
        ) : (
          <div className="space-y-3">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Description</div>
              <textarea
                className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Steps to reproduce, expected vs actual, environment..."
              />
            </div>

            <Input
              label="Labels (comma-separated)"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="testing,regression,ui"
            />

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Priority</div>
              <div className="flex flex-wrap gap-2">
                {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={priority === p ? "default" : "outline"}
                    onClick={() => setPriority(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <div className="mb-1 font-medium">Payload preview</div>
              <pre className="overflow-x-auto">
                {JSON.stringify(
                  {
                    title: title.trim() || undefined,
                    description: description.trim() || undefined,
                    labels: labels
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    priority,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={busy} disabled={!canSubmit}>
            Create bug
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}