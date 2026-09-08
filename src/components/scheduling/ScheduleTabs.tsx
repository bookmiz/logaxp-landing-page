"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const TABS = [
  { name: "Overview", path: "/portal/schedule" },
  { name: "Shifts", path: "/portal/schedule/shifts" },
  { name: "Templates", path: "/portal/schedule/templates" },
  { name: "Assignments", path: "/portal/schedule/assignments" },
];

export function ScheduleTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((t) => {
        const active = pathname === t.path || (t.path !== "/portal/schedule" && pathname.startsWith(t.path));
        return (
          <Link
            key={t.path}
            href={t.path}
            className={cx(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              active
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            )}
          >
            {t.name}
          </Link>
        );
      })}
    </div>
  );
}