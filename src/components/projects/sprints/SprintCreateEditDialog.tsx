"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import type { Board, CreateSprintDto, Sprint, UpdateSprintDto } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Mode = "create" | "edit";

function toDateInputValue(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function SprintCreateEditDialog({
  open,
  onOpenChange,
  mode,
  projectId,
  boards,
  sprint,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  projectId: string;
  boards: Board[];
  sprint?: Sprint | null;
  busy?: boolean;
  onSubmit: (dto: CreateSprintDto | UpdateSprintDto) => Promise<void> | void;
}) {
  const isEdit = mode === "edit";

  const [name, setName] = React.useState(sprint?.name ?? "");
  const [goal, setGoal] = React.useState(String(sprint?.goal ?? ""));
  const [status, setStatus] = React.useState(String(sprint?.status ?? "PLANNED"));
  const [startAt, setStartAt] = React.useState(toDateInputValue(sprint?.startAt));
  const [endAt, setEndAt] = React.useState(toDateInputValue(sprint?.endAt));
  const [boardId, setBoardId] = React.useState(String(sprint?.boardId ?? ""));
  const [capacityPoints, setCapacityPoints] = React.useState(
    sprint?.capacityPoints !== null && sprint?.capacityPoints !== undefined ? String(sprint.capacityPoints) : ""
  );

  React.useEffect(() => {
    if (!open) return;
    setName(sprint?.name ?? "");
    setGoal(String(sprint?.goal ?? ""));
    setStatus(String(sprint?.status ?? "PLANNED"));
    setStartAt(toDateInputValue(sprint?.startAt));
    setEndAt(toDateInputValue(sprint?.endAt));
    setBoardId(String(sprint?.boardId ?? ""));
    setCapacityPoints(
      sprint?.capacityPoints !== null && sprint?.capacityPoints !== undefined ? String(sprint.capacityPoints) : ""
    );
  }, [open, sprint?.id]);

  const dateError = startAt && endAt && endAt < startAt ? "End date must be on or after the start date." : "";
  const capacityValue = capacityPoints.trim() ? Number(capacityPoints) : null;
  const capacityError = capacityValue !== null && (!Number.isFinite(capacityValue) || capacityValue < 0)
    ? "Capacity must be zero or greater."
    : "";
  const canSubmit = Boolean(name.trim()) && !dateError && !capacityError;

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
                {isEdit ? "Edit sprint" : "New sprint"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Sprints group work items and drive the sprint lifecycle.
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
            <Input label="Name" placeholder="e.g. Sprint 1" value={name} onChange={(e) => setName(e.target.value)} />

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Goal</div>
              <textarea
                className={cx(
                  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
                  "outline-none focus:ring-2 focus:ring-slate-200",
                  "dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                )}
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Optional sprint goal..."
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                type="date"
                label="Start date"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                hint="Optional sprint start."
              />
              <Input
                type="date"
                label="End date"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                error={dateError || undefined}
                hint={!dateError ? "Optional sprint finish." : undefined}
              />
            </div>

            <Input
              type="number"
              min="0"
              step="0.5"
              label="Capacity"
              value={capacityPoints}
              onChange={(e) => setCapacityPoints(e.target.value)}
              error={capacityError || undefined}
              hint={!capacityError ? "Story points or planned effort for this sprint." : undefined}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</div>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Board (optional)</div>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                >
                  <option value="">No board</option>
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {String(b.name ?? "Untitled")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                    boardId: boardId || null,
                    name: name.trim(),
                    goal: goal.trim() || undefined,
                    status,
                    startAt: startAt ? toIsoDate(startAt) : null,
                    endAt: endAt ? toIsoDate(endAt) : null,
                    capacityPoints: capacityValue,
                  } satisfies UpdateSprintDto);
                } else {
                  await onSubmit({
                    projectId,
                    boardId: boardId || undefined,
                    name: name.trim(),
                    goal: goal.trim() || undefined,
                    status,
                    startAt: startAt ? toIsoDate(startAt) : undefined,
                    endAt: endAt ? toIsoDate(endAt) : undefined,
                    capacityPoints: capacityValue,
                  } satisfies CreateSprintDto);
                }
              }}
            >
              {busy ? "Saving..." : isEdit ? "Save changes" : "Create sprint"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
