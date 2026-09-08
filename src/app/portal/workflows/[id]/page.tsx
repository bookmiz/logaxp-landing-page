"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";

import type { WorkflowStatus } from "@/logaxp/lib/project-management/projectManagement.types";

import { useWorkflow } from "@/logaxp/hooks/workflows/useWorkflow";
import {
  useAddWorkflowStatus,
  useDeleteWorkflowStatus,
  useReorderWorkflowStatuses,
  useSetDefaultWorkflow,
} from "@/logaxp/hooks/workflows/useWorkflowMutations";

import { StatusCreateDialog } from "@/logaxp/components/projects/workflows/statuses/StatusCreateDialog";
import { StatusReorderDnd } from "@/logaxp/components/projects/workflows/statuses/StatusReorderDnd";
import { StatusesTable } from "@/logaxp/components/projects/workflows/statuses/StatusesTable";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const workflowId = typeof params.id === "string" ? params.id : "";
  const projectId = normalizeProjectId(sp.get("projectId"));

  const q = useWorkflow(workflowId);
  const workflow = q.data?.data ?? null;

  const addStatus = useAddWorkflowStatus();
  const reorder = useReorderWorkflowStatuses();
  const del = useDeleteWorkflowStatus();
  const setDefault = useSetDefaultWorkflow();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<WorkflowStatus | null>(null);

  const statuses = React.useMemo(() => {
    const s = Array.isArray(workflow?.statuses) ? (workflow!.statuses as WorkflowStatus[]) : [];
    return [...s].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [workflow?.id, (workflow as any)?.statuses]);

  const nextOrder = statuses.length ? Math.max(...statuses.map((x) => x.order ?? 0)) + 1 : 0;

  const busy = addStatus.isPending || reorder.isPending || del.isPending || setDefault.isPending;

  return (
    <ProjectShell
      projectId={projectId}
      title={workflow?.name ? String(workflow.name) : "Workflow"}
      subtitle={workflow?.isDefault ? "Default workflow for the workspace." : "Configure workflow statuses."}
      pill="Work • Workflow"
      actions={
        <>
          <Button variant="outline" onClick={() => q.refetch()} disabled={q.isFetching || busy}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            variant="outline"
            disabled={busy || Boolean(workflow?.isDefault)}
            onClick={() => setDefault.mutate({ workflowId })}
          >
            {workflow?.isDefault ? "Default" : "Set default"}
          </Button>

          <Button onClick={() => setCreateOpen(true)} disabled={busy || !workflow}>
            <Plus className="h-4 w-4" />
            New status
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <ProjectCrumbs
          items={[
            { label: "Work", href: "/portal/work" },
            { label: "Workflows", href: withProjectId("/portal/workflows", projectId) },
            { label: workflow?.name ? String(workflow.name) : workflowId.slice(0, 8) },
          ]}
        />

        <div>
          <Link href={withProjectId("/portal/workflows", projectId)}>
            <Button variant="outline">Back to workflows</Button>
          </Link>
        </div>

        {q.isLoading ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            Loading workflow...
          </div>
        ) : q.isError || !workflow ? (
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <EmptyState title="Workflow not found" description="This workflow may not exist or you don't have access." />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
              <div className="font-semibold">Safe edit warning</div>
              <div className="mt-1 leading-6">
                Workflows are tenant-wide templates. Projects assign a workflow, then boards map its statuses into
                columns. Deleting a status is blocked when it is mapped to a board or used by work items.
              </div>
              <div className="mt-2 text-xs text-amber-800/80 dark:text-amber-200/80">
                Version: {String(((workflow.metadata as any)?.version ?? 1))} • Scope: Tenant template
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <StatusReorderDnd
                  statuses={statuses}
                  disabled={reorder.isPending}
                  onReorder={(ordered) => {
                    reorder.mutate({
                      workflowId,
                      items: ordered.map((s, idx) => ({ id: s.id, order: idx })),
                    });
                  }}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Statuses</div>

                {statuses.length ? (
                  <>
                    <StatusesTable
                      rows={statuses}
                      busy={busy}
                      onDelete={(s) => setToDelete(s)}
                    />

                    {toDelete ? (
                      <div className="rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                        <div className="font-medium text-slate-900 dark:text-slate-50">Delete status?</div>
                        <div className="mt-1 text-slate-600 dark:text-slate-300">
                          {String(toDelete.name ?? "-")} ({String(toDelete.key ?? "-")})
                        </div>
                        <div className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          The API will reject this if any work item uses it or any board mapping still references it.
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" disabled={busy} onClick={() => setToDelete(null)}>
                            Cancel
                          </Button>
                          <Button
                            disabled={busy}
                            onClick={async () => {
                              await del.mutateAsync({ workflowId, statusId: toDelete.id });
                              setToDelete(null);
                            }}
                          >
                            Confirm
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    No statuses yet — create one.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <StatusCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        nextOrder={nextOrder}
        busy={addStatus.isPending}
        onSubmit={async (dto) => {
          await addStatus.mutateAsync({ workflowId, dto });
          setCreateOpen(false);
        }}
      />
    </ProjectShell>
  );
}
