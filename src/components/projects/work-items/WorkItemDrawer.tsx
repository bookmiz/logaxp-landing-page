"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import {
  X,
  Pencil,
  ExternalLink,
  Hash,
  LayoutGrid,
  Columns3,
  Workflow,
  ArrowRightLeft,
  Clipboard,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/logaxp/components/ui/button";
import type {
  Board,
  BoardColumn,
  WorkItem,
  Workflow as WorkflowEntity,
  WorkflowStatus,
} from "@/logaxp/lib/project-management/projectManagement.types";

import { TypeBadge } from "./TypeBadge";
import { PriorityPill } from "./PriorityPill";
import { useUpdateWorkItem } from "@/logaxp/hooks/work-items/useWorkItemMutations";

import {
  readBoardWorkflowMapping,
  getWorkflowById,
  getStatuses,
  invertStatusToColumn,
} from "@/logaxp/components/projects/boards/mapping/boardMapping.ui";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type WorkItemDrawerBoardContext = {
  board: Board;
  workflows: WorkflowEntity[];
  columns: BoardColumn[];
};

export function WorkItemDrawer({
  open,
  onOpenChange,
  item,
  onEdit,
  boardContext,
  onItemUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: WorkItem | null;
  onEdit: (w: WorkItem) => void;
  boardContext?: WorkItemDrawerBoardContext;
  onItemUpdated?: (next: WorkItem) => void;
}) {
  const update = useUpdateWorkItem();

  const [local, setLocal] = React.useState<WorkItem | null>(item);

  React.useEffect(() => {
    setLocal(item);
  }, [item?.id, open]);

  // -----------------------------
  // Board-context mapping + options
  // -----------------------------
  const mapping = boardContext ? readBoardWorkflowMapping(boardContext.board) : null;

  const mappedWorkflow =
    boardContext && mapping ? getWorkflowById(boardContext.workflows, mapping.workflowId) : null;

  const statusOptions: WorkflowStatus[] = React.useMemo(
    () => getStatuses(mappedWorkflow),
    [mappedWorkflow]
  );

  const columnsSorted = React.useMemo(() => {
    const cols = [...(boardContext?.columns ?? [])];
    cols.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return cols;
  }, [boardContext?.columns]);

  const statusById = React.useMemo(() => {
    const m = new Map<string, WorkflowStatus>();
    for (const s of statusOptions) m.set(s.id, s);
    return m;
  }, [statusOptions]);

  const columnById = React.useMemo(() => {
    const map = new Map<string, BoardColumn>();
    for (const c of boardContext?.columns ?? []) map.set(c.id, c);
    return map;
  }, [boardContext?.columns]);

  const columnToStatus = React.useMemo(() => {
    return mapping ? invertStatusToColumn(mapping.statusToColumn) : {};
  }, [mapping?.workflowId, (mapping as any)?.statusToColumn]);

  const canUseStatusDropdown =
    Boolean(boardContext?.board?.id) &&
    Boolean(mapping?.workflowId) &&
    statusOptions.length > 0;

  const canUseColumnDropdown =
    Boolean(boardContext?.board?.id) && columnsSorted.length > 0;

  if (!local) return null;

  const workKey = String(local.key ?? "").trim() || local.id.slice(0, 8);
  const currentStatusId = String(local.statusId ?? "");
  const currentColumnId = String(local.columnId ?? "");

  const mappedColumnIdFromStatus =
    mapping?.statusToColumn?.[currentStatusId]
      ? String(mapping.statusToColumn[currentStatusId])
      : "";

  const mappedColumnNameFromStatus =
    mappedColumnIdFromStatus && columnById.get(mappedColumnIdFromStatus)?.name
      ? String(columnById.get(mappedColumnIdFromStatus)!.name)
      : "";

  const mappedStatusIdFromColumn =
    currentColumnId && columnToStatus[currentColumnId]
      ? String(columnToStatus[currentColumnId])
      : "";

  const mappedStatusNameFromColumn =
    mappedStatusIdFromColumn && statusById.get(mappedStatusIdFromColumn)?.name
      ? String(statusById.get(mappedStatusIdFromColumn)!.name)
      : "";

  async function setStatus(statusId: string) {
    if (!boardContext || !mapping || !local) return;

    const colId = mapping.statusToColumn?.[statusId] ? String(mapping.statusToColumn[statusId]) : "";
    const columnExists = colId ? columnById.has(colId) : false;

    try {
      await update.mutateAsync({
        id: local.id,
        dto: {
          boardId: String(boardContext.board.id),
          workflowId: String(mapping.workflowId),
          statusId: String(statusId),
          ...(columnExists ? { columnId: colId } : {}),
        } as any,
      });

      const next: WorkItem = {
        ...local,
        boardId: String(boardContext.board.id),
        workflowId: String(mapping.workflowId),
        statusId: String(statusId),
        ...(columnExists ? { columnId: colId } : {}),
      };

      setLocal(next);
      onItemUpdated?.(next);
      toast.success("Status updated");
    } catch (e: any) {
      toast.error(typeof e?.response?.data?.message === "string" ? e.response.data.message : "Failed to update status");
    }
  }

  async function setColumn(toColumnId: string) {
    if (!boardContext || !local) return;

    const nextStatusId = mapping ? columnToStatus[toColumnId] : undefined;

    try {
      await update.mutateAsync({
        id: local.id,
        dto: {
          boardId: String(boardContext.board.id),
          columnId: String(toColumnId),
          ...(mapping?.workflowId ? { workflowId: String(mapping.workflowId) } : {}),
          ...(nextStatusId ? { statusId: String(nextStatusId) } : {}),
        } as any,
      });

      const next: WorkItem = {
        ...local,
        boardId: String(boardContext.board.id),
        columnId: String(toColumnId),
        ...(mapping?.workflowId ? { workflowId: String(mapping.workflowId) } : {}),
        ...(nextStatusId ? { statusId: String(nextStatusId) } : {}),
      };

      setLocal(next);
      onItemUpdated?.(next);
      toast.success(nextStatusId ? "Moved + status updated" : "Moved");
    } catch (e: any) {
      toast.error(typeof e?.response?.data?.message === "string" ? e.response.data.message : "Failed to move work item");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className={cx(
            "fixed right-0 top-0 z-50 h-full w-[92vw] max-w-[720px]",
            "border-l border-slate-200 bg-white shadow-2xl",
            "dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          {/* ✅ Sticky Header */}
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur p-4 dark:border-slate-800 dark:bg-slate-950/85">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
                    <Hash className="h-3.5 w-3.5" />
                    {workKey}
                  </span>
                  <TypeBadge type={String(local.type ?? "")} />
                  <PriorityPill priority={String(local.priority ?? "")} />
                </div>

                <div className="mt-2 truncate text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {String(local.title ?? "Work item")}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {boardContext?.board?.name ? (
                    <span className="inline-flex items-center gap-1">
                      <LayoutGrid className="h-3.5 w-3.5" />
                      {String(boardContext.board.name)}
                    </span>
                  ) : null}
                  {local.boardId ? (
                    <span className="inline-flex items-center gap-1">
                      <Columns3 className="h-3.5 w-3.5" />
                      Board: <span className="font-mono">{String(local.boardId).slice(0, 8)}</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onEdit(local)}
                  disabled={update.isPending}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>

                <Link
                  href={`/portal/work-items/${encodeURIComponent(local.id)}?projectId=${encodeURIComponent(
                    String(local.projectId ?? "")
                  )}`}
                >
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Button>
                </Link>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* ✅ Board controls (cleaner) */}
            {(canUseStatusDropdown || canUseColumnDropdown) ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                      <ArrowRightLeft className="h-4 w-4" />
                      Board controls
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Status ↔ Column stays consistent using mapping.
                    </div>
                  </div>
                  {update.isPending ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">Saving…</div>
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {canUseStatusDropdown ? (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Workflow className="h-4 w-4" />
                        Status
                      </div>
                      <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950"
                        value={currentStatusId}
                        disabled={update.isPending}
                        onChange={(e) => {
                          const nextStatusId = e.target.value;
                          if (!nextStatusId) return;
                          void setStatus(nextStatusId);
                        }}
                      >
                        <option value="" disabled>Select status…</option>
                        {statusOptions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {String(s.name ?? s.key ?? s.id)} ({String(s.category ?? "-")})
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Maps to column:{" "}
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {mappedColumnNameFromStatus || (mappedColumnIdFromStatus ? mappedColumnIdFromStatus : "Unmapped")}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {canUseColumnDropdown ? (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Columns3 className="h-4 w-4" />
                        Column
                      </div>
                      <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950"
                        value={currentColumnId}
                        disabled={update.isPending}
                        onChange={(e) => {
                          const toColumnId = e.target.value;
                          if (!toColumnId) return;
                          void setColumn(toColumnId);
                        }}
                      >
                        <option value="" disabled>Select column…</option>
                        {columnsSorted.map((c) => (
                          <option key={c.id} value={c.id}>
                            {String(c.name ?? "-")}
                            {c.isBacklog ? " (backlog)" : ""}
                            {c.isDone ? " (done)" : ""}
                            {c.wipLimit != null ? ` (WIP ${c.wipLimit})` : ""}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Maps to status:{" "}
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {mappedStatusNameFromColumn || (mappedStatusIdFromColumn ? mappedStatusIdFromColumn : "Unmapped")}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* ✅ Description / Notes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                <Clipboard className="h-4 w-4" />
                Description
              </div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                {local.description ? String(local.description) : "No description."}
              </div>
            </div>

            {/* ✅ Key metadata */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                <BadgeCheck className="h-4 w-4" />
                Details
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="text-slate-500 dark:text-slate-400">Work item id</div>
                  <div className="mt-1 font-mono text-slate-900 dark:text-slate-50">{String(local.id)}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="text-slate-500 dark:text-slate-400">Project</div>
                  <div className="mt-1 font-mono text-slate-900 dark:text-slate-50">{String(local.projectId ?? "-")}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="text-slate-500 dark:text-slate-400">Workflow</div>
                  <div className="mt-1 font-mono text-slate-900 dark:text-slate-50">{String(local.workflowId ?? "-")}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="text-slate-500 dark:text-slate-400">Status</div>
                  <div className="mt-1 font-mono text-slate-900 dark:text-slate-50">{String(local.statusId ?? "-")}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="text-slate-500 dark:text-slate-400">Column</div>
                  <div className="mt-1 font-mono text-slate-900 dark:text-slate-50">{String(local.columnId ?? "-")}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    Dates
                  </div>
                  <div className="mt-1 text-slate-900 dark:text-slate-50">
                    {/* If you store createdAt/updatedAt in item, show it here */}
                    <span className="text-slate-500 dark:text-slate-400">—</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom spacing */}
            <div className="h-4" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}