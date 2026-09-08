"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import type { CreateWorkflowStatusDto } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function makeKey(name: string) {
  const k = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return k.slice(0, 40) || "STATUS";
}

type Category = "TODO" | "IN_PROGRESS" | "DONE";

export function StatusCreateDialog({
  open,
  onOpenChange,
  nextOrder,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nextOrder: number;
  busy?: boolean;
  onSubmit: (dto: CreateWorkflowStatusDto) => Promise<void> | void;
}) {
  const [name, setName] = React.useState("");
  const [key, setKey] = React.useState("");
  const [category, setCategory] = React.useState<Category>("TODO");
  const [isDefault, setIsDefault] = React.useState(false);
  const [isTerminal, setIsTerminal] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setKey("");
    setCategory("TODO");
    setIsDefault(false);
    setIsTerminal(false);
  }, [open]);

  // Optional UX: suggest category from name (still strict)
  React.useEffect(() => {
    const n = name.trim().toLowerCase();
    if (!n) return;

    if (n.includes("done") || n.includes("closed") || n.includes("complete")) setCategory("DONE");
    else if (n.includes("progress") || n.includes("doing") || n.includes("review") || n.includes("qa"))
      setCategory("IN_PROGRESS");
    else setCategory("TODO");
  }, [name]);

  // ✅ terminal allowed only when category is DONE
React.useEffect(() => {
  if (category !== "DONE" && isTerminal) setIsTerminal(false);
}, [category, isTerminal]);

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
                New status
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Add a status to the workflow.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-3">
            <Input
              label="Name"
              placeholder="e.g. In Progress"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Key (optional)"
              placeholder="Auto-generated if empty"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
            />

            {/* ✅ Locked enum select */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Category</div>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                Default status
              </label>

              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={isTerminal}
                  onChange={(e) => setIsTerminal(e.target.checked)}
                />
                Terminal (done)
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={busy}>
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              disabled={!canSubmit || busy}
              onClick={async () => {
                await onSubmit({
                  key: (key.trim() || makeKey(name)).trim(),
                  name: name.trim(),
                  category, // ✅ strict enum
                  order: nextOrder,
                  isDefault,
                  isTerminal,
                } as CreateWorkflowStatusDto);
              }}
            >
              {busy ? "Creating..." : "Create"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}