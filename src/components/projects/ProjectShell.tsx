"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  DollarSign,
  FolderKanban,
  GitBranch,
  KanbanSquare,
  ListTodo,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { cn } from "@/logaxp/lib/cn";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";

export type ProjectShellProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  pill?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  projectId?: string | null;
};

const workNav = [
  { label: "Projects", href: "/portal/projects", icon: FolderKanban, match: "/portal/projects" },
  { label: "Work items", href: "/portal/work-items", icon: ListTodo, match: "/portal/work-items", needsProject: true },
  { label: "Backlog", href: "/portal/backlog", icon: ClipboardList, match: "/portal/backlog", needsProject: true },
  { label: "Boards", href: "/portal/boards", icon: KanbanSquare, match: "/portal/boards", needsProject: true },
  { label: "Sprints", href: "/portal/sprints", icon: CalendarClock, match: "/portal/sprints", needsProject: true },
  { label: "Testing", href: "/portal/testing", icon: ShieldCheck, match: "/portal/testing", needsProject: true },
  { label: "Workflows", href: "/portal/workflows", icon: GitBranch, match: "/portal/workflows", preserveProject: true },
  { label: "Members", href: "/portal/projects/[projectId]/members", icon: Users, match: "/portal/projects", needsProject: true, projectPath: true },
  { label: "Finance", href: "/portal/projects/[projectId]/finance", icon: DollarSign, match: "/portal/projects", needsProject: true, projectPath: true },
  { label: "Settings", href: "/portal/projects/[projectId]/settings", icon: Settings, match: "/portal/projects", needsProject: true, projectPath: true },
];

function navHref(href: string, projectId: string, needsProject?: boolean, preserveProject?: boolean, projectPath?: boolean) {
  if (!projectId || (!needsProject && !preserveProject)) return href.includes("[projectId]") ? "/portal/projects" : href;
  if (projectPath) return href.replace("[projectId]", encodeURIComponent(projectId));
  return withProjectId(href, projectId);
}

export function ProjectShell({
  title,
  subtitle,
  pill = "Work management",
  actions,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
  projectId,
}: ProjectShellProps) {
  const pathname = usePathname();
  const navProjectId = normalizeProjectId(projectId);

  return (
    <div className={cn("min-h-0 text-slate-950 dark:text-slate-50", className)}>
      <div className="w-full">
        <header className={cn("portal-module-heading", headerClassName)}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <BadgeCheck className="h-4 w-4 text-[#86BF00]" />
                {pill}
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {actions ? <div className="flex flex-wrap items-center gap-2 lg:pt-2">{actions}</div> : null}
          </div>

          <nav className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/70 p-1.5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex min-w-max items-center gap-1.5">
              {workNav.map((item) => {
                const Icon = item.icon;
                const projectSectionActive =
                  item.projectPath && navProjectId
                    ? pathname === item.href.replace("[projectId]", navProjectId)
                    : false;
                const active = item.projectPath ? projectSectionActive : Boolean(pathname?.startsWith(item.match));
                const href = navHref(item.href, navProjectId, item.needsProject, item.preserveProject, item.projectPath);

                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition",
                      active
                        ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-950 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        <section className={cn("rounded-xl border border-slate-200 bg-white p-4 md:p-6 dark:border-slate-800 dark:bg-slate-950", contentClassName)}>
          {children}
        </section>
      </div>
    </div>
  );
}
