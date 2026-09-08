"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarRange, FolderKanban, Search } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { normalizeList } from "@/logaxp/components/projects/project.ui";
import { cn } from "@/logaxp/lib/cn";
import type { Project } from "@/logaxp/lib/project-management/projectManagement.types";
import { withProjectId, writeStoredActiveProject } from "@/logaxp/lib/project-management/projectContext";
import { useProjects } from "@/logaxp/hooks/projects/useProjects";

function formatDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

function projectDates(project: Project) {
  const start = formatDate(project.startDate);
  const target = formatDate(project.targetDate);
  if (start && target) return `${start} -> ${target}`;
  if (start) return `Starts ${start}`;
  if (target) return `Target ${target}`;
  return "No dates set";
}

export function ProjectRequiredState({
  title = "Choose a project first.",
  description = "This area is project-scoped. Select a project and we will open the same workspace with the project context attached.",
  targetPath,
  targetLabel = "Open here",
  className,
}: {
  title?: string;
  description?: string;
  targetPath: string;
  targetLabel?: string;
  className?: string;
}) {
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const projectsQuery = useProjects({ q: deferredSearch.trim() || undefined, page: 1, pageSize: 8 });
  const projects = normalizeList<Project>(projectsQuery.data).items
    .filter((project) => !project.deletedAt)
    .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));

  return (
    <div className={cn("rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-6", className)}>
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#86BF00]/15 text-[#5E8500] dark:text-[#86BF00]">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            {description}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/portal/projects">
                <FolderKanban className="h-4 w-4" />
                Open projects
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/portal/work">
                Back to work hub
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5E8500] dark:text-[#86BF00]">
                Project context
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">Select a project</h3>
            </div>
            <div className="sm:w-72">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects..."
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {projectsQuery.isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                Loading projects...
              </div>
            ) : projectsQuery.isError ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-red-600 dark:border-slate-800 dark:bg-slate-950">
                Failed to load projects.
              </div>
            ) : projects.length ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        <FolderKanban className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                          {String(project.name ?? "Untitled project")}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono">{String(project.key ?? "-")}</span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarRange className="h-3.5 w-3.5" />
                            {projectDates(project)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link
                      href={withProjectId(targetPath, project.id)}
                      onClick={() => writeStoredActiveProject(project)}
                    >
                      {targetLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <EmptyState
                  title="No projects found"
                  description="Create a project first, then open this project-scoped workspace."
                  action={
                    <Button asChild>
                      <Link href="/portal/projects">
                        <FolderKanban className="h-4 w-4" />
                        Create project
                      </Link>
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
