"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import type { Board, CreateBoardDto, UpdateBoardDto } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Mode = "create" | "edit";

export function BoardCreateEditDialog({
  open,
  onOpenChange,
  mode,
  projectId,
  board,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  projectId: string;
  board?: Board | null;
  busy?: boolean;
  onSubmit: (dto: CreateBoardDto | UpdateBoardDto) => Promise<void> | void;
}) {
  const isEdit = mode === "edit";

  const [name, setName] = React.useState(board?.name ?? "");
  const [description, setDescription] = React.useState(String(board?.description ?? ""));
  const [type, setType] = React.useState(String(board?.type ?? "KANBAN"));
  const [isDefault, setIsDefault] = React.useState(Boolean(board?.isDefault ?? false));

  React.useEffect(() => {
    if (!open) return;
    setName(board?.name ?? "");
    setDescription(String(board?.description ?? ""));
    setType(String(board?.type ?? "KANBAN"));
    setIsDefault(Boolean(board?.isDefault ?? false));
  }, [open, board?.id]);

  const canSubmit = Boolean(name.trim());

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
                {isEdit ? "Edit board" : "New board"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {isEdit ? "Update board settings." : "Create a board for this project."}
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
            <Input label="Name" placeholder="e.g. Engineering board" value={name} onChange={(e) => setName(e.target.value)} />

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</div>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="KANBAN">KANBAN</option>
                <option value="SCRUM">SCRUM</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</div>
              <textarea
                className={cx(
                  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
                  "outline-none focus:ring-2 focus:ring-slate-200",
                  "dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                )}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
              />
            </div>

            <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
              <input type="checkbox" className="h-4 w-4 rounded" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              Set as default board
            </label>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={busy}>Cancel</Button>
            </Dialog.Close>

            <Button
              disabled={!canSubmit || busy}
              onClick={async () => {
                if (isEdit) {
                  await onSubmit({
                    name: name.trim(),
                    type,
                    description: description.trim() || undefined,
                    isDefault,
                  } satisfies UpdateBoardDto);
                } else {
                  await onSubmit({
                    projectId,
                    name: name.trim(),
                    type,
                    description: description.trim() || undefined,
                    isDefault,
                  } satisfies CreateBoardDto);
                }
              }}
            >
              {busy ? "Saving..." : isEdit ? "Save changes" : "Create board"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}