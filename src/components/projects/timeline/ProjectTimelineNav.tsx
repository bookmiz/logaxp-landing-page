// src/logaxp/components/projects/timeline/ProjectTimelineNav.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Flag, Zap } from "lucide-react";

import { cn } from "./timeline.ui";

type Tab = {
  key: "roadmap" | "milestones" | "events";
  label: string;
  href: (projectId: string) => string;
  icon: React.ReactNode;
};

const TABS: Tab[] = [
  {
    key: "roadmap",
    label: "Roadmap",
    href: (id) => `/portal/projects/${encodeURIComponent(id)}/timeline`,
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    key: "milestones",
    label: "Milestones",
    href: (id) => `/portal/projects/${encodeURIComponent(id)}/timeline/milestones`,
    icon: <Flag className="h-4 w-4" />,
  },
  {
    key: "events",
    label: "Events",
    href: (id) => `/portal/projects/${encodeURIComponent(id)}/timeline/events`,
    icon: <Zap className="h-4 w-4" />,
  },
];

export function ProjectTimelineNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  const active = React.useMemo(() => {
    if (pathname?.endsWith("/timeline/milestones")) return "milestones";
    if (pathname?.endsWith("/timeline/events")) return "events";
    return "roadmap";
  }, [pathname]);

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const isActive = active === t.key;
        return (
          <Link key={t.key} href={t.href(projectId)}>
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",
                isActive &&
                  "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
              )}
            >
              {t.icon}
              {t.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}