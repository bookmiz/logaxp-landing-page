"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { 
  Plus, 
  RefreshCcw, 
  GitMerge, 
  Settings2, 
  X, 
  GripVertical,
  MoreHorizontal,
  LayoutGrid,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ChevronLeft,
  Maximize2,
  Minimize2
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";

import type { Board, BoardColumn, Sprint, Workflow, WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";

import { useBoard } from "@/logaxp/hooks/boards/useBoard";
import { useUpdateBoard } from "@/logaxp/hooks/boards/useBoardMutations";
import {
  useBoardColumns,
  useCreateBoardColumn,
  useUpdateBoardColumn,
  useRemoveBoardColumn,
  useReorderBoardColumns,
} from "@/logaxp/hooks/boards/useBoardColumns";

import { useWorkflows } from "@/logaxp/hooks/workflows/useWorkflows";
import { useWorkItems } from "@/logaxp/hooks/work-items/useWorkItems";
import { useCreateWorkItem, useUpdateWorkItem } from "@/logaxp/hooks/work-items/useWorkItemMutations";
import { useSprints } from "@/logaxp/hooks/sprints/useSprints";

import { BoardCreateEditDialog } from "@/logaxp/components/projects/boards/BoardCreateEditDialog";
import { ColumnCreateEditDialog } from "@/logaxp/components/projects/boards/columns/ColumnCreateEditDialog";
import { KanbanBoard } from "@/logaxp/components/projects/boards/KanbanBoard";
import { WorkItemCreateEditDialog } from "@/logaxp/components/projects/work-items/WorkItemCreateEditDialog";
import { WorkItemDrawer } from "@/logaxp/components/projects/work-items/WorkItemDrawer";

import { readBoardWorkflowMapping, invertStatusToColumn } from "@/logaxp/components/projects/boards/mapping/boardMapping.ui";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ============================================================================
// Skeletons
// ============================================================================
function BoardHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-6 w-48 rounded-lg bg-slate-200/70 dark:bg-slate-800/60" />
      <div className="h-4 w-96 rounded-lg bg-slate-200/60 dark:bg-slate-800/50" />
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-[300px] max-w-[300px]">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded-md bg-slate-200/70 dark:bg-slate-800/60" />
                <div className="h-6 w-12 rounded-md bg-slate-200/60 dark:bg-slate-800/50" />
              </div>
              <div className="mt-3 space-y-2">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div key={j} className="h-12 rounded-lg bg-slate-200/40 dark:bg-slate-800/30" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Columns Drawer
// ============================================================================
function ColumnsDrawer({
  open,
  onOpenChange,
  boardName,
  columns,
  busy,
  onNew,
  onEdit,
  onRemove,
  onReorder,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  boardName?: string;
  columns: BoardColumn[];
  busy: boolean;
  onNew: () => void;
  onEdit: (c: BoardColumn) => void;
  onRemove: (c: BoardColumn) => void;
  onReorder: (ordered: BoardColumn[]) => void;
}) {
  const move = (id: string, dir: -1 | 1) => {
    const idx = columns.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= columns.length) return;

    const next = [...columns];
    const [x] = next.splice(idx, 1);
    next.splice(nextIdx, 0, x);
    onReorder(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
        <Dialog.Content
          className={cx(
            "fixed right-0 top-0 z-50 h-screen w-[400px]",
            "border-l border-slate-200 bg-white shadow-xl",
            "dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div>
                <Dialog.Title className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Columns
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 dark:text-slate-400">
                  {boardName ? String(boardName) : "Manage board columns"}
                </Dialog.Description>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={onNew} disabled={busy} className="h-7 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  New
                </Button>
                <Dialog.Close asChild>
                  <button className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3">
              {!columns.length ? (
                <div className="rounded-lg border border-slate-200 p-6 text-center dark:border-slate-800">
                  <EmptyState 
                    title="No columns" 
                    description="Create your first column to start using Kanban." 
                    compact 
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {columns.map((c, idx) => (
                    <div
                      key={c.id}
                      className="group rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1 cursor-move text-slate-300 group-hover:text-slate-400">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                              {String(c.name)}
                            </span>
                            {c.isBacklog && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                Backlog
                              </span>
                            )}
                            {c.isDone && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                Done
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs">
                            <span className="font-mono text-slate-400">{String(c.key)}</span>
                            {c.wipLimit != null && (
                              <span className="text-slate-500">WIP {c.wipLimit}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => move(c.id, -1)}
                            disabled={busy || idx === 0}
                          >
                            ↑
                          </button>
                          <button
                            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => move(c.id, 1)}
                            disabled={busy || idx === columns.length - 1}
                          >
                            ↓
                          </button>
                          <button
                            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => onEdit(c)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => onRemove(c)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ============================================================================
// Main Component
// ============================================================================
export default function BoardDetailPage() {
  const params = useParams<{ id: string }>();
  const boardId = typeof params.id === "string" ? params.id : "";

  // Queries
  const boardQuery = useBoard(boardId);
  const board = boardQuery.data?.data as Board | undefined;
  const projectId = normalizeProjectId(board?.projectId);

  const columnsQuery = useBoardColumns(boardId);
  const workflowsQ = useWorkflows();
  const sprintsQ = useSprints(projectId);
  const workItemsQuery = useWorkItems({ projectId, boardId, page: 1, pageSize: 200 });

  // Mutations
  const updateBoard = useUpdateBoard(projectId);
  const createCol = useCreateBoardColumn(boardId);
  const updateCol = useUpdateBoardColumn(boardId);
  const removeCol = useRemoveBoardColumn(boardId);
  const reorderCols = useReorderBoardColumns(boardId);
  const updateWorkItem = useUpdateWorkItem();
  const createWorkItem = useCreateWorkItem();

  // Local state
  const [editBoardOpen, setEditBoardOpen] = React.useState(false);
  const [columnsDrawerOpen, setColumnsDrawerOpen] = React.useState(false);
  const [createColOpen, setCreateColOpen] = React.useState(false);
  const [editCol, setEditCol] = React.useState<BoardColumn | null>(null);
  const [removeColTarget, setRemoveColTarget] = React.useState<BoardColumn | null>(null);
  const [drawer, setDrawer] = React.useState<WorkItem | null>(null);
  const [createWI, setCreateWI] = React.useState<{ open: boolean; columnId?: string }>({ open: false });
  const [editWI, setEditWI] = React.useState<WorkItem | null>(null);
  const [focusMode, setFocusMode] = React.useState(false);
  const [boardFilters, setBoardFilters] = React.useState({
    q: "",
    assigneeMembershipId: "",
    priority: "",
    type: "",
    sprintId: "",
  });

  // Derived data
  const workflows = normalizeList<Workflow>(workflowsQ.data).items;
  const sprints = normalizeList<Sprint>(sprintsQ.data).items;
  const columns = React.useMemo(() => {
    const { items } = normalizeList<BoardColumn>(columnsQuery.data);
    return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [columnsQuery.data]);

  const rawWorkItems = React.useMemo(() => {
    const { items } = normalizeList<WorkItem>(workItemsQuery.data);
    return items.filter((w) => !w.deletedAt);
  }, [workItemsQuery.data]);

  const workItems = React.useMemo(() => {
    const needle = boardFilters.q.trim().toLowerCase();
    return rawWorkItems.filter((w) => {
      if (boardFilters.assigneeMembershipId && String(w.assigneeMembershipId ?? "") !== boardFilters.assigneeMembershipId) return false;
      if (boardFilters.priority && String(w.priority ?? "") !== boardFilters.priority) return false;
      if (boardFilters.type && String(w.type ?? "") !== boardFilters.type) return false;
      if (boardFilters.sprintId && String(w.sprintId ?? "") !== boardFilters.sprintId) return false;
      if (!needle) return true;
      return [w.title, w.description, (w as any).key, (w as any).issueKey]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [rawWorkItems, boardFilters]);

  const filterOptions = React.useMemo(() => {
    const assignees = new Set<string>();
    const priorities = new Set<string>();
    const types = new Set<string>();

    for (const item of rawWorkItems) {
      if (item.assigneeMembershipId) assignees.add(String(item.assigneeMembershipId));
      if (item.priority) priorities.add(String(item.priority));
      if (item.type) types.add(String(item.type));
    }

    return {
      assignees: [...assignees].sort(),
      priorities: [...priorities].sort(),
      types: [...types].sort(),
    };
  }, [rawWorkItems]);

  const mapping = React.useMemo(() => (board ? readBoardWorkflowMapping(board) : null), [board?.id, board?.metadata]);
  const columnToStatus = React.useMemo(
    () => (mapping ? invertStatusToColumn(mapping.statusToColumn) : {}),
    [mapping?.workflowId, (mapping as any)?.statusToColumn]
  );

  const busy = React.useMemo(
    () => 
      boardQuery.isLoading ||
      columnsQuery.isLoading ||
      workflowsQ.isLoading ||
      sprintsQ.isLoading ||
      workItemsQuery.isLoading ||
      updateBoard.isPending ||
      createCol.isPending ||
      updateCol.isPending ||
      removeCol.isPending ||
      reorderCols.isPending ||
      updateWorkItem.isPending ||
      createWorkItem.isPending,
    [
      boardQuery.isLoading,
      columnsQuery.isLoading,
      workflowsQ.isLoading,
      sprintsQ.isLoading,
      workItemsQuery.isLoading,
      updateBoard.isPending,
      createCol.isPending,
      updateCol.isPending,
      removeCol.isPending,
      reorderCols.isPending,
      updateWorkItem.isPending,
      createWorkItem.isPending,
    ]
  );

  const showLoading = boardQuery.isLoading && !board;
  const showNotFound = (boardQuery.isError || (!boardQuery.isLoading && !board)) && !showLoading;

  // Actions
  const handleRefresh = React.useCallback(() => {
    boardQuery.refetch();
    columnsQuery.refetch();
    workflowsQ.refetch();
    sprintsQ.refetch();
    workItemsQuery.refetch();
  }, [boardQuery, columnsQuery, workflowsQ, sprintsQ, workItemsQuery]);

  return (
    <ProjectShell
      projectId={projectId}
      title={
        <div className="flex items-center gap-3">
          <Link 
            href={projectId ? `/portal/boards?projectId=${encodeURIComponent(projectId)}` : "/portal/boards"}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {board?.name ? String(board.name) : showLoading ? "Loading..." : "Board"}
          </span>
          {board && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {columns.length} columns • {workItems.length} items
            </span>
          )}
        </div>
      }
      subtitle={
        board?.description 
          ? String(board.description) 
          : showLoading 
          ? "Loading board..." 
          : "No description"
      }
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={busy}
            className="h-8 text-xs"
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-950"
              >
                <DropdownMenu.Item
                  onSelect={() => setFocusMode(!focusMode)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 outline-none hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  {focusMode ? "Exit focus mode" : "Focus mode"}
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={() => setEditBoardOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 outline-none hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Edit className="h-4 w-4" />
                  Edit board
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={() => setColumnsDrawerOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 outline-none hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Settings2 className="h-4 w-4" />
                  Manage columns
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

                <Link href={withProjectId(`/portal/boards/${encodeURIComponent(boardId)}/mapping`, projectId)}>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 outline-none hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <GitMerge className="h-4 w-4" />
                    Workflow mapping
                  </DropdownMenu.Item>
                </Link>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <Button size="sm" onClick={() => setCreateWI({ open: true })} className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Item
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <ProjectCrumbs
          items={[
            { label: "Work", href: "/portal/work" },
            { 
              label: "Boards", 
              href: projectId ? `/portal/boards?projectId=${encodeURIComponent(projectId)}` : "/portal/boards" 
            },
            { label: board?.name ? String(board.name) : "Board" },
          ]}
        />

        {/* Loading/Error states */}
        {showLoading && <BoardHeaderSkeleton />}
        {showNotFound && (
          <div className="rounded-xl border border-slate-200 p-8 text-center dark:border-slate-800">
            <EmptyState title="Board not found" description="This board may not exist or you don't have access." />
          </div>
        )}

        {board ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-950 dark:text-white">Board filters</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {workItems.length} of {rawWorkItems.length} work items.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setBoardFilters({
                    q: "",
                    assigneeMembershipId: "",
                    priority: "",
                    type: "",
                    sprintId: "",
                  })
                }
                disabled={busy}
              >
                Clear filters
              </Button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-100/10"
                placeholder="Search title or key..."
                value={boardFilters.q}
                onChange={(e) => setBoardFilters((s) => ({ ...s, q: e.target.value }))}
              />

              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={boardFilters.type}
                onChange={(e) => setBoardFilters((s) => ({ ...s, type: e.target.value }))}
              >
                <option value="">All types</option>
                {filterOptions.types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={boardFilters.priority}
                onChange={(e) => setBoardFilters((s) => ({ ...s, priority: e.target.value }))}
              >
                <option value="">All priorities</option>
                {filterOptions.priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>

              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={boardFilters.assigneeMembershipId}
                onChange={(e) => setBoardFilters((s) => ({ ...s, assigneeMembershipId: e.target.value }))}
              >
                <option value="">All assignees</option>
                {filterOptions.assignees.map((assigneeId) => (
                  <option key={assigneeId} value={assigneeId}>{assigneeId.slice(0, 10)}</option>
                ))}
              </select>

              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={boardFilters.sprintId}
                onChange={(e) => setBoardFilters((s) => ({ ...s, sprintId: e.target.value }))}
              >
                <option value="">All sprints</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>{String(sprint.name ?? "Sprint")}</option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {/* Kanban Board */}
        {board && (
          <>
            {busy && !workItems.length && !columns.length ? (
              <KanbanSkeleton />
            ) : columns.length ? (
              <KanbanBoard
                storageKey={boardId}
                columns={focusMode ? columns.slice(0, 3) : columns}
                items={workItems}
                onOpenItem={(w) => setDrawer(w)}
                onCreateInColumn={(columnId) => setCreateWI({ open: true, columnId })}
                onMoveItem={async ({ id, toColumnId }) => {
                  const statusId = columnToStatus[toColumnId];
                  await updateWorkItem.mutateAsync({
                    id,
                    dto: {
                      boardId,
                      columnId: toColumnId,
                      ...(mapping?.workflowId ? { workflowId: mapping.workflowId } : {}),
                      ...(statusId ? { statusId } : {}),
                    } as any,
                  });
                }}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
                <div className="mx-auto max-w-sm space-y-3">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    No columns yet
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create your first column to start organizing work
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setColumnsDrawerOpen(true);
                        setCreateColOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Create column
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs & Drawers */}
      <BoardCreateEditDialog
        open={editBoardOpen}
        onOpenChange={setEditBoardOpen}
        mode="edit"
        projectId={projectId}
        board={board ?? null}
        busy={updateBoard.isPending}
        onSubmit={async (dto) => {
          if (!board) return;
          await updateBoard.mutateAsync({ id: board.id, dto: dto as any });
          setEditBoardOpen(false);
        }}
      />

      <ColumnsDrawer
        open={columnsDrawerOpen}
        onOpenChange={setColumnsDrawerOpen}
        boardName={board?.name ? String(board.name) : undefined}
        columns={columns}
        busy={busy}
        onNew={() => setCreateColOpen(true)}
        onEdit={(c) => setEditCol(c)}
        onRemove={(c) => setRemoveColTarget(c)}
        onReorder={(ordered) => {
          reorderCols.mutate({
            columns: ordered.map((c, idx) => ({ id: c.id, order: idx })),
          });
        }}
      />

      <ColumnCreateEditDialog
        open={createColOpen}
        onOpenChange={setCreateColOpen}
        mode="create"
        busy={createCol.isPending}
        onSubmit={async (dto) => {
          await createCol.mutateAsync(dto as any);
          setCreateColOpen(false);
          setColumnsDrawerOpen(true);
        }}
      />

      <ColumnCreateEditDialog
        open={Boolean(editCol)}
        onOpenChange={(o) => !o && setEditCol(null)}
        mode="edit"
        column={editCol}
        busy={updateCol.isPending}
        onSubmit={async (dto) => {
          if (!editCol) return;
          await updateCol.mutateAsync({ columnId: editCol.id, dto: dto as any });
          setEditCol(null);
          setColumnsDrawerOpen(true);
        }}
      />

      <Dialog.Root open={Boolean(removeColTarget)} onOpenChange={(v) => !v && setRemoveColTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Delete column?
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This action cannot be undone. Move all items first.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/20">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {String(removeColTarget?.name ?? "-")}
              </div>
              <div className="mt-0.5 font-mono text-xs text-slate-400">
                {String(removeColTarget?.key ?? "-")}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm" disabled={busy} className="h-8 text-xs">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                size="sm"
                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                disabled={busy || !removeColTarget}
                onClick={async () => {
                  if (!removeColTarget) return;
                  await removeCol.mutateAsync({ columnId: removeColTarget.id });
                  setRemoveColTarget(null);
                  setColumnsDrawerOpen(true);
                }}
              >
                {busy ? "Deleting..." : "Delete column"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <WorkItemDrawer
        open={Boolean(drawer)}
        onOpenChange={(o) => !o && setDrawer(null)}
        item={drawer}
        onEdit={(w) => {
          setDrawer(null);
          setEditWI(w);
        }}
        boardContext={board ? { board, workflows, columns } : undefined}
        onItemUpdated={(next) => setDrawer(next)}
      />

      <WorkItemCreateEditDialog
        open={createWI.open}
        onOpenChange={(o) => setCreateWI((s) => ({ ...s, open: o }))}
        mode="create"
        projectId={projectId}
        defaults={{
          boardId,
          columnId: createWI.columnId,
          ...(mapping?.workflowId ? { workflowId: mapping.workflowId } : {}),
          ...(createWI.columnId && columnToStatus[createWI.columnId]
            ? { statusId: columnToStatus[createWI.columnId] }
            : {}),
        }}
        busy={createWorkItem.isPending}
        onSubmit={async (dto) => {
          await createWorkItem.mutateAsync(dto as any);
          setCreateWI({ open: false });
          workItemsQuery.refetch();
        }}
      />

      <WorkItemCreateEditDialog
        open={Boolean(editWI)}
        onOpenChange={(o) => !o && setEditWI(null)}
        mode="edit"
        projectId={String(editWI?.projectId ?? projectId)}
        item={editWI}
        busy={updateWorkItem.isPending}
        onSubmit={async (dto) => {
          if (!editWI) return;
          await updateWorkItem.mutateAsync({ id: editWI.id, dto: dto as any });
          setEditWI(null);
          workItemsQuery.refetch();
        }}
      />
    </ProjectShell>
  );
}
