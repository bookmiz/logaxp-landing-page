"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import type { CloseSprintDto, Sprint } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function CloseSprintDialog({
  open,
  onOpenChange,
  sprint,
  sprints = [],
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sprint: Sprint | null;
  sprints?: Sprint[];
  busy?: boolean;
  onConfirm: (dto: CloseSprintDto) => Promise<void> | void;
}) {
  const [moveMode, setMoveMode] = React.useState<"keep" | "backlog" | "sprint">("keep");
  const [targetSprintId, setTargetSprintId] = React.useState("");
  const [summaryNote, setSummaryNote] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setMoveMode("keep");
    setTargetSprintId("");
    setSummaryNote("");
  }, [open, sprint?.id]);

  if (!sprint) return null;

  const targetOptions = sprints.filter(
    (candidate) => candidate.id !== sprint.id && String(candidate.status ?? "").toUpperCase() !== "CLOSED"
  );
  const canClose = moveMode !== "sprint" || Boolean(targetSprintId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className={cx("fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950")}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-50">Close sprint</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Close: <span className="font-medium">{String(sprint.name ?? "-")}</span>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
              LogaXP will capture completed and incomplete work, committed points, and the sprint closure summary.
            </div>

            <div className="space-y-2">
              <div className="font-medium text-slate-800 dark:text-slate-100">Incomplete work</div>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  className="mt-1"
                  checked={moveMode === "keep"}
                  onChange={() => setMoveMode("keep")}
                />
                <span>Keep incomplete items attached to the closed sprint.</span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  className="mt-1"
                  checked={moveMode === "backlog"}
                  onChange={() => setMoveMode("backlog")}
                />
                <span>Move incomplete items back to backlog.</span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  className="mt-1"
                  checked={moveMode === "sprint"}
                  onChange={() => setMoveMode("sprint")}
                />
                <span>Move incomplete items to another open sprint.</span>
              </label>
            </div>

            {moveMode === "sprint" ? (
              <div className="space-y-1">
                <div className="font-medium text-slate-800 dark:text-slate-100">Target sprint</div>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={targetSprintId}
                  onChange={(event) => setTargetSprintId(event.target.value)}
                >
                  <option value="">Select sprint</option>
                  {targetOptions.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {String(candidate.name ?? "Untitled sprint")}
                    </option>
                  ))}
                </select>
                {!targetOptions.length ? (
                  <div className="text-xs text-amber-700 dark:text-amber-300">No open target sprint is available.</div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1">
              <div className="font-medium text-slate-800 dark:text-slate-100">Close note</div>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                value={summaryNote}
                onChange={(event) => setSummaryNote(event.target.value)}
                placeholder="What changed, what shipped, what rolls over..."
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild><Button variant="outline" disabled={busy}>Cancel</Button></Dialog.Close>
            <Button
              disabled={busy || !canClose}
              onClick={() =>
                onConfirm({
                  moveIncompleteToBacklog: moveMode === "backlog",
                  targetSprintId: moveMode === "sprint" ? targetSprintId : null,
                  summaryNote: summaryNote.trim() || undefined,
                })
              }
            >
              {busy ? "Closing..." : "Close sprint"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
