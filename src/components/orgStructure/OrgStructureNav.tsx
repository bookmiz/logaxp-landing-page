// src/components/orgStructure/OrgStructureNav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/logaxp/lib/cn";
import {
  Building2,
  GitBranch,
  Briefcase,
  MapPin,
  Wallet,
} from "lucide-react";

const tabs = [
  { href: "/portal/org-structure/org-units", label: "Org Units", icon: Building2 },
  { href: "/portal/org-structure/org-units/tree", label: "Tree View", icon: GitBranch },
  { href: "/portal/org-structure/positions", label: "Positions", icon: Briefcase },
  { href: "/portal/org-structure/locations", label: "Locations", icon: MapPin },
  { href: "/portal/org-structure/cost-centers", label: "Cost Centers", icon: Wallet },
];

export function OrgStructureNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex overflow-x-auto scrollbar-hide border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
      aria-label="Organization structure navigation"
    >
      <div className="flex items-center gap-1 px-1 py-2.5 min-w-max">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "group relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                isActive
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40"
              )}
            >
              {/* Icon */}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                )}
              />

              {/* Label */}
              <span>{tab.label}</span>

              {/* Active indicator - clean underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}