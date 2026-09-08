"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { FolderKanban, Plus, RefreshCcw, Search } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectToolbar } from "@/logaxp/components/projects/ProjectToolbar";
import { WorkSystemMap } from "@/logaxp/components/projects/WorkSystemMap";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { ProjectsTable } from "@/logaxp/components/projects/projects/ProjectsTable";
import { ProjectCreateEditDialog } from "@/logaxp/components/projects/projects/ProjectCreateEditDialog";

import type { Project } from "@/logaxp/lib/project-management/projectManagement.types";
import { useProjects } from "@/logaxp/hooks/projects/useProjects";
import { useCreateProject, useUpdateProject } from "@/logaxp/hooks/projects/useProjectMutations";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function countByStatus(rows: Project[], status: string) {
  return rows.filter((project) => String(project.status ?? "ACTIVE").toUpperCase() === status).length;
}

export default function PortalProjectsPage() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";

  const [search, setSearch] = React.useState(q);
  const deferredSearch = React.useDeferredValue(search);

  const projectsQuery = useProjects({
    q: deferredSearch.trim() || undefined,
    page: 1,
    pageSize: 50,
  });

  const create = useCreateProject();
  const update = useUpdateProject();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editProject, setEditProject] = React.useState<Project | null>(null);

  const { items } = normalizeList<Project>(projectsQuery.data);

  const rows = React.useMemo(() => {
    return [...items].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  }, [items]);

  const stats = [
    { label: "Total projects", value: rows.length },
    { label: "Active", value: countByStatus(rows, "ACTIVE") },
    { label: "Archived", value: countByStatus(rows, "ARCHIVED") },
  ];

  return (
    <ProjectShell
      title="Projects"
      subtitle="Plan work at the project level, then connect each project to workflows, boards, work items, members, timelines, and finance."
      pill="Work • Projects"
      actions={
        <>
          <Button variant="outline" onClick={() => projectsQuery.refetch()} disabled={projectsQuery.isFetching}>
            <RefreshCcw className={cn("h-4 w-4", projectsQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>

          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <WorkSystemMap active="projects" />

        <div className="grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-5">
          <ProjectToolbar
            searchLabel="Search projects"
            searchPlaceholder="Search by name, key, or description..."
            searchValue={search}
            onSearchChange={setSearch}
            left={
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Search className="h-4 w-4" />
                Filter the project workspace list
              </div>
            }
          />
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">Project workspace list</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {rows.length} project{rows.length === 1 ? "" : "s"}.
              </p>
            </div>
          </div>

          {projectsQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Loading projects...
            </div>
          ) : projectsQuery.isError ? (
            <div className="rounded-2xl border border-slate-200 p-6 text-sm text-red-600 dark:border-slate-800">
              Failed to load projects.
            </div>
          ) : rows.length ? (
            <ProjectsTable rows={rows} onEdit={(project) => setEditProject(project)} />
          ) : (
            <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
              <EmptyState
                title="No projects yet"
                description="Create your first project to start managing boards, workflows, work items, and delivery activity."
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <FolderKanban className="h-4 w-4" />
                    Create project
                  </Button>
                }
              />
            </div>
          )}
        </div>

        <ProjectCreateEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          busy={create.isPending}
          onSubmit={async (dto) => {
            await create.mutateAsync(dto as any);
            setCreateOpen(false);
            await projectsQuery.refetch();
          }}
        />

        <ProjectCreateEditDialog
          open={Boolean(editProject)}
          onOpenChange={(open) => !open && setEditProject(null)}
          mode="edit"
          project={editProject}
          busy={update.isPending}
          onSubmit={async (dto) => {
            if (!editProject) return;
            await update.mutateAsync({ id: editProject.id, dto: dto as any });
            setEditProject(null);
            await projectsQuery.refetch();
          }}
        />
      </div>
    </ProjectShell>
  );
}
