"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCcw, Save, ShieldCheck } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";
import { ProjectDangerZone } from "@/logaxp/components/projects/projects/ProjectDangerZone";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { useProject, useProjectSummary } from "@/logaxp/hooks/projects/useProject";
import { useArchiveProject, useDeleteProject, useRestoreProject, useUpdateProject } from "@/logaxp/hooks/projects/useProjectMutations";
import { useWorkflows } from "@/logaxp/hooks/workflows/useWorkflows";
import type { Workflow } from "@/logaxp/lib/project-management/projectManagement.types";

const statuses = ["ACTIVE", "COMPLETED", "ARCHIVED"];
const visibilities = ["TENANT", "PRIVATE", "PUBLIC"];
const healthOptions = [
  ["ON_TRACK", "On track"],
  ["AT_RISK", "At risk"],
  ["BLOCKED", "Blocked"],
  ["COMPLETED", "Completed"],
] as const;

function metadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function toDateInput(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export default function ProjectSettingsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const projectQuery = useProject(projectId);
  const summaryQuery = useProjectSummary(projectId);
  const update = useUpdateProject();
  const archive = useArchiveProject();
  const restore = useRestoreProject();
  const del = useDeleteProject();
  const workflowsQuery = useWorkflows();

  const project = projectQuery.data?.data ?? null;
  const summary = summaryQuery.data?.data ?? null;

  const [key, setKey] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState("ACTIVE");
  const [visibility, setVisibility] = React.useState("TENANT");
  const [workflowId, setWorkflowId] = React.useState("");
  const [health, setHealth] = React.useState("ON_TRACK");
  const [startDate, setStartDate] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");

  React.useEffect(() => {
    if (!project) return;
    setKey(String(project.key ?? ""));
    setName(String(project.name ?? ""));
    setDescription(String(project.description ?? ""));
    setStatus(String(project.status ?? "ACTIVE"));
    setVisibility(String(project.visibility ?? "TENANT"));
    setWorkflowId(String(project.workflowId ?? ""));
    setHealth(String(summary?.health ?? metadata(project.metadata).health ?? "ON_TRACK"));
    setStartDate(toDateInput(project.startDate));
    setTargetDate(toDateInput(project.targetDate));
  }, [project, summary?.health]);

  const dateError = startDate && targetDate && targetDate < startDate ? "Target date must be on or after start date." : "";
  const busy = update.isPending || archive.isPending || restore.isPending || del.isPending;
  const canSave = Boolean(key.trim() && name.trim() && !dateError);
  const workflows = normalizeList<Workflow>(workflowsQuery.data).items;

  return (
    <ProjectShell
      projectId={projectId}
      title="Project settings"
      subtitle="Control project identity, status, visibility, health, dates, and recovery actions."
      pill="Work • Project Settings"
      actions={
        <>
          <Button variant="outline" onClick={() => projectQuery.refetch()} disabled={projectQuery.isFetching || busy}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            disabled={!canSave || busy}
            onClick={async () => {
              await update.mutateAsync({
                id: projectId,
                dto: {
                  key: key.trim(),
                  name: name.trim(),
                  description: description.trim() || undefined,
                  status,
                  visibility,
                  workflowId: workflowId || null,
                  startDate: startDate ? toIsoDate(startDate) : null,
                  targetDate: targetDate ? toIsoDate(targetDate) : null,
                  metadata: { health },
                },
              });
            }}
          >
            <Save className="h-4 w-4" />
            Save settings
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <ProjectCrumbs
          items={[
            { label: "Work", href: "/portal/work" },
            { label: "Projects", href: "/portal/projects" },
            { label: project?.name ? String(project.name) : "Project", href: `/portal/projects/${encodeURIComponent(projectId)}` },
            { label: "Settings" },
          ]}
        />

        {projectQuery.isLoading ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            Loading project settings...
          </div>
        ) : !project ? (
          <EmptyState title="Project not found" description="This project may not exist or you may not have access." />
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-[#5E8500] dark:text-[#86BF00]" />
                  Project controls
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Input label="Project key" value={key} onChange={(event) => setKey(event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))} hint="Changing the key updates existing work item issue keys." />
                  <Input label="Project name" value={name} onChange={(event) => setName(event.target.value)} />

                  <label className="space-y-1.5">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Status</span>
                    <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950" value={status} onChange={(event) => setStatus(event.target.value)}>
                      {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Visibility</span>
                    <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950" value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                      {visibilities.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Workflow template</span>
                    <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950" value={workflowId} onChange={(event) => setWorkflowId(event.target.value)}>
                      <option value="">Use tenant default workflow</option>
                      {workflows.map((workflow) => (
                        <option key={workflow.id} value={workflow.id}>
                          {String(workflow.name ?? workflow.id)}
                          {workflow.isDefault ? " (default)" : ""}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Workflows are tenant-wide templates. A project can select one template for new work items.
                    </span>
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Health</span>
                    <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950" value={health} onChange={(event) => setHealth(event.target.value)}>
                      {healthOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>

                  <Input type="date" label="Start date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                  <Input type="date" label="Target date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} error={dateError || undefined} />

                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Description</span>
                    <textarea
                      className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-900/20 dark:border-slate-800 dark:bg-slate-950"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">Project snapshot</div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="text-slate-500">Open work</div>
                      <div className="mt-1 text-2xl font-semibold">{summary?.counts?.openWorkItems ?? 0}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="text-slate-500">Members</div>
                      <div className="mt-1 text-2xl font-semibold">{summary?.counts?.members ?? 0}</div>
                    </div>
                  </div>
                </div>

                <ProjectDangerZone
                  project={project}
                  busy={busy}
                  onArchive={async () => {
                    await archive.mutateAsync({ id: projectId });
                  }}
                  onRestore={async () => {
                    await restore.mutateAsync({ id: projectId });
                  }}
                  onDelete={async () => {
                    await del.mutateAsync({ id: projectId });
                  }}
                />
              </div>
            </div>

            <Link href={`/portal/projects/${encodeURIComponent(projectId)}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to project overview
              </Button>
            </Link>
          </>
        )}
      </div>
    </ProjectShell>
  );
}
