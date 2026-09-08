"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { KanbanSquare, Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectGuard } from "@/logaxp/components/projects/ProjectGuard";
import { WorkSystemMap } from "@/logaxp/components/projects/WorkSystemMap";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";

import type { Board } from "@/logaxp/lib/project-management/projectManagement.types";

import { useBoards } from "@/logaxp/hooks/boards/useBoards";
import { useCreateBoard, useDeleteBoard, useUpdateBoard } from "@/logaxp/hooks/boards/useBoardMutations";

import { BoardsTable } from "@/logaxp/components/projects/boards/BoardsTable";
import { BoardCreateEditDialog } from "@/logaxp/components/projects/boards/BoardCreateEditDialog";

function countByType(rows: Board[], type: string) {
  return rows.filter((board) => String(board.type ?? "").toUpperCase() === type).length;
}

export default function BoardsPage() {
  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));

  const boardsQuery = useBoards(projectId);
  const create = useCreateBoard(projectId);
  const update = useUpdateBoard(projectId);
  const del = useDeleteBoard(projectId);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<Board | null>(null);
  const [toDelete, setToDelete] = React.useState<Board | null>(null);

  const { items } = normalizeList<Board>(boardsQuery.data);
  const rows = React.useMemo(() => {
    return [...items]
      .filter((board) => !board.deletedAt)
      .sort((a, b) => {
        const defaultSort = Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault));
        if (defaultSort !== 0) return defaultSort;
        return String(a.name ?? "").localeCompare(String(b.name ?? ""));
      });
  }, [items]);

  const busy = create.isPending || update.isPending || del.isPending;

  const stats = [
    { label: "Boards", value: rows.length },
    { label: "Default boards", value: rows.filter((board) => board.isDefault).length },
    { label: "Kanban", value: countByType(rows, "KANBAN") },
  ];

  return (
    <ProjectGuard projectId={projectId}>
      <ProjectShell
        projectId={projectId}
        title="Boards"
        subtitle="Boards translate workflow statuses into visible execution lanes, so teams can see where work is waiting, moving, blocked, or done."
        pill="Work • Boards"
        actions={
          <>
            <Button variant="outline" onClick={() => boardsQuery.refetch()} disabled={boardsQuery.isFetching || busy}>
              <RefreshCcw className={boardsQuery.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)} disabled={busy}>
              <Plus className="h-4 w-4" />
              New board
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <WorkSystemMap active="boards" projectId={projectId} />

          <div className="grid gap-3 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">Project boards</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create multiple boards for delivery, support, backlog grooming, or team-specific views.
                </p>
              </div>
            </div>

            {boardsQuery.isLoading ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                Loading boards...
              </div>
            ) : boardsQuery.isError ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-red-600 dark:border-slate-800">
                Failed to load boards.
              </div>
            ) : rows.length ? (
              <>
                <BoardsTable
                  rows={rows}
                  projectId={projectId}
                  busy={busy}
                  onEdit={(board) => setEdit(board)}
                  onDelete={(board) => setToDelete(board)}
                />

                {toDelete ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                    <div className="font-semibold">Delete board?</div>
                    <div className="mt-1">{String(toDelete.name ?? "Untitled board")}</div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" onClick={() => setToDelete(null)} disabled={busy}>Cancel</Button>
                      <Button disabled={busy} onClick={async () => {
                        await del.mutateAsync({ id: toDelete.id });
                        setToDelete(null);
                      }}>
                        Confirm
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
                <EmptyState
                  title="No boards yet"
                  description="Create the first board for this project, then map workflow statuses into columns."
                  action={
                    <Button onClick={() => setCreateOpen(true)} disabled={busy}>
                      <KanbanSquare className="h-4 w-4" />
                      Create board
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>

        <BoardCreateEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          projectId={projectId}
          busy={create.isPending}
          onSubmit={async (dto) => {
            await create.mutateAsync(dto as any);
            setCreateOpen(false);
          }}
        />

        <BoardCreateEditDialog
          open={Boolean(edit)}
          onOpenChange={(open) => !open && setEdit(null)}
          mode="edit"
          projectId={projectId}
          board={edit}
          busy={update.isPending}
          onSubmit={async (dto) => {
            if (!edit) return;
            await update.mutateAsync({ id: edit.id, dto: dto as any });
            setEdit(null);
          }}
        />
      </ProjectShell>
    </ProjectGuard>
  );
}
