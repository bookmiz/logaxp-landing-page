"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import type { Workflow } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function WorkflowRenameDialog({
  open,
  onOpenChange,
  workflow,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workflow: Workflow | null;
  busy?: boolean;
  onSubmit: (name: string) => Promise<void> | void;
}) {
  const [name, setName] = React.useState(workflow?.name ?? "");

  React.useEffect(() => {
    if (!open) return;
    setName(workflow?.name ?? "");
  }, [open, workflow?.id]);

  if (!workflow) return null;

  const canSubmit = Boolean(name.trim());

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className={cx(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-slate-200 bg-white p-4 shadow-xl",
            "dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-50">Rename workflow</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Workflow ID: <span className="font-mono text-xs">{workflow.id}</span>
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-3">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={busy}>Cancel</Button>
            </Dialog.Close>
            <Button disabled={!canSubmit || busy} onClick={() => onSubmit(name.trim())}>
              {busy ? "Saving..." : "Save"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}