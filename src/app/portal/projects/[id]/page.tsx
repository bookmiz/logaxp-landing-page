"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil, Users, ArrowLeft, Settings, Activity, AlertCircle, DollarSign, Clock3 } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Badge } from "@/logaxp/components/ui/badge";
import { Skeleton } from "@/logaxp/components/ui/skeleton";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";

import { ProjectOverviewCards } from "@/logaxp/components/projects/projects/ProjectOverviewCards";
import { ProjectMetaCard } from "@/logaxp/components/projects/projects/ProjectMetaCard";
import { ProjectDangerZone } from "@/logaxp/components/projects/projects/ProjectDangerZone";
import { ProjectCreateEditDialog } from "@/logaxp/components/projects/projects/ProjectCreateEditDialog";

import { useProject, useProjectActivity, useProjectSummary } from "@/logaxp/hooks/projects/useProject";
import { useArchiveProject, useDeleteProject, useRestoreProject, useUpdateProject } from "@/logaxp/hooks/projects/useProjectMutations";
import { writeStoredActiveProject } from "@/logaxp/lib/project-management/projectContext";

// Loading skeleton component
function ProjectOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Back button skeleton */}
      <Skeleton className="h-10 w-32" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function ProjectOverviewPage() {
  const { id: projectId } = useParams<{ id: string }>();

  const projectQuery = useProject(projectId);
  const summaryQuery = useProjectSummary(projectId);
  const activityQuery = useProjectActivity(projectId);
  const update = useUpdateProject();
  const archive = useArchiveProject();
  const restore = useRestoreProject();
  const del = useDeleteProject();

  const [editOpen, setEditOpen] = React.useState(false);

  const project = projectQuery.data?.data;
  const summary = summaryQuery.data?.data ?? null;
  const activityRows = activityQuery.data?.data ?? [];

  React.useEffect(() => {
    if (project) writeStoredActiveProject(project);
  }, [project]);

  // Status badge color based on project status
  const getStatusBadge = () => {
    if (!project?.status) return null;
    
    const status = String(project.status).toUpperCase();
    const statusConfig: Record<string, { color: string; label: string }> = {
      ACTIVE: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
        label: "Active"
      },
      ARCHIVED: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800",
        label: "Archived"
      },
      COMPLETED: {
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
        label: "Completed"
      },
    };

    const config = statusConfig[status] || {
      color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800",
      label: status
    };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <ProjectShell
      projectId={projectId}
      title={
        <div className="flex items-center gap-3">
          {project?.name ? String(project.name) : "Project"}
          {getStatusBadge()}
        </div>
      }
      subtitle={
        project?.description 
          ? String(project.description) 
          : "Project overview and management dashboard."
      }
      pill={
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" />
          <span>Work • Project Overview</span>
        </div>
      }
      actions={
        project ? (
          <div className="flex items-center gap-2">
            <Link href={`/portal/projects/${encodeURIComponent(projectId)}/members`}>
              <Button 
                variant="outline" 
                className="gap-2 border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Members</span>
              </Button>
            </Link>

            <Button 
              variant="outline" 
              onClick={() => setEditOpen(true)}
              className="gap-2 border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Link href={`/portal/projects/${encodeURIComponent(projectId)}/finance`}>
              <Button
                variant="outline"
                className="gap-2 border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Finance</span>
              </Button>
            </Link>

            <Link href={`/portal/projects/${encodeURIComponent(projectId)}/settings`}>
              <Button 
                variant="outline" 
                className="gap-2 border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </Link>
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Breadcrumb navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ProjectCrumbs
            items={[
              { label: "Work", href: "/portal/work" },
              { label: "Projects", href: "/portal/projects" },
              { label: project?.name ? String(project.name) : "Project" },
            ]}
          />

          {/* Back button - mobile friendly */}
          <Link href="/portal/projects">
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Button>
          </Link>
        </div>

        {/* Content area */}
        {projectQuery.isLoading ? (
          <ProjectOverviewSkeleton />
        ) : projectQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 dark:border-red-900/30 dark:bg-red-950/20">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
              <h3 className="mt-4 text-lg font-semibold text-red-700 dark:text-red-400">
                Failed to load project
              </h3>
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                There was an error loading the project. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() => projectQuery.refetch()}
                className="mt-4 border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : !project ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-950">
            <EmptyState 
              title="Project not found" 
              description="This project may not exist or you don't have access."
              action={
                <Link href="/portal/projects">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to projects
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <ProjectOverviewCards project={project} summary={summary} />

            {/* Two-column layout for metadata and danger zone */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ProjectMetaCard project={project} summary={summary} />
              <ProjectDangerZone
                project={project}
                busy={archive.isPending || restore.isPending || del.isPending}
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

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                <Clock3 className="h-4 w-4 text-[#5E8500] dark:text-[#86BF00]" />
                Project activity
              </div>
              <div className="mt-3 space-y-2">
                {activityQuery.isLoading ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Loading activity...</div>
                ) : activityRows.length ? (
                  activityRows.slice(0, 8).map((row) => (
                    <div key={row.id} className="flex flex-col gap-1 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="font-semibold text-slate-950 dark:text-white">{String(row.action ?? "UPDATE")}</span>
                        <span className="ml-2 text-slate-500 dark:text-slate-400">{String(row.entityType ?? "Project")}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">No project activity yet.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <ProjectCreateEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        project={project ?? null}
        busy={update.isPending}
        onSubmit={async (dto) => {
          await update.mutateAsync({ id: projectId, dto: dto as any });
          setEditOpen(false);
        }}
      />
    </ProjectShell>
  );
}
