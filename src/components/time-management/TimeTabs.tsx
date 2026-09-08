"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, FileText, Timer, TrendingUp } from "lucide-react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Tab = { name: string; href: string; icon: React.ReactNode; description?: string };

const TABS: Tab[] = [
  { name: "Overview", href: "/portal/time-attendance", icon: <TrendingUp className="h-4 w-4" /> },
  { name: "Time Entries", href: "/portal/time-attendance/entries", icon: <FileText className="h-4 w-4" /> },
  { name: "Time Clocks", href: "/portal/time-attendance/clocks", icon: <Clock className="h-4 w-4" /> },
  { name: "Timers", href: "/portal/time-attendance/timers", icon: <Timer className="h-4 w-4" /> },
];

export function TimeTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
              "dark:bg-slate-950 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-900",
              active &&
                "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
            )}
          >
            {t.icon}
            {t.name}
          </Link>
        );
      })}
    </div>
  );
}