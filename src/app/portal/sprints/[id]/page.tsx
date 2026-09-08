"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { BarChart3, CalendarRange, CheckCircle2, Columns3, RefreshCcw, Target } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";
import { ProjectRequiredState } from "@/logaxp/components/projects/ProjectRequiredState";
import { normalizeList } from "@/logaxp/components/projects/project.ui";

import type { WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";

import { useSprint, useSprintBoardView, useSprintVelocity } from "@/logaxp/hooks/sprints/useSprint";
import { useSprints } from "@/logaxp/hooks/sprints/useSprints";
import { useStartSprint, useCloseSprint } from "@/logaxp/hooks/sprints/useSprintMutations";
import { useWorkItems } from "@/logaxp/hooks/work-items/useWorkItems";
import { useUpdateWorkItem } from "@/logaxp/hooks/work-items/useWorkItemMutations";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";

import { SprintStatusBadge } from "@/logaxp/components/projects/sprints/SprintStatusBadge";
import { CloseSprintDialog } from "@/logaxp/components/projects/sprints/CloseSprintDialog";
import { WorkItemsTable } from "@/logaxp/components/projects/work-items/WorkItemsTable";
import { WorkItemDrawer } from "@/logaxp/components/projects/work-items/WorkItemDrawer";

function metricValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export default function SprintDetailPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const projectIdFromUrl = normalizeProjectId(sp.get("projectId"));
  const sprintId = typeof params.id === "string" ? params.id : "";

  const sprintQuery = useSprint(sprintId);
  const sprint = sprintQuery.data?.data;
  const projectId = projectIdFromUrl || normalizeProjectId(sprint?.projectId);
  const boardViewQuery = useSprintBoardView(sprintId);
  const velocityQuery = useSprintVelocity(projectId);
  const sprintsQuery = useSprints(projectId);

  const itemsQuery = useWorkItems({ projectId, sprintId, page: 1, pageSize: 200 });
  const updateWorkItem = useUpdateWorkItem();

  const start = useStartSprint(projectId);
  const close = useCloseSprint(projectId);

  const [drawer, setDrawer] = React.useState<WorkItem | null>(null);
  const [closeOpen, setCloseOpen] = React.useState(false);

  const boardView = boardViewQuery.data?.data;
  const metrics = sprint?.metrics ?? boardView?.sprint?.metrics;
  const velocity = velocityQuery.data?.data;
  const items = (boardView?.sprint?.workItems?.length ? boardView.sprint.workItems : normalizeList<WorkItem>(itemsQuery.data).items).filter((w) => !w.deletedAt);

  const busy = start.isPending || close.isPending || updateWorkItem.isPending;

  return (
    <ProjectShell
      projectId={projectId}
      title={sprint?.name ? String(sprint.name) : "Sprint"}
      subtitle={sprint?.goal ? String(sprint.goal) : "Sprint detail and work items."}
      pill="Work • Sprint"
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => {
              sprintQuery.refetch();
              boardViewQuery.refetch();
              velocityQuery.refetch();
              itemsQuery.refetch();
            }}
            disabled={busy}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          {sprint ? (
            <>
              <Button variant="outline" disabled={busy} onClick={() => start.mutate({ id: sprint.id })}>
                Start
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => setCloseOpen(true)}>
                Close
              </Button>
            </>
          ) : null}
        </>
      }
    >
      <ProjectCrumbs
        items={[
          { label: "Work", href: "/portal/work" },
          { label: "Sprints", href: withProjectId("/portal/sprints", projectId) },
          { label: sprint?.name ? String(sprint.name) : sprintId.slice(0, 8) },
        ]}
      />

      <div className="mt-4 space-y-4">
        {!projectId && !sprintQuery.isLoading ? (
          <ProjectRequiredState
            targetPath={`/portal/sprints/${encodeURIComponent(sprintId)}`}
            targetLabel="Open sprint"
            title="Select the sprint project."
            description="Sprint detail pages need the project context to load the right sprint and work items. Select the project and LogaXP will reopen this sprint with the project ID attached."
          />
        ) : sprintQuery.isLoading ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            Loading sprint...
          </div>
        ) : sprintQuery.isError || !sprint ? (
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <EmptyState title="Sprint not found" description="This sprint may not exist or you don't have access." />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap items-center gap-2">
                <SprintStatusBadge status={String(sprint.status ?? "")} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Start: {sprint.startAt ? String(sprint.startAt) : "-"} • End: {sprint.endAt ? String(sprint.endAt) : "-"}
                </span>
                <span className="ml-auto font-mono text-xs text-slate-500 dark:text-slate-400">
                  Board: {String((sprint.board as any)?.name ?? sprint.boardId ?? "-")}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  { label: "Capacity", value: metrics?.capacityPoints ?? sprint.capacityPoints ?? "-", icon: Target },
                  { label: "Committed", value: metrics?.committedPoints ?? 0, icon: CalendarRange },
                  { label: "Completed", value: metrics?.completedPoints ?? 0, icon: CheckCircle2 },
                  { label: "Incomplete", value: metrics?.incompletePoints ?? 0, icon: BarChart3 },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <item.icon className="h-4 w-4 text-[#5E8500]" />
                      {item.label}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{metricValue(item.value)}</div>
                  </div>
                ))}
              </div>

              {sprint.closeSummary ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="font-semibold text-slate-950 dark:text-white">Close summary</div>
                  <div className="mt-2 grid gap-2 text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                    <span>Completed: {metricValue(sprint.closeSummary.completedCount)} items</span>
                    <span>Incomplete: {metricValue(sprint.closeSummary.incompleteCount)} items</span>
                    <span>Rolled over: {metricValue(sprint.closeSummary.movedBackToBacklogCount)} items</span>
                  </div>
                  {sprint.closeSummary.summaryNote ? (
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{String(sprint.closeSummary.summaryNote)}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/portal/backlog?projectId=${encodeURIComponent(projectId)}&sprintId=${encodeURIComponent(sprint.id)}`}>
                  <Button variant="outline">Open backlog planning</Button>
                </Link>
              </div>
            </div>

            {boardView?.columns?.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                  <Columns3 className="h-4 w-4 text-[#5E8500]" />
                  Sprint board
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {boardView.columns.map(({ column, items: columnItems }) => (
                    <div key={column.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900 dark:text-slate-50">{String(column.name ?? "-")}</div>
                        <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500 dark:bg-slate-950 dark:text-slate-300">
                          {columnItems.length}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {columnItems.slice(0, 5).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDrawer(item)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                          >
                            <div className="font-medium text-slate-900 dark:text-slate-50">{String(item.title ?? "-")}</div>
                            <div className="mt-1 text-xs text-slate-500">{String(item.issueKey ?? item.type ?? "")}</div>
                          </button>
                        ))}
                        {!columnItems.length ? <div className="text-xs text-slate-400">No sprint items here.</div> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {velocity?.history?.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-950 dark:text-white">Velocity history</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Average completed: {velocity.averageCompletedPoints} pts
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {velocity.history.slice(0, 6).map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                      <div className="font-medium text-slate-900 dark:text-slate-50">{String(entry.name ?? "-")}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {entry.completedPoints ?? 0}/{entry.committedPoints ?? 0} points completed
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {itemsQuery.isLoading ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                Loading sprint items...
              </div>
            ) : itemsQuery.isError ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-red-600 dark:border-slate-800">
                Failed to load sprint items.
              </div>
            ) : items.length ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Sprint items</div>
                <WorkItemsTable
                  rows={items}
                  busy={busy}
                  onOpen={(w) => setDrawer(w)}
                  onEdit={(w) => setDrawer(w)} // you can wire edit dialog if you want
                  onDelete={(w) => setDrawer(w)} // handled in work items page; keeping simple here
                />

                <div className="rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-slate-50">Remove item to backlog</div>
                  <div className="mt-1 text-slate-600 dark:text-slate-300">
                    Use the backlog planning page for best workflow (add/remove).
                  </div>
                  <div className="mt-3">
                    <Link href={`/portal/backlog?projectId=${encodeURIComponent(projectId)}&sprintId=${encodeURIComponent(sprint.id)}`}>
                      <Button variant="outline">Go to Backlog</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
                <EmptyState title="No items in sprint" description="Add items from backlog planning." />
              </div>
            )}
          </>
        )}
      </div>

      <WorkItemDrawer
        open={Boolean(drawer)}
        onOpenChange={(o) => !o && setDrawer(null)}
        item={drawer}
        onEdit={() => setDrawer(null)}
      />

      <CloseSprintDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        sprint={sprint ?? null}
        sprints={normalizeList<any>(sprintsQuery.data).items}
        busy={close.isPending}
        onConfirm={async (dto) => {
          if (!sprint) return;
          await close.mutateAsync({ id: sprint.id, dto });
          setCloseOpen(false);
        }}
      />
    </ProjectShell>
  );
}
