"use client";

import * as React from "react";
import { Trash2, Plus } from "lucide-react";

import type { TestCase } from "@/logaxp/lib/testing/testing.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Badge } from "@/logaxp/components/ui/badge";

export function TestCaseCoverageDialog({
  open,
  onOpenChange,
  testCase,
  busy,
  onAdd,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  testCase: TestCase | null;
  busy?: boolean;
  onAdd: (workItemId: string) => void | Promise<void>;
  onRemove: (workItemId: string) => void | Promise<void>;
}) {
  const [workItemId, setWorkItemId] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setWorkItemId("");
  }, [open]);

  const coverage = Array.isArray(testCase?.coverageWorkItemIds) ? testCase!.coverageWorkItemIds! : [];

  const add = async () => {
    const id = workItemId.trim();
    if (!id) return;
    await onAdd(id);
    setWorkItemId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Coverage</DialogTitle>
          <DialogDescription>
            Link this test case to work items (bugs, stories, tasks). Store IDs exactly as your work tracker uses them.
          </DialogDescription>
        </DialogHeader>

        {!testCase ? (
          <div className="text-sm text-slate-500">No test case selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{testCase.title}</div>
              <div className="mt-0.5 text-xs text-slate-500">{testCase.id}</div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <Input
                label="Work Item ID"
                value={workItemId}
                onChange={(e) => setWorkItemId(e.target.value)}
                placeholder="e.g., HR-123 or BUG-998"
              />
              <Button onClick={() => void add()} disabled={busy || !workItemId.trim()}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-50">Linked work items</div>

              {coverage.length === 0 ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">No linked work items yet.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {coverage.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs dark:border-slate-800 dark:bg-slate-950"
                    >
                      <Badge variant="muted" className="rounded-full">
                        {id}
                      </Badge>
                      <button
                        type="button"
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
                        onClick={() => void onRemove(id)}
                        disabled={busy}
                        title="Remove coverage"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}