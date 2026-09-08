"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Sparkles, CalendarRange, LayoutGrid } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { QueryState } from "@/logaxp/components/ui/query-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectGuard } from "@/logaxp/components/projects/ProjectGuard";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";

import type { Board, Sprint } from "@/logaxp/lib/project-management/projectManagement.types";

import { useBoards } from "@/logaxp/hooks/boards/useBoards";
import { useSprints } from "@/logaxp/hooks/sprints/useSprints";
import {
  useCreateSprint,
  useUpdateSprint,
  useStartSprint,
  useCloseSprint,
} from "@/logaxp/hooks/sprints/useSprintMutations";

import { SprintsTable } from "@/logaxp/components/projects/sprints/SprintsTable";
import { SprintCreateEditDialog } from "@/logaxp/components/projects/sprints/SprintCreateEditDialog";
import { StartSprintDialog } from "@/logaxp/components/projects/sprints/StartSprintDialog";
import { CloseSprintDialog } from "@/logaxp/components/projects/sprints/CloseSprintDialog";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function SprintsPage() {
  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));

  const sprintsQuery = useSprints(projectId);
  const boardsQuery = useBoards(projectId);

  const create = useCreateSprint(projectId);
  const update = useUpdateSprint(projectId);
  const start = useStartSprint(projectId);
  const close = useCloseSprint(projectId);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<Sprint | null>(null);
  const [startTarget, setStartTarget] = React.useState<Sprint | null>(null);
  const [closeTarget, setCloseTarget] = React.useState<Sprint | null>(null);

  const sprints = React.useMemo(() => {
    return normalizeList<Sprint>(sprintsQuery.data).items.sort((a, b) =>
      String(a.name ?? "").localeCompare(String(b.name ?? ""))
    );
  }, [sprintsQuery.data]);

  const boards = React.useMemo(() => {
    return normalizeList<Board>(boardsQuery.data).items;
  }, [boardsQuery.data]);

  const activeCount = React.useMemo(
    () => sprints.filter((s) => String((s as any).status ?? "").toUpperCase() === "ACTIVE").length,
    [sprints]
  );
  const plannedCount = React.useMemo(
    () => sprints.filter((s) => String((s as any).status ?? "").toUpperCase() === "PLANNED").length,
    [sprints]
  );

  const busy = create.isPending || update.isPending || start.isPending || close.isPending;

  if (!projectId) {
    return (
      <ProjectShell
        title="Sprints"
        subtitle="Review all sprint activity, or select a project to create and plan a sprint."
        pill="Work • Sprints"
      >
        <div className="space-y-4">
          <ProjectRequiredState
            targetPath="/portal/sprints"
            targetLabel="Plan sprints"
            title="Choose a project to plan sprints."
            description="You can review sprint activity across the workspace here. To create or plan a sprint, choose a project and LogaXP will carry the project context automatically."
          />

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Workspace sprint activity</CardTitle>
              <CardDescription>All sprints you can access across active projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <QueryState
                isLoading={sprintsQuery.isLoading}
                isError={sprintsQuery.isError}
                isEmpty={!sprints.length}
                loadingTitle="Loading sprints"
                loadingDescription="Collecting sprint activity across your workspace."
                errorTitle="Failed to load sprints"
                errorDescription="Check your connection and refresh the sprint list."
                emptyTitle="No sprints yet"
                emptyDescription="Select a project and create the first sprint."
              >
                <SprintsTable
                  projectId=""
                  rows={sprints}
                  busy={busy}
                  onEdit={(s) => setEdit(s)}
                  onStart={(s) => setStartTarget(s)}
                  onClose={(s) => setCloseTarget(s)}
                />
              </QueryState>
            </CardContent>
          </Card>

          <SprintCreateEditDialog
            open={Boolean(edit)}
            onOpenChange={(o) => !o && setEdit(null)}
            mode="edit"
            projectId={String(edit?.projectId ?? "")}
            boards={boards}
            sprint={edit}
            busy={update.isPending}
            onSubmit={async (dto) => {
              if (!edit) return;
              await update.mutateAsync({ id: edit.id, dto: dto as any });
              setEdit(null);
            }}
          />

          <StartSprintDialog
            open={Boolean(startTarget)}
            onOpenChange={(o) => !o && setStartTarget(null)}
            sprint={startTarget}
            busy={start.isPending}
            onConfirm={async () => {
              if (!startTarget) return;
              await start.mutateAsync({ id: startTarget.id });
              setStartTarget(null);
            }}
          />

          <CloseSprintDialog
            open={Boolean(closeTarget)}
            onOpenChange={(o) => !o && setCloseTarget(null)}
            sprint={closeTarget}
            sprints={sprints.filter((s) => String(s.projectId ?? "") === String(closeTarget?.projectId ?? ""))}
            busy={close.isPending}
            onConfirm={async (dto) => {
              if (!closeTarget) return;
              await close.mutateAsync({ id: closeTarget.id, dto });
              setCloseTarget(null);
            }}
          />
        </div>
      </ProjectShell>
    );
  }

  return (
    <ProjectGuard projectId={projectId}>
      <ProjectShell
        projectId={projectId}
        title="Sprints"
        subtitle="Create sprints, plan work, and run the sprint lifecycle."
        pill="Work • Sprints"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => sprintsQuery.refetch()}
              disabled={sprintsQuery.isFetching || busy}
              title="Refresh sprints"
            >
              <RefreshCcw className={cn("h-4 w-4", sprintsQuery.isFetching && "animate-spin")} />
              Refresh
            </Button>

            <Button onClick={() => setCreateOpen(true)} disabled={busy}>
              <Plus className="h-4 w-4" />
              New sprint
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Hero */}
          <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
            <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

            <CardHeader className="relative pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    Sprint Center
                  </div>

                  <CardTitle className="mt-2 flex items-center gap-2 text-xl">
                    <CalendarRange className="h-5 w-5" />
                    Sprints
                  </CardTitle>

                  <CardDescription className="mt-1">
                    Plan iterations, start and close sprints, and keep delivery predictable.
                  </CardDescription>

                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Project: <span className="font-mono">{projectId.slice(0, 8)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="muted" className="rounded-full">
                    <CalendarRange className="mr-1 h-3.5 w-3.5" />
                    Total: {sprints.length}
                  </Badge>
                  <Badge variant="muted" className="rounded-full">
                    Active: {activeCount}
                  </Badge>
                  <Badge variant="muted" className="rounded-full">
                    Planned: {plannedCount}
                  </Badge>
                  <Badge variant="muted" className="rounded-full">
                    <LayoutGrid className="mr-1 h-3.5 w-3.5" />
                    Boards: {boards.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sprint List</CardTitle>
              <CardDescription>
                View, edit, start, and close sprints. Assign boards to structure execution.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <QueryState
                isLoading={sprintsQuery.isLoading}
                isError={sprintsQuery.isError}
                isEmpty={!sprints.length}
                loadingTitle="Loading sprints"
                loadingDescription="Preparing sprint planning data for this project."
                errorTitle="Failed to load sprints"
                errorDescription="Refresh the list or check that this project is still available."
                emptyTitle="No sprints yet"
                emptyDescription="Create your first sprint to begin planning."
              >
                <SprintsTable
                  projectId={projectId}
                  rows={sprints}
                  busy={busy}
                  onEdit={(s) => setEdit(s)}
                  onStart={(s) => setStartTarget(s)}
                  onClose={(s) => setCloseTarget(s)}
                />
              </QueryState>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <SprintCreateEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          projectId={projectId}
          boards={boards}
          busy={create.isPending}
          onSubmit={async (dto) => {
            await create.mutateAsync(dto as any);
            setCreateOpen(false);
          }}
        />

        <SprintCreateEditDialog
          open={Boolean(edit)}
          onOpenChange={(o) => !o && setEdit(null)}
          mode="edit"
          projectId={projectId}
          boards={boards}
          sprint={edit}
          busy={update.isPending}
          onSubmit={async (dto) => {
            if (!edit) return;
            await update.mutateAsync({ id: edit.id, dto: dto as any });
            setEdit(null);
          }}
        />

        <StartSprintDialog
          open={Boolean(startTarget)}
          onOpenChange={(o) => !o && setStartTarget(null)}
          sprint={startTarget}
          busy={start.isPending}
          onConfirm={async () => {
            if (!startTarget) return;
            await start.mutateAsync({ id: startTarget.id });
            setStartTarget(null);
          }}
        />

        <CloseSprintDialog
          open={Boolean(closeTarget)}
          onOpenChange={(o) => !o && setCloseTarget(null)}
          sprint={closeTarget}
          sprints={sprints}
          busy={close.isPending}
          onConfirm={async (dto) => {
            if (!closeTarget) return;
            await close.mutateAsync({ id: closeTarget.id, dto });
            setCloseTarget(null);
          }}
        />
      </ProjectShell>
    </ProjectGuard>
  );
}
