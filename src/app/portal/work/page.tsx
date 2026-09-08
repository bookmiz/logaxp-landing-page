// src/app/portal/work/page.tsx
"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  LayoutGrid,
  ListChecks,
  Settings,
  ShieldCheck,
  Workflow,
  ArrowRight,
  Sparkles,
  X,
  Search as SearchIcon,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import {
  type ActiveProjectContext,
  normalizeProjectId,
  readStoredActiveProject,
  withProjectId,
  writeStoredActiveProject,
} from "@/logaxp/lib/project-management/projectContext";

import type { Project } from "@/logaxp/lib/project-management/projectManagement.types";
import { useProjects } from "@/logaxp/hooks/projects/useProjects";
import { normalizeList as normalizeProjects } from "@/logaxp/components/projects/project.ui";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type WorkCard = {
  href: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  tone: "emerald" | "blue";
  needsProject?: boolean;
};

const items: WorkCard[] = [
  {
    href: "/portal/projects",
    title: "Projects",
    desc: "Create and organize projects and members",
    icon: ClipboardList,
    badge: "Core",
    tone: "emerald",
    needsProject: false,
  },
  {
    href: "/portal/boards",
    title: "Boards",
    desc: "Visual delivery lanes for project execution",
    icon: LayoutGrid,
    badge: "Flow",
    tone: "blue",
    needsProject: true,
  },
  {
    href: "/portal/work-items",
    title: "Work Items",
    desc: "Tasks, bugs, stories, owners, and priorities",
    icon: ListChecks,
    tone: "emerald",
    needsProject: true,
  },
  {
    href: "/portal/workflows",
    title: "Workflows",
    desc: "Reusable status models for work movement",
    icon: Workflow,
    tone: "blue",
    needsProject: false,
  },
  {
    href: "/portal/testing",
    title: "Testing",
    desc: "Suites, cases, plans and runs",
    icon: ShieldCheck,
    badge: "QA",
    tone: "emerald",
    needsProject: true,
  },
  {
    href: "/portal/settings",
    title: "Admin",
    desc: "Workspace settings and security",
    icon: Settings,
    tone: "blue",
    needsProject: false,
  },
];

function ToneChip({ tone }: { tone: WorkCard["tone"] }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2 text-[11px] font-medium",
        tone === "emerald"
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
          : "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20"
      )}
    >
      {tone === "emerald" ? "Work" : "Ops"}
    </span>
  );
}

