"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import type { Sprint } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function StartSprintDialog({
  open,
  onOpenChange,
  sprint,
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sprint: Sprint | null;
  busy?: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  if (!sprint) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className={cx("fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950")}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-50">Start sprint</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Start: <span className="font-medium">{String(sprint.name ?? "-")}</span>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            This will mark the sprint as active (server endpoint: <span className="font-mono text-xs">POST /sprints/:id/start</span>).
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild><Button variant="outline" disabled={busy}>Cancel</Button></Dialog.Close>
            <Button disabled={busy} onClick={onConfirm}>{busy ? "Starting..." : "Start"}</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}