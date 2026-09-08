// src/app/portal/org-structure/page.tsx
"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Building2,
  Network,
  Briefcase,
  MapPin,
  Wallet,
  ArrowRight,
} from "lucide-react";

import { Card, CardTitle, CardDescription,  } from "@/logaxp/components/ui/card";
import { cn } from "@/logaxp/lib/cn";

type CardItem = {
  href: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  tone: "emerald" | "blue" | "purple";
};

const cards: CardItem[] = [
  {
    href: "/portal/org-structure/org-units",
    title: "Org Units",
    desc: "Divisions, departments, teams, and business groups",
    icon: Building2,
    badge: "Core",
    tone: "emerald",
  },
  {
    href: "/portal/org-structure/org-units/tree",
    title: "Org Tree",
    desc: "Interactive visual hierarchy of your entire structure",
    icon: Network,
    badge: "Visual",
    tone: "blue",
  },
  {
    href: "/portal/org-structure/positions",
    title: "Positions",
    desc: "Job roles, titles, grades, and reporting lines",
    icon: Briefcase,
    tone: "emerald",
  },
  {
    href: "/portal/org-structure/locations",
    title: "Locations",
    desc: "Offices, branches, remote sites, and geo zones",
    icon: MapPin,
    tone: "blue",
  },
  {
    href: "/portal/org-structure/cost-centers",
    title: "Cost Centers",
    desc: "Budget tracking, departments, and financial buckets",
    icon: Wallet,
    tone: "purple",
  },
];

function ToneChip({ tone }: { tone: CardItem["tone"] }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
    purple: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium ring-1",
        styles[tone]
      )}
    >
      {tone === "emerald" ? "Structure" : tone === "blue" ? "Visualization" : "Finance"}
    </span>
  );
}

export default function OrgStructureHomePage() {
  const pathname = usePathname();

  return (
    <div className="space-y-8 pb-12">

      {/* ─── Card Grid ─────────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          const active =
            pathname === c.href ||
            (c.href !== "/portal/org-structure/org-units/tree" && pathname?.startsWith(c.href));

          return (
            <Link
              key={c.href}
              href={c.href}
              className="group block focus:outline-none"
              aria-label={c.title}
            >
              <Card
                className={cn(
                  "relative h-full overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-xl hover:ring-1",
                  "dark:bg-slate-950",
                  active
                    ? "border-primary/50 bg-primary/5 ring-primary/20 dark:border-primary/40 dark:bg-primary/5/10"
                    : "border-border hover:border-primary/30 dark:hover:border-primary/40"
                )}
              >
                {/* Glow effect */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    c.tone === "emerald"
                      ? "bg-gradient-to-br from-emerald-400/10 to-transparent"
                      : c.tone === "blue"
                      ? "bg-gradient-to-br from-blue-400/10 to-transparent"
                      : "bg-gradient-to-br from-purple-400/10 to-transparent"
                  )}
                />

                <div className="relative flex h-full flex-col">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border shadow-sm transition-transform group-hover:scale-105",
                          c.tone === "emerald"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/30 dark:bg-emerald-950/30 dark:text-emerald-300"
                            : c.tone === "blue"
                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700/30 dark:bg-blue-950/30 dark:text-blue-300"
                            : "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700/30 dark:bg-purple-950/30 dark:text-purple-300"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div>
                        <CardTitle className="text-xl font-semibold">{c.title}</CardTitle>
                        <CardDescription className="mt-1.5 text-base">{c.desc}</CardDescription>
                      </div>
                    </div>

                    <ToneChip tone={c.tone} />
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-6">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {active ? (
                        <span className="text-primary">Currently viewing</span>
                      ) : (
                        "Open module"
                      )}
                    </div>

                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                        "border-slate-200 bg-white text-slate-700 group-hover:border-primary group-hover:text-primary group-hover:shadow-sm",
                        "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:border-primary dark:group-hover:text-primary"
                      )}
                    >
                      Enter
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}