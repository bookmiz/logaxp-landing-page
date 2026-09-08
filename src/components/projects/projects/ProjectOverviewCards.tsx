"use client";

import Link from "next/link";
import * as React from "react";
import { 
  LayoutGrid, 
  ListChecks, 
  Rocket, 
  ShieldCheck, 
  Workflow,
  TrendingUp,
  Users,
  Clock,
  ArrowRight
} from "lucide-react";
import type { Project, ProjectSummary } from "@/logaxp/lib/project-management/projectManagement.types";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Card icon mapping with colors
const cardConfig = [
  { 
    href: (id: string) => `/portal/boards?projectId=${encodeURIComponent(id)}`, 
    title: "Boards", 
    desc: "Kanban boards and columns", 
    icon: LayoutGrid,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
    statKey: "boards"
  },
  { 
    href: (id: string) => `/portal/work-items?projectId=${encodeURIComponent(id)}`, 
    title: "Work Items", 
    desc: "Tasks, issues, tracking", 
    icon: ListChecks,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
    statKey: "openWorkItems"
  },
  { 
    href: (id: string) => `/portal/sprints?projectId=${encodeURIComponent(id)}`, 
    title: "Sprints", 
    desc: "Backlog and sprint lifecycle", 
    icon: Rocket,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "group-hover:border-purple-200 dark:group-hover:border-purple-800",
    statKey: "sprints"
  },
  { 
    href: (id: string) => `/portal/workflows?projectId=${encodeURIComponent(id)}`, 
    title: "Workflows", 
    desc: "Statuses and workflow config", 
    icon: Workflow,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "group-hover:border-amber-200 dark:group-hover:border-amber-800",
    statText: "Tenant-wide"
  },
  { 
    href: (id: string) => `/portal/testing?projectId=${encodeURIComponent(id)}`, 
    title: "Testing", 
    desc: "Suites, cases, plans and runs", 
    icon: ShieldCheck,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
    statKey: "testCases"
  },
  { 
    href: (id: string) => `/portal/projects/${encodeURIComponent(id)}/finance`, 
    title: "Finance", 
    desc: "Project financials and budgets", 
    icon: TrendingUp,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "group-hover:border-cyan-200 dark:group-hover:border-cyan-800",
    statKey: "budgets"
  },
  { 
    href: (id: string) => `/portal/projects/${encodeURIComponent(id)}/members`, 
    title: "Team", 
    desc: "Team members and assignments", 
    icon: Users,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "group-hover:border-indigo-200 dark:group-hover:border-indigo-800",
    statKey: "members"
  },
  { 
    href: (id: string) => `/portal/projects/${encodeURIComponent(id)}/timeline`, 
    title: "Timeline", 
    desc: "Project roadmap and milestones", 
    icon: Clock,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "group-hover:border-orange-200 dark:group-hover:border-orange-800",
    statKey: "milestones"
  },
];

export function ProjectOverviewCards({ project, summary }: { project: Project; summary?: ProjectSummary | null }) {
  const projectId = project.id;
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  const getCardStats = (card: (typeof cardConfig)[number]) => {
    if ("statText" in card && card.statText) return card.statText;
    if (!("statKey" in card) || !card.statKey) return "";
    const value = summary?.counts?.[card.statKey] ?? 0;
    const suffixMap: Record<string, string> = {
      boards: "boards",
      openWorkItems: "open",
      sprints: "sprints",
      testCases: "cases",
      budgets: "budgets",
      members: "members",
      milestones: "milestones",
    };
    return `${value} ${suffixMap[card.statKey] ?? ""}`.trim();
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const isHovered = hoveredCard === card.title;
        const stats = getCardStats(card);

        return (
          <Link
            key={card.title}
            href={card.href(projectId)}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5",
              "transition-all duration-300 ease-out",
              "hover:scale-[1.02] hover:shadow-lg",
              "dark:border-slate-800 dark:bg-slate-950",
              card.borderColor
            )}
            onMouseEnter={() => setHoveredCard(card.title)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Background gradient effect on hover */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
              "group-hover:opacity-100",
              card.bgColor.replace('bg-', 'from-').replace('/30', '/10') + ' to-transparent'
            )} />

            <div className="relative">
              {/* Header with icon and title */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-300",
                    card.bgColor,
                    card.borderColor,
                    isHovered && "scale-110"
                  )}>
                    <Icon className={cn("h-6 w-6", card.color)} />
                  </div>
                  
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {card.desc}
                    </p>
                  </div>
                </div>

                {/* Stats badge */}
                {stats && (
                  <span className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    card.bgColor,
                    card.color
                  )}>
                    {stats}
                  </span>
                )}
              </div>

              {/* Footer with arrow on hover */}
              <div className="mt-4 flex items-center justify-end">
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-all duration-300",
                  card.color,
                  isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                )}>
                  <span>View</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Progress indicator (optional) */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100 dark:bg-slate-800">
                <div className={cn(
                  "h-full w-1/3 rounded-full transition-all duration-500",
                  card.color.replace('text-', 'bg-')
                )} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
