"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { GitBranch, Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { WorkSystemMap } from "@/logaxp/components/projects/WorkSystemMap";
import { normalizeList } from "@/logaxp/components/projects/project.ui";

import type { Workflow } from "@/logaxp/lib/project-management/projectManagement.types";

import { useWorkflows } from "@/logaxp/hooks/workflows/useWorkflows";
import {
  useCloneWorkflow,
  useCreateWorkflow,
  useRenameWorkflow,
  useSetDefaultWorkflow,
} from "@/logaxp/hooks/workflows/useWorkflowMutations";

import { WorkflowsTable } from "@/logaxp/components/projects/workflows/WorkflowsTable";
import { WorkflowCreateDialog } from "@/logaxp/components/projects/workflows/WorkflowCreateDialog";
import { WorkflowRenameDialog } from "@/logaxp/components/projects/workflows/WorkflowRenameDialog";
import { normalizeProjectId } from "@/logaxp/lib/project-management/projectContext";

function statusCount(workflow: Workflow) {
  return Array.isArray(workflow.statuses) ? workflow.statuses.length : 0;
}

export default function WorkflowsPage() {
  const sp = useSearchParams();
  const projectId = normalizeProjectId(sp.get("projectId"));
  const q = useWorkflows();
  const create = useCreateWorkflow();
  const clone = useCloneWorkflow();
  const rename = useRenameWorkflow();
  const setDefault = useSetDefaultWorkflow();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<Workflow | null>(null);

  const { items } = normalizeList<Workflow>(q.data);

  const rows = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const defaultSort = Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault));
      if (defaultSort !== 0) return defaultSort;
      return String(a.name ?? "").localeCompare(String(b.name ?? ""));
    });
  }, [items]);

  const busy = create.isPending || clone.isPending || rename.isPending || setDefault.isPending;
  const totalStatuses = rows.reduce((sum, workflow) => sum + statusCount(workflow), 0);

  const stats = [
    { label: "Workflows", value: rows.length },
    { label: "Default", value: rows.filter((workflow) => workflow.isDefault).length },
    { label: "Statuses", value: totalStatuses },
  ];

  return (
    <ProjectShell
      projectId={projectId}
      title="Workflows"
      subtitle="Tenant-wide workflow templates. Projects and boards can use these statuses while preserving project context during navigation."
      pill="Work • Workflows"
      actions={
        <>
          <Button variant="outline" onClick={() => q.refetch()} disabled={q.isFetching || busy}>
            <RefreshCcw className={q.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={busy}>
            <Plus className="h-4 w-4" />
            New workflow
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <WorkSystemMap active="workflows" projectId={projectId} />

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
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">Workflow definitions</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Keep statuses consistent across boards so reporting and movement stay clean.
              </p>
            </div>
          </div>

          {q.isLoading ? (
            <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Loading workflows...
            </div>
          ) : q.isError ? (
            <div className="rounded-2xl border border-slate-200 p-6 text-sm text-red-600 dark:border-slate-800">
              Failed to load workflows.
            </div>
          ) : rows.length ? (
            <WorkflowsTable
              rows={rows}
              projectId={projectId}
              busy={busy}
              onRename={(workflow) => setRenameTarget(workflow)}
              onClone={(workflow) => clone.mutate({ workflowId: workflow.id })}
              onSetDefault={(workflow) => setDefault.mutate({ workflowId: workflow.id })}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
              <EmptyState
                title="No workflows yet"
                description="Create a workflow, add statuses, then map those statuses into board columns."
                action={
                  <Button onClick={() => setCreateOpen(true)} disabled={busy}>
                    <GitBranch className="h-4 w-4" />
                    Create workflow
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      <WorkflowCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        busy={create.isPending}
        onSubmit={async (dto) => {
          await create.mutateAsync(dto);
          setCreateOpen(false);
        }}
      />

      <WorkflowRenameDialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        workflow={renameTarget}
        busy={rename.isPending}
        onSubmit={async (name) => {
          if (!renameTarget) return;
          await rename.mutateAsync({ workflowId: renameTarget.id, dto: { name } });
          setRenameTarget(null);
        }}
      />
    </ProjectShell>
  );
}