function ProjectPickerDialog({
  open,
  onClose,
  onPick,
  currentProjectId,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (p: ActiveProjectContext) => void;
  currentProjectId?: string;
}) {
  const [search, setSearch] = React.useState("");
  const deferred = React.useDeferredValue(search);

  const projectsQuery = useProjects({
    q: deferred.trim() || undefined,
    page: 1,
    pageSize: 50,
  });

  const { items } = normalizeProjects<Project>(projectsQuery.data);
  const rows = React.useMemo(() => {
    return [...items].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  }, [items]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* modal */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Select a project</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Modules like Boards, Work Items, Workflows and Testing require a project context.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            <Input
              label="Search"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />

            <div className="mt-3">
              {projectsQuery.isLoading ? (
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  Loading projects...
                </div>
              ) : projectsQuery.isError ? (
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-red-600 dark:border-slate-800">
                  Failed to load projects.
                </div>
              ) : rows.length ? (
                <div className="max-h-[55vh] space-y-2 overflow-auto pr-1">
                  {rows.map((p) => {
                    const pid = String(p.id);
                    const active = currentProjectId && pid === currentProjectId;

                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => onPick({ id: pid, name: String(p.name ?? "") || undefined, key: String(p.key ?? "") || undefined })}
                        className={cn(
                          "w-full text-left rounded-2xl border p-3 transition",
                          "border-slate-200 hover:border-slate-900 hover:bg-slate-50",
                          "dark:border-slate-800 dark:hover:border-slate-100 dark:hover:bg-slate-900/40"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {String(p.name ?? "Untitled Project")}
                            </div>
                            <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                              {p.description ? String(p.description) : "No description."}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {active ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Active
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">Select</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <EmptyState title="No projects found" description="Create a project first, then come back to select it." />
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <Link href="/portal/projects" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50">
                Manage projects →
              </Link>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkHomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // projectId can come from URL or localStorage
  const projectIdFromUrl = normalizeProjectId(sp.get("projectId"));

  const [activeProject, setActiveProject] = React.useState<ActiveProjectContext | null>(() => {
  // client component, safe to read localStorage here
  return readStoredActiveProject();
});
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);

  // hydrate active project from URL or localStorage
  React.useEffect(() => {
    // if URL has a valid projectId, prefer it and persist it
    if (projectIdFromUrl) {
      const prev = readStoredActiveProject();
      const next: ActiveProjectContext = { id: projectIdFromUrl, name: prev?.id === projectIdFromUrl ? prev?.name : undefined, key: prev?.id === projectIdFromUrl ? prev?.key : undefined };
      writeStoredActiveProject(next);
      setActiveProject(next);
      return;
    }

    // else, attempt to restore from storage
    const stored = readStoredActiveProject();
    if (stored?.id) {
      setActiveProject(stored);
      // keep /portal/work in sync so all subsequent links can just read projectId
      router.replace(withProjectId("/portal/work", stored.id));
    } else {
      setActiveProject(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdFromUrl]);

  const activeProjectId = normalizeProjectId(activeProject?.id ?? projectIdFromUrl);

  return (
    <ProjectShell projectId={activeProjectId} title="Work" subtitle="Project management, boards, work items, workflows, and testing." pill="Portal • Work">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              Work Hub
            </div>

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Everything that ships — in one place
            </h1>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Projects, boards, work items, workflows, and QA — organized and tenant-safe.
            </p>

            {/* Active project bar */}
            <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <span className="font-medium">Active project:</span>
              {activeProjectId ? (
                <>
                  <span className="font-semibold">{activeProject?.name ?? activeProjectId.slice(0, 8)}</span>
                  <span className="text-slate-500 dark:text-slate-400">({activeProjectId.slice(0, 8)})</span>
                </>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">None selected</span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPendingHref(null);
                  setPickerOpen(true);
                }}
              >
                {activeProjectId ? "Change" : "Select project"}
              </Button>
            </div>
          </div>

          <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            Tip: Start with <span className="font-medium text-slate-700 dark:text-slate-200">Projects</span>, then boards & work items.
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => {
            const Icon = c.icon;

            const active =
              pathname === c.href || (c.href !== "/portal/settings" && pathname?.startsWith(c.href));

            const targetHref =
              c.needsProject ? withProjectId(c.href, activeProjectId) : c.href;

            return (
              <Link
                key={c.href}
                href={targetHref}
                className="group focus:outline-none"
                aria-label={c.title}
                onClick={(e) => {
                  if (c.needsProject && !activeProjectId) {
                    e.preventDefault();
                    setPendingHref(c.href);
                    setPickerOpen(true);
                  }
                }}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    "dark:bg-slate-950",
                    active
                      ? "border-slate-900 ring-1 ring-slate-900/10 dark:border-slate-100 dark:ring-slate-100/10"
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  {/* glow blobs */}
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl opacity-60",
                      c.tone === "emerald"
                        ? "bg-emerald-200 dark:bg-emerald-500/20"
                        : "bg-sky-200 dark:bg-sky-500/20"
                    )}
                  />
                  <div className="pointer-events-none absolute -left-10 -bottom-16 h-44 w-44 rounded-full bg-slate-200 blur-3xl opacity-40 dark:bg-slate-700/20" />

                  <CardHeader className="relative pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "grid h-11 w-11 place-items-center rounded-xl border shadow-sm",
                            c.tone === "emerald"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                              : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="truncate">{c.title}</span>
                            {c.badge ? (
                              <span className="inline-flex h-6 items-center rounded-full bg-slate-900 px-2 text-[11px] font-medium text-white dark:bg-slate-100 dark:text-slate-900">
                                {c.badge}
                              </span>
                            ) : null}
                          </CardTitle>

                          <CardDescription className="mt-1 text-sm">{c.desc}</CardDescription>
                        </div>
                      </div>

                      <ToneChip tone={c.tone} />
                    </div>
                  </CardHeader>

                  <CardContent className="relative pt-0">
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {c.needsProject && !activeProjectId ? (
                          <span className="font-medium text-amber-700 dark:text-amber-300">Select project first</span>
                        ) : active ? (
                          <span className="font-medium text-slate-700 dark:text-slate-200">You’re here</span>
                        ) : (
                          <span>Open module</span>
                        )}
                      </div>

                      <div
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition",
                          "border-slate-200 bg-white text-slate-800 group-hover:border-slate-900 group-hover:text-slate-900",
                          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:group-hover:border-slate-100 dark:group-hover:text-slate-50"
                        )}
                      >
                        Go
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <div className="mt-4 h-px w-full bg-slate-100 dark:bg-slate-800" />

                    <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                      Modules are permission-guarded (RBAC) — access depends on your role.
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Picker */}
      <ProjectPickerDialog
        open={pickerOpen}
        currentProjectId={activeProjectId}
        onClose={() => {
          setPickerOpen(false);
          setPendingHref(null);
        }}
        onPick={(p) => {
          const pid = normalizeProjectId(p.id);
          if (!pid) return;

          const next: ActiveProjectContext = { id: pid, name: p.name, key: p.key };
          writeStoredActiveProject(next);
          setActiveProject(next);

          setPickerOpen(false);

          // If user clicked a module card, continue there; else keep Work page in sync
          if (pendingHref) {
            router.push(withProjectId(pendingHref, pid));
            setPendingHref(null);
          } else {
            router.replace(withProjectId("/portal/work", pid));
          }
        }}
      />
    </ProjectShell>
  );
}
