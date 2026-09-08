"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import type {
  BoardColumn,
  CreateBoardColumnDto,
  UpdateBoardColumnDto,
} from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function makeKey(name: string) {
  const k = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return k.slice(0, 40) || "COLUMN";
}

type Mode = "create" | "edit";

export function ColumnCreateEditDialog({
  open,
  onOpenChange,
  mode,
  column,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  column?: BoardColumn | null;
  busy?: boolean;
  onSubmit: (dto: CreateBoardColumnDto | UpdateBoardColumnDto) => Promise<void> | void;
}) {
  const isEdit = mode === "edit";

  const [name, setName] = React.useState(column?.name ?? "");
  const [key, setKey] = React.useState(column?.key ?? "");
  const [wipLimit, setWipLimit] = React.useState<string>(column?.wipLimit != null ? String(column.wipLimit) : "");
  const [isBacklog, setIsBacklog] = React.useState(Boolean(column?.isBacklog ?? false));
  const [isDone, setIsDone] = React.useState(Boolean(column?.isDone ?? false));

  React.useEffect(() => {
    if (!open) return;
    setName(column?.name ?? "");
    setKey(column?.key ?? "");
    setWipLimit(column?.wipLimit != null ? String(column.wipLimit) : "");
    setIsBacklog(Boolean(column?.isBacklog ?? false));
    setIsDone(Boolean(column?.isDone ?? false));
  }, [open, column?.id]);

  const canSubmit = isEdit ? Boolean(name.trim()) : Boolean(name.trim() && (key.trim() || makeKey(name)));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className={cx(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-slate-200 bg-white p-4 shadow-xl",
            "dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {isEdit ? "Edit column" : "New column"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Columns power Kanban and WIP limits.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-3">
            <Input label="Name" placeholder="e.g. In Progress" value={name} onChange={(e) => setName(e.target.value)} />

            {!isEdit ? (
              <Input
                label="Key"
                placeholder="Auto-generated if empty"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
              />
            ) : null}

            <Input
              label="WIP limit (optional)"
              placeholder="e.g. 5"
              value={wipLimit}
              onChange={(e) => setWipLimit(e.target.value)}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
                <input type="checkbox" className="h-4 w-4 rounded" checked={isBacklog} onChange={(e) => setIsBacklog(e.target.checked)} />
                Backlog column
              </label>
              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
                <input type="checkbox" className="h-4 w-4 rounded" checked={isDone} onChange={(e) => setIsDone(e.target.checked)} />
                Done column
              </label>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={busy}>Cancel</Button>
            </Dialog.Close>

            <Button
              disabled={!canSubmit || busy}
              onClick={async () => {
                const w = wipLimit.trim() ? Number(wipLimit) : undefined;
                const wip = Number.isFinite(w as number) ? (w as number) : undefined;

                if (isEdit) {
                  await onSubmit({
                    name: name.trim(),
                    wipLimit: wipLimit.trim() ? (wip ?? null) : null,
                    isBacklog,
                    isDone,
                  } satisfies UpdateBoardColumnDto);
                } else {
                  await onSubmit({
                    key: (key.trim() || makeKey(name)).trim(),
                    name: name.trim(),
                    wipLimit: wip,
                    isBacklog,
                    isDone,
                  } satisfies CreateBoardColumnDto);
                }
              }}
            >
              {busy ? "Saving..." : isEdit ? "Save changes" : "Create column"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}