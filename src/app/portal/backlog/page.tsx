"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCcw, Sparkles, ListTodo, CalendarRange } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectGuard } from "@/logaxp/components/projects/ProjectGuard";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";

import type { WorkItem, Sprint } from "@/logaxp/lib/project-management/projectManagement.types";

import { useSprints } from "@/logaxp/hooks/sprints/useSprints";
import { useWorkItems } from "@/logaxp/hooks/work-items/useWorkItems";
import {
  useCreateWorkItem,
  useBulkUpdateWorkItems,
  useUpdateWorkItem,
  useSoftDeleteWorkItem,
} from "@/logaxp/hooks/work-items/useWorkItemMutations";

import { BacklogView } from "@/logaxp/components/projects/sprints/BacklogView";
import { WorkItemCreateEditDialog } from "@/logaxp/components/projects/work-items/WorkItemCreateEditDialog";
import { WorkItemDrawer } from "@/logaxp/components/projects/work-items/WorkItemDrawer";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function BacklogPage() {
  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));
  const sprintIdFromUrl = normalizeProjectId(sp.get("sprintId"));

  // Always call hooks (your hooks should ideally use enabled: !!projectId internally)
  const sprintsQuery = useSprints(projectId);
  const workItemsQuery = useWorkItems({ projectId, page: 1, pageSize: 500 }); // stage 5: fetch once, split client-side

  const updateWorkItem = useUpdateWorkItem();
  const bulkUpdateWorkItems = useBulkUpdateWorkItems();
  const createWorkItem = useCreateWorkItem();
  const deleteWorkItem = useSoftDeleteWorkItem();

  const [selectedSprintId, setSelectedSprintId] = React.useState<string>("");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [drawer, setDrawer] = React.useState<WorkItem | null>(null);
  const [edit, setEdit] = React.useState<WorkItem | null>(null);
  const [toDelete, setToDelete] = React.useState<WorkItem | null>(null);

  const sprints = normalizeList<Sprint>(sprintsQuery.data).items;
  const allItems = React.useMemo(() => {
    return normalizeList<WorkItem>(workItemsQuery.data).items.filter((w) => !w.deletedAt);
  }, [workItemsQuery.data]);

  // Keep selected sprint valid & auto-select a reasonable default
  React.useEffect(() => {
    // if project changes, reset selection so we don't keep an invalid sprint id
    setSelectedSprintId("");
  }, [projectId]);

  React.useEffect(() => {
    if (!sprints.length) return;

    // If current selection is valid, keep it
    if (selectedSprintId && sprints.some((s) => s.id === selectedSprintId)) return;

    // Prefer sprintId from URL if valid
    if (sprintIdFromUrl && sprints.some((s) => s.id === sprintIdFromUrl)) {
      setSelectedSprintId(sprintIdFromUrl);
      return;
    }

    // Else pick first
    setSelectedSprintId(sprints[0].id);
  }, [sprints, sprintIdFromUrl, selectedSprintId]);

  const backlogItems = React.useMemo(() => allItems.filter((w) => !w.sprintId), [allItems]);
  const sprintItems = React.useMemo(
    () => allItems.filter((w) => String(w.sprintId ?? "") === selectedSprintId),
    [allItems, selectedSprintId]
  );

  const busy =
    updateWorkItem.isPending || bulkUpdateWorkItems.isPending || createWorkItem.isPending || deleteWorkItem.isPending;

  // Safe early render (before ProjectGuard) – avoids passing "undefined"
  if (!projectId) {
    return (
      <ProjectShell title="Backlog" subtitle="Plan work into sprints." pill="Work • Backlog">
        <ProjectRequiredState targetPath="/portal/backlog" targetLabel="Open backlog" />
      </ProjectShell>
    );
  }

  return (
    <ProjectGuard projectId={projectId}>
      <ProjectShell
        projectId={projectId}
        title="Backlog"
        subtitle="Plan work into a sprint, groom backlog, and prepare for execution."
        pill="Work • Backlog"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                sprintsQuery.refetch();
                workItemsQuery.refetch();
              }}
              disabled={busy}
            >
              <RefreshCcw className={cn("h-4 w-4", (sprintsQuery.isFetching || workItemsQuery.isFetching) && "animate-spin")} />
              Refresh
            </Button>

            <Button onClick={() => setCreateOpen(true)} disabled={busy}>
              <Plus className="h-4 w-4" />
              New work item
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Hero card */}
          <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
            <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

            <CardHeader className="relative pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    Sprint Planning
                  </div>

                  <CardTitle className="mt-2 text-xl">Backlog & Sprints</CardTitle>
                  <CardDescription className="mt-1">
                    Assign backlog work into a sprint, remove when needed, and keep execution clean.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="muted" className="rounded-full">
                    <ListTodo className="mr-1 h-3.5 w-3.5" />
                    Backlog: {backlogItems.length}
                  </Badge>
                  <Badge variant="muted" className="rounded-full">
                    <CalendarRange className="mr-1 h-3.5 w-3.5" />
                    Sprint: {sprintItems.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {!sprints.length && !sprintsQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
              <EmptyState title="No sprints yet" description="Create a sprint first, then plan items into it." />
            </div>
          ) : (
            <BacklogView
              projectId={projectId}
              sprints={sprints}
              backlogItems={backlogItems}
              sprintItems={sprintItems}
              selectedSprintId={selectedSprintId}
              onSelectSprint={setSelectedSprintId}
              busy={busy}
              onAddToSprint={async (workItemId) => {
                if (!selectedSprintId) return;
                await updateWorkItem.mutateAsync({
                  id: workItemId,
                  dto: { sprintId: selectedSprintId } as any,
                });
              }}
              onBulkAddToSprint={async (workItemIds) => {
                if (!selectedSprintId || !workItemIds.length) return;
                await bulkUpdateWorkItems.mutateAsync({
                  ids: workItemIds,
                  patch: { sprintId: selectedSprintId },
                });
              }}
              onRemoveFromSprint={async (workItemId) => {
                await updateWorkItem.mutateAsync({
                  id: workItemId,
                  dto: { sprintId: null } as any,
                });
              }}
              onOpenItem={(w) => setDrawer(w)}
              onEditItem={(w) => setEdit(w)}
              onDeleteItem={(w) => setToDelete(w)}
            />
          )}

          {/* Inline delete confirm (kept, but styled tighter) */}
          {toDelete ? (
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <CardContent className="p-4 text-sm">
                <div className="font-semibold text-slate-900 dark:text-slate-50">Delete work item?</div>
                <div className="mt-1 text-slate-600 dark:text-slate-300">{String(toDelete.title ?? "-")}</div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => setToDelete(null)} disabled={busy}>
                    Cancel
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={async () => {
                      await deleteWorkItem.mutateAsync({ id: toDelete.id });
                      setToDelete(null);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <WorkItemCreateEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          projectId={projectId}
          busy={createWorkItem.isPending}
          onSubmit={async (dto) => {
            await createWorkItem.mutateAsync(dto as any);
            setCreateOpen(false);
          }}
        />

        <WorkItemCreateEditDialog
          open={Boolean(edit)}
          onOpenChange={(o) => !o && setEdit(null)}
          mode="edit"
          projectId={projectId}
          item={edit}
          busy={updateWorkItem.isPending}
          onSubmit={async (dto) => {
            if (!edit) return;
            await updateWorkItem.mutateAsync({ id: edit.id, dto: dto as any });
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
