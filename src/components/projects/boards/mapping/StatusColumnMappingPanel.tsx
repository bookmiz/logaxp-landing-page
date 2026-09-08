"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Inbox,
  CheckCircle2,
  KanbanSquare,
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";

import type {
  Board,
  BoardColumn,
  Workflow,
  WorkflowStatus,
} from "@/logaxp/lib/project-management/projectManagement.types";

import {
  BoardWorkflowMappingV1,
  readBoardWorkflowMapping,
  writeBoardWorkflowMapping,
  getWorkflowById,
  getStatuses,
  normalizeColumns,
  autoMapStatusToColumn,
  validateMapping,
} from "./boardMapping.ui";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const UNMAPPED = "__UNMAPPED__";

/** ---------------------------------------
 * Small UI atoms
 * -------------------------------------- */
function Pill({
  children,
  tone = "neutral",
  title,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn";
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone === "warn"
          ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
          : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
      )}
    >
      {children}
    </span>
  );
}

function pickColumnIcon(c: BoardColumn) {
  if (c.isBacklog) return Inbox;
  if (c.isDone) return CheckCircle2;
  return KanbanSquare;
}

/** ---------------------------------------
 * Enterprise Select (Radix) for workflows
 * -------------------------------------- */
function WorkflowSelect({
  value,
  onValueChange,
  workflows,
  disabled,
}: {
  value: string;
  onValueChange: (v: string) => void;
  workflows: Workflow[];
  disabled?: boolean;
}) {
  const current = workflows.find((w) => String(w.id) === String(value)) ?? null;

  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger
        className={cx(
          "group inline-flex h-11 w-full items-center justify-between gap-3 rounded-2xl border px-3 text-left text-sm",
          "border-slate-200 bg-white text-slate-900 shadow-sm outline-none",
          "hover:bg-slate-50 focus:ring-2 focus:ring-slate-200",
          "disabled:opacity-60",
          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900/30 dark:focus:ring-slate-800"
        )}
        aria-label="Workflow"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            <Select.Value placeholder="Select workflow…">
              <span className="truncate">
                {current?.name ? String(current.name) : "Select workflow…"}
              </span>
            </Select.Value>

            {current?.isDefault ? (
              <Pill title="Default workflow">Default</Pill>
            ) : null}
          </div>

          <div className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {current?.id ? String(current.id) : ""}
          </div>
        </div>

        <Select.Icon className="text-slate-500 dark:text-slate-400">
          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className={cx(
            "z-[9999] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border shadow-2xl",
            "border-slate-200 bg-white",
            "dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <Select.ScrollUpButton className="flex items-center justify-center py-2 text-slate-600 dark:text-slate-300">
            <ChevronUp className="h-4 w-4" />
          </Select.ScrollUpButton>

          <Select.Viewport className="max-h-[320px] p-1">
            {workflows.map((w) => (
              <Select.Item
                key={w.id}
                value={String(w.id)}
                className={cx(
                  "relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none",
                  "text-slate-800 hover:bg-slate-50 data-[highlighted]:bg-slate-50",
                  "dark:text-slate-100 dark:hover:bg-slate-900/40 dark:data-[highlighted]:bg-slate-900/40"
                )}
              >
                <Select.ItemIndicator className="absolute left-2 inline-flex w-5 items-center justify-center">
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>

                <div className="min-w-0 pl-5">
                  <div className="flex items-center gap-2">
                    <Select.ItemText>
                      <span className="truncate font-medium">{String(w.name ?? "Workflow")}</span>
                    </Select.ItemText>
                    {w.isDefault ? <Pill>Default</Pill> : null}
                  </div>

                  <div className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {String(w.id)}
                  </div>
                </div>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center py-2 text-slate-600 dark:text-slate-300">
            <ChevronDown className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

/** ---------------------------------------
 * Enterprise Select (Radix) for columns
 * (used per-row in the mapping table)
 * -------------------------------------- */
function ColumnSelect({
  value, // "" means unmapped
  onValueChange,
  columns,
  disabled,
}: {
  value: string;
  onValueChange: (v: string) => void;
  columns: BoardColumn[];
  disabled?: boolean;
}) {
  const current =
    value && value !== UNMAPPED
      ? columns.find((c) => String(c.id) === String(value)) ?? null
      : null;

  const triggerLabel = current?.name ? String(current.name) : "Unmapped";

  return (
    <Select.Root
      value={value ? String(value) : UNMAPPED}
      onValueChange={(v) => onValueChange(v === UNMAPPED ? "" : v)}
      disabled={disabled}
    >
      <Select.Trigger
        className={cx(
          "group inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border px-3 text-sm",
          "border-slate-200 bg-white text-slate-900 outline-none",
          "hover:bg-slate-50 focus:ring-2 focus:ring-slate-200",
          "disabled:opacity-60",
          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900/30 dark:focus:ring-slate-800"
        )}
        aria-label="Maps to column"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {current ? (
              <span className="grid h-6 w-6 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {(() => {
                  const Icon = pickColumnIcon(current);
                  return <Icon className="h-3.5 w-3.5" />;
                })()}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">(none)</span>
            )}

            <span
              className={cx(
                "truncate",
                !current && "text-slate-500 dark:text-slate-400"
              )}
            >
              {triggerLabel}
            </span>

            {current?.isBacklog ? <Pill>Backlog</Pill> : null}
            {current?.isDone ? <Pill>Done</Pill> : null}
            {current?.wipLimit != null ? <Pill>WIP {current.wipLimit}</Pill> : null}
          </div>
        </div>

        <Select.Icon className="text-slate-500 dark:text-slate-400">
          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </Select.Icon>
      </Select.Trigger>

      {/* ✅ Portal = never clipped by table/card overflow */}
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className={cx(
            "z-[9999] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border shadow-2xl",
            "border-slate-200 bg-white",
            "dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <Select.ScrollUpButton className="flex items-center justify-center py-2 text-slate-600 dark:text-slate-300">
            <ChevronUp className="h-4 w-4" />
          </Select.ScrollUpButton>

          <Select.Viewport className="max-h-[340px] p-1">
            <Select.Item
              value={UNMAPPED}
              className={cx(
                "relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none",
                "text-slate-700 hover:bg-slate-50 data-[highlighted]:bg-slate-50",
                "dark:text-slate-200 dark:hover:bg-slate-900/40 dark:data-[highlighted]:bg-slate-900/40"
              )}
            >
              <Select.ItemIndicator className="absolute left-2 inline-flex w-5 items-center justify-center">
                <Check className="h-4 w-4" />
              </Select.ItemIndicator>

              <div className="pl-5">
                <Select.ItemText>Unmapped</Select.ItemText>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  No auto-placement for this status
                </div>
              </div>
            </Select.Item>

            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

            {columns.map((c) => {
              const Icon = pickColumnIcon(c);
              return (
                <Select.Item
                  key={c.id}
                  value={String(c.id)}
                  className={cx(
                    "relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none",
                    "text-slate-800 hover:bg-slate-50 data-[highlighted]:bg-slate-50",
                    "dark:text-slate-100 dark:hover:bg-slate-900/40 dark:data-[highlighted]:bg-slate-900/40"
                  )}
                >
                  <Select.ItemIndicator className="absolute left-2 inline-flex w-5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>

                  <div className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Select.ItemText>
                        <span className="truncate font-medium">{String(c.name ?? "-")}</span>
                      </Select.ItemText>

                      {c.isBacklog ? <Pill>Backlog</Pill> : null}
                      {c.isDone ? <Pill>Done</Pill> : null}
                      {c.wipLimit != null ? <Pill>WIP {c.wipLimit}</Pill> : null}
                    </div>

                    <div className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {String(c.key ?? "-")} • {String(c.id)}
                    </div>
                  </div>
                </Select.Item>
              );
            })}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center py-2 text-slate-600 dark:text-slate-300">
            <ChevronDown className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function StatusColumnMappingPanel({
  board,
  columns,
  workflows,
  busy,
  onSaveBoardMetadata,
}: {
  board: Board;
  columns: BoardColumn[];
  workflows: Workflow[];
  busy?: boolean;
  onSaveBoardMetadata: (metadata: unknown) => Promise<void> | void;
}) {
  const cols = React.useMemo(() => normalizeColumns(columns), [columns]);
  const existing = React.useMemo(
    () => readBoardWorkflowMapping(board),
    [board.id, board.metadata]
  );

  const [workflowId, setWorkflowId] = React.useState<string>(
    existing?.workflowId ?? workflows[0]?.id ?? ""
  );

  // ✅ Ensure workflowId becomes valid after async load
  React.useEffect(() => {
    if (!workflows.length) return;

    const ok = workflowId && workflows.some((w) => String(w.id) === String(workflowId));
    if (ok) return;

    const preferred =
      existing?.workflowId && workflows.some((w) => String(w.id) === String(existing.workflowId))
        ? String(existing.workflowId)
        : String(workflows[0].id);

    setWorkflowId(preferred);
  }, [workflows, workflowId, existing?.workflowId]);

  const wf = React.useMemo(
    () => getWorkflowById(workflows, workflowId),
    [workflows, workflowId]
  );

  const statuses = React.useMemo(() => getStatuses(wf), [wf]);

  const [statusToColumn, setStatusToColumn] = React.useState<Record<string, string>>(
    existing?.statusToColumn ?? {}
  );

  // ✅ keep only status ids that exist in chosen workflow
  React.useEffect(() => {
    const allowed = new Set(statuses.map((s) => String(s.id)));
    setStatusToColumn((prev) => {
      const next: Record<string, string> = {};
      for (const [sid, cid] of Object.entries(prev)) {
        if (allowed.has(String(sid))) next[sid] = cid;
      }
      return next;
    });
  }, [workflowId, statuses]);

  const validation = React.useMemo(
    () => validateMapping(statuses, cols, statusToColumn),
    [statuses, cols, statusToColumn]
  );

  const canSave = Boolean(board?.id && workflowId);
  const warnCount = validation.unmappedStatusIds.length + validation.invalidPairs.length;

  const onAutoMap = () => setStatusToColumn(autoMapStatusToColumn(statuses, cols));
  const onClear = () => setStatusToColumn({});

  const onSave = async () => {
    if (!canSave) return;

    const colSet = new Set(cols.map((c) => String(c.id)));
    const statusSet = new Set(statuses.map((s) => String(s.id)));

    const cleaned: Record<string, string> = {};
    for (const [sid, cid] of Object.entries(statusToColumn)) {
      if (!statusSet.has(String(sid))) continue;
      if (!cid || !colSet.has(String(cid))) continue;
      cleaned[sid] = cid;
    }

    const mapping: BoardWorkflowMappingV1 = {
      version: 1,
      workflowId,
      statusToColumn: cleaned,
    };

    const nextMetadata = writeBoardWorkflowMapping(board, mapping);
    await onSaveBoardMetadata(nextMetadata);
  };

  return (
    <div className="space-y-4">
      {/* ✅ Sticky enterprise top bar */}
      <div
        className={cx(
          "sticky top-0 z-10",
          "rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur",
          "dark:border-slate-800 dark:bg-slate-950/90"
        )}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Workflow for this board
              </div>

              <Pill>Statuses: {statuses.length}</Pill>
              <Pill>Columns: {cols.length}</Pill>

              {warnCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Warnings: {warnCount}
                </span>
              ) : null}
            </div>

            <WorkflowSelect
              value={workflowId}
              onValueChange={setWorkflowId}
              workflows={workflows}
              disabled={busy || workflows.length === 0}
            />

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Stored in{" "}
              <span className="font-mono">board.metadata.workflowMapping</span>.
              Dropdowns use a portal so they’ll never be clipped.
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              variant="outline"
              disabled={busy || !statuses.length || !cols.length}
              onClick={onAutoMap}
            >
              Auto map
            </Button>
            <Button variant="outline" disabled={busy} onClick={onClear}>
              Clear
            </Button>
            <Button disabled={busy || !canSave} onClick={onSave}>
              {busy ? "Saving..." : "Save mapping"}
            </Button>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {(validation.unmappedStatusIds.length > 0 || validation.invalidPairs.length > 0) ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="font-semibold">Mapping warnings</div>
          {validation.unmappedStatusIds.length > 0 ? (
            <div className="mt-1">
              {validation.unmappedStatusIds.length} status(es) are unmapped. Unmapped statuses won’t auto-place into a column.
            </div>
          ) : null}
          {validation.invalidPairs.length > 0 ? (
            <div className="mt-1">
              {validation.invalidPairs.length} mapping(s) reference columns that no longer exist.
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Mapping table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Maps to Column</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {statuses.length ? (
                statuses.map((s: WorkflowStatus) => {
                  const mapped = statusToColumn[s.id] ?? "";

                  return (
                    <tr key={s.id} className="bg-white dark:bg-slate-950">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {String(s.order ?? "-")}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-50">
                          {String(s.name ?? "-")}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {String(s.key ?? s.id)}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {String(s.category ?? "-")}
                      </td>

                      {/* ✅ Enterprise Column Select */}
                      <td className="px-4 py-3">
                        <ColumnSelect
                          value={mapped}
                          columns={cols}
                          disabled={busy || !cols.length}
                          onValueChange={(next) => {
                            setStatusToColumn((prev) => ({
                              ...prev,
                              [s.id]: next, // "" means Unmapped
                            }));
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="bg-white dark:bg-slate-950">
                  <td
                    className="px-4 py-8 text-center text-slate-600 dark:text-slate-300"
                    colSpan={4}
                  >
                    No statuses found for this workflow.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
        <div className="font-semibold text-slate-900 dark:text-slate-50">
          How this behaves (Better than Jira)
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <span className="font-medium">Status change</span> sets{" "}
            <span className="font-mono">columnId</span> automatically using this mapping.
          </li>
          <li>
            <span className="font-medium">Card drag</span> to a column sets{" "}
            <span className="font-mono">statusId</span> automatically by reverse-mapping column → status.
          </li>
          <li>Mapping lives per board, so different boards can visualize the same workflow differently.</li>
        </ul>
      </div>
    </div>
  );
}