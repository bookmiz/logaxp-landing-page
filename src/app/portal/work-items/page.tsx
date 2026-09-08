"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CircleDot, KanbanSquare, ListTodo, Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { QueryState } from "@/logaxp/components/ui/query-state";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectGuard } from "@/logaxp/components/projects/ProjectGuard";
import { WorkSystemMap } from "@/logaxp/components/projects/WorkSystemMap";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";

import type { Board, BoardColumn, WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";

import { useBoards } from "@/logaxp/hooks/boards/useBoards";
import { useBoardColumns } from "@/logaxp/hooks/boards/useBoardColumns";
import { useWorkItems } from "@/logaxp/hooks/work-items/useWorkItems";
import { useCreateWorkItem, useSoftDeleteWorkItem, useUpdateWorkItem } from "@/logaxp/hooks/work-items/useWorkItemMutations";

import { WorkItemsFilters, type WorkItemsFilterState } from "@/logaxp/components/projects/work-items/WorkItemsFilters";
import { WorkItemsTable } from "@/logaxp/components/projects/work-items/WorkItemsTable";
import { WorkItemDrawer } from "@/logaxp/components/projects/work-items/WorkItemDrawer";
import { WorkItemCreateEditDialog } from "@/logaxp/components/projects/work-items/WorkItemCreateEditDialog";

type SavedWorkItemView = {
  id: string;
  name: string;
  filters: WorkItemsFilterState;
};

export default function WorkItemsPage() {
  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));
  const q0 = sp.get("q") ?? "";
  const boardId0 = sp.get("boardId") ?? "";

  const [filters, setFilters] = React.useState<WorkItemsFilterState>({
    q: q0,
    boardId: boardId0 || undefined,
    columnId: undefined,
    type: undefined,
    priority: undefined,
  });

  const deferredQ = React.useDeferredValue(filters.q);

  const boardsQuery = useBoards(projectId);
  const boardColumnsQuery = useBoardColumns(filters.boardId ?? "");

  const workItemsQuery = useWorkItems({
    projectId,
    q: deferredQ.trim() || undefined,
    boardId: filters.boardId,
    columnId: filters.columnId,
    type: filters.type,
    priority: filters.priority,
    page: 1,
    pageSize: 100,
  });

  const create = useCreateWorkItem();
  const update = useUpdateWorkItem();
  const del = useSoftDeleteWorkItem();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<WorkItem | null>(null);
  const [drawer, setDrawer] = React.useState<WorkItem | null>(null);
  const [toDelete, setToDelete] = React.useState<WorkItem | null>(null);
  const [savedViews, setSavedViews] = React.useState<SavedWorkItemView[]>([]);

  const savedViewKey = React.useMemo(() => `logaxp.workItemViews.${projectId || "global"}`, [projectId]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(savedViewKey);
      setSavedViews(raw ? JSON.parse(raw) : []);
    } catch {
      setSavedViews([]);
    }
  }, [savedViewKey]);

  const persistSavedViews = React.useCallback(
    (views: SavedWorkItemView[]) => {
      setSavedViews(views);
      try {
        window.localStorage.setItem(savedViewKey, JSON.stringify(views));
      } catch {
        // Saved views are a convenience; filtering still works without storage.
      }
    },
    [savedViewKey]
  );

  const saveCurrentView = React.useCallback(() => {
    const name = window.prompt("Name this work item view");
    if (!name?.trim()) return;
    const next = [
      ...savedViews.filter((view) => view.name.toLowerCase() !== name.trim().toLowerCase()),
      { id: crypto.randomUUID(), name: name.trim(), filters },
    ];
    persistSavedViews(next);
  }, [filters, persistSavedViews, savedViews]);

  const boards = normalizeList<Board>(boardsQuery.data).items;
  const columns = normalizeList<BoardColumn>(boardColumnsQuery.data).items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const rows = normalizeList<WorkItem>(workItemsQuery.data).items.filter((w) => !w.deletedAt);

  const busy = create.isPending || update.isPending || del.isPending;
  const stats = [
    { label: "Work items", value: rows.length, icon: ListTodo },
    { label: "On boards", value: rows.filter((item) => item.boardId).length, icon: KanbanSquare },
    { label: "With status", value: rows.filter((item) => item.statusId).length, icon: CircleDot },
  ];

  return (
    <ProjectGuard projectId={projectId}>
      <ProjectShell
        projectId={projectId}
        title="Work items"
        subtitle="Track the actual work inside a project: tasks, bugs, stories, priorities, ownership, board movement, and delivery status."
        pill="Work • Work items"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                workItemsQuery.refetch();
                boardsQuery.refetch();
                if (filters.boardId) boardColumnsQuery.refetch();
              }}
              disabled={workItemsQuery.isFetching || busy}
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>

            <Button onClick={() => setCreateOpen(true)} disabled={busy}>
              <Plus className="h-4 w-4" />
              New work item
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <WorkSystemMap active="work-items" projectId={projectId} />

          <div className="grid gap-3 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#86BF00]/15 text-[#5E8500] dark:text-[#86BF00]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{stat.value}</div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">Work item register</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Filter by board and column, then open a work item for details or update its delivery data.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {savedViews.length ? (
                  <select
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                    defaultValue=""
                    onChange={(e) => {
                      const view = savedViews.find((item) => item.id === e.target.value);
                      if (view) setFilters(view.filters);
                    }}
                  >
                    <option value="">Saved views</option>
                    {savedViews.map((view) => (
                      <option key={view.id} value={view.id}>{view.name}</option>
                    ))}
                  </select>
                ) : null}
                <Button variant="outline" onClick={saveCurrentView}>
                  Save view
                </Button>
              </div>
            </div>

            <WorkItemsFilters
              value={filters}
              onChange={setFilters}
              boards={boards}
              columns={columns}
            />
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <QueryState
              isLoading={workItemsQuery.isLoading}
              isError={workItemsQuery.isError}
              isEmpty={!rows.length}
              loadingTitle="Loading work items"
              loadingDescription="Preparing the current project work register."
              errorTitle="Failed to load work items"
              errorDescription="Refresh the list or check that this project context is still valid."
              emptyTitle="No work items yet"
              emptyDescription="Create the first work item for this project, then connect it to a board and workflow status."
              emptyAction={
                <Button onClick={() => setCreateOpen(true)} disabled={busy}>
                  <Plus className="h-4 w-4" />
                  Create work item
                </Button>
              }
              className="rounded-2xl"
            >
              <>
                <WorkItemsTable
                  rows={rows}
                  busy={busy}
                  onOpen={(w: WorkItem) => setDrawer(w)}
                  onEdit={(w: WorkItem) => setEdit(w)}
                  onDelete={(w: WorkItem) => setToDelete(w)}
                />

                {toDelete ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                    <div className="font-semibold">Delete work item?</div>
                    <div className="mt-1">{String(toDelete.title ?? "Untitled work item")}</div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" onClick={() => setToDelete(null)} disabled={busy}>
                        Cancel
                      </Button>
                      <Button
                        disabled={busy}
                        onClick={async () => {
                          await del.mutateAsync({ id: toDelete.id });
                          setToDelete(null);
                        }}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            </QueryState>
          </div>
        </div>

        <WorkItemCreateEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          projectId={projectId}
          defaults={{
            boardId: filters.boardId,
            columnId: filters.columnId,
          }}
          busy={create.isPending}
          onSubmit={async (dto) => {
            await create.mutateAsync(dto as any);
            setCreateOpen(false);
          }}
        />

        <WorkItemCreateEditDialog
          open={Boolean(edit)}
          onOpenChange={(o) => !o && setEdit(null)}
          mode="edit"
          projectId={projectId}
          item={edit}
          busy={update.isPending}
          onSubmit={async (dto) => {
            if (!edit) return;
            await update.mutateAsync({ id: edit.id, dto: dto as any });
            setEdit(null);
          }}
        />

        <WorkItemDrawer
          open={Boolean(drawer)}
          onOpenChange={(o) => !o && setDrawer(null)}
          item={drawer}
          onEdit={(w) => {
            setDrawer(null);
            setEdit(w);
          }}
        />
      </ProjectShell>
    </ProjectGuard>
  );
}
