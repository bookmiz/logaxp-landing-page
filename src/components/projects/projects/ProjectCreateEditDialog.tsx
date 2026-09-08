"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { useWorkflows } from "@/logaxp/hooks/workflows/useWorkflows";
import type { CreateProjectDto, Project, UpdateProjectDto, Workflow } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Mode = "create" | "edit";
const PROJECT_STATUSES = ["ACTIVE", "COMPLETED", "ARCHIVED"] as const;
const PROJECT_VISIBILITIES = ["TENANT", "PRIVATE", "PUBLIC"] as const;
const PROJECT_HEALTH = [
  { value: "ON_TRACK", label: "On track" },
  { value: "AT_RISK", label: "At risk" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "COMPLETED", label: "Completed" },
] as const;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function toDateInputValue(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function ProjectCreateEditDialog({
  open,
  onOpenChange,
  mode,
  project,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  project?: Project | null;
  busy?: boolean;
  onSubmit: (dto: CreateProjectDto | UpdateProjectDto) => Promise<void> | void;
}) {
  const isEdit = mode === "edit";
  const workflowsQuery = useWorkflows();
  const workflows = normalizeList<Workflow>(workflowsQuery.data).items;

  const [key, setKey] = React.useState(project?.key ?? "");
  const [name, setName] = React.useState(project?.name ?? "");
  const [description, setDescription] = React.useState(String(project?.description ?? ""));
  const [startDate, setStartDate] = React.useState(toDateInputValue(project?.startDate));
  const [targetDate, setTargetDate] = React.useState(toDateInputValue(project?.targetDate));
  const [status, setStatus] = React.useState(String(project?.status ?? "ACTIVE"));
  const [visibility, setVisibility] = React.useState(String(project?.visibility ?? "TENANT"));
  const [workflowId, setWorkflowId] = React.useState(String(project?.workflowId ?? ""));
  const [health, setHealth] = React.useState(String(record(project?.metadata).health ?? "ON_TRACK"));

  React.useEffect(() => {
    if (!open) return;
    setKey(project?.key ?? "");
    setName(project?.name ?? "");
    setDescription(String(project?.description ?? ""));
    setStartDate(toDateInputValue(project?.startDate));
    setTargetDate(toDateInputValue(project?.targetDate));
    setStatus(String(project?.status ?? "ACTIVE"));
    setVisibility(String(project?.visibility ?? "TENANT"));
    setWorkflowId(String(project?.workflowId ?? ""));
    setHealth(String(record(project?.metadata).health ?? "ON_TRACK"));
  }, [open, project?.id]);

  const dateError =
    startDate && targetDate && targetDate < startDate
      ? "Target date must be on or after the start date."
      : "";
  const canSubmit = Boolean(key.trim() && name.trim()) && !dateError;

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
                {isEdit ? "Edit project" : "New project"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {isEdit ? "Update project metadata." : "Create a new project workspace."}
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
            <Input
              label="Key"
              placeholder="e.g. LOGA"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
              hint={isEdit ? "Changing the key updates existing issue keys for this project." : "Used for work item keys like LOGA-1."}
            />

            <Input
              label="Name"
              placeholder="e.g. LogaXP Portal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Status</span>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {PROJECT_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item[0] + item.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Visibility</span>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                >
                  {PROJECT_VISIBILITIES.map((item) => (
                    <option key={item} value={item}>
                      {item[0] + item.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Workflow template</span>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950"
                value={workflowId}
                onChange={(event) => setWorkflowId(event.target.value)}
              >
                <option value="">Use tenant default workflow</option>
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {String(workflow.name ?? workflow.id)}
                    {workflow.isDefault ? " (default)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Health</span>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950"
                value={health}
                onChange={(event) => setHealth(event.target.value)}
              >
                {PROJECT_HEALTH.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                type="date"
                label="Start date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                hint="Optional planning start."
              />
              <Input
                type="date"
                label="Target date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                error={dateError || undefined}
                hint={!dateError ? "Optional planned finish." : undefined}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</div>
              <textarea
                className={cx(
                  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
                  "outline-none focus:ring-2 focus:ring-slate-200",
                  "dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                )}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
              />
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
                    key: key.trim(),
                    name: name.trim(),
                    description: description.trim() || undefined,
                    status,
                    visibility,
                    workflowId: workflowId || null,
                    startDate: startDate ? toIsoDate(startDate) : null,
                    targetDate: targetDate ? toIsoDate(targetDate) : null,
                    metadata: { health },
                  } satisfies UpdateProjectDto);
                } else {
                  await onSubmit({
                    key: key.trim(),
                    name: name.trim(),
                    description: description.trim() || undefined,
                    visibility,
                    workflowId: workflowId || undefined,
                    startDate: startDate ? toIsoDate(startDate) : undefined,
                    targetDate: targetDate ? toIsoDate(targetDate) : undefined,
                    metadata: { health },
                    // optional defaults
                    defaultBoardName: "Kanban",
                    defaultWorkflowName: "Default workflow",
                  } satisfies CreateProjectDto);
                }
              }}
            >
              {busy ? "Saving..." : isEdit ? "Save changes" : "Create project"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
