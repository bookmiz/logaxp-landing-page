"use client";

import Link from "next/link";
import { ArrowRight, CalendarRange, FolderKanban, GitBranch, KanbanSquare, ListTodo } from "lucide-react";
import { cn } from "@/logaxp/lib/cn";
import { withProjectId } from "@/logaxp/lib/project-management/projectContext";

const steps = [
  {
    key: "projects",
    label: "Projects",
    title: "Scope the work",
    text: "Group goals, members, budgets, boards, and delivery activity.",
    icon: FolderKanban,
    href: "/portal/projects",
  },
  {
    key: "workflows",
    label: "Workflows",
    title: "Define movement",
    text: "Control statuses, status order, and what done means for work items.",
    icon: GitBranch,
    href: "/portal/workflows",
  },
  {
    key: "boards",
    label: "Boards",
    title: "Visualize execution",
    text: "Map workflow statuses into columns and move work through delivery.",
    icon: KanbanSquare,
    href: "/portal/boards",
  },
  {
    key: "sprints",
    label: "Sprints",
    title: "Timebox delivery",
    text: "Plan focused iterations and move selected work through execution.",
    icon: CalendarRange,
    href: "/portal/sprints",
  },
  {
    key: "work-items",
    label: "Work items",
    title: "Track the details",
    text: "Capture tasks, bugs, priorities, estimates, owners, and due dates.",
    icon: ListTodo,
    href: "/portal/work-items",
  },
];

export function WorkSystemMap({ active, projectId }: { active?: string; projectId?: string }) {
  const withProject = (href: string) => {
    if (!projectId) return href;
    return withProjectId(href, projectId);
  };

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5E8500] dark:text-[#86BF00]">Operating model</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            How projects, workflows, boards, sprints, and work items connect
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
          This is the core loop: scope the project, define the process, visualize delivery, plan sprints, then manage the work.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = active === step.key;

          return (
            <Link
              key={step.key}
              href={withProject(step.href)}
              className={cn(
                "group relative rounded-[1.2rem] border p-4 transition",
                isActive
                  ? "border-slate-950 bg-white shadow-sm dark:border-white dark:bg-slate-950"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#86BF00]/15 text-[#5E8500] dark:text-[#86BF00]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono text-slate-400">0{index + 1}</span>
              </div>

              <div className="mt-4">
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{step.label}</div>
                <h3 className="mt-1 text-base font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{step.text}</p>
              </div>

              <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#5E8500] opacity-0 transition group-hover:opacity-100 dark:text-[#86BF00]">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
