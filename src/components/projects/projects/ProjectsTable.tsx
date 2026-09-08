"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, FolderKanban, Globe, Lock, Eye, Calendar, Clock, MoreHorizontal, Pencil } from "lucide-react";
import type { Project } from "@/logaxp/lib/project-management/projectManagement.types";
import { writeStoredActiveProject } from "@/logaxp/lib/project-management/projectContext";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    ACTIVE: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
      label: "Active"
    },
    ARCHIVED: {
      color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800",
      label: "Archived"
    },
    COMPLETED: {
      color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
      label: "Completed"
    },
  };

  const config = statusConfig[status] || {
    color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800",
    label: status
  };

  return (
    <span className={cx(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      config.color
    )}>
      {config.label}
    </span>
  );
}

// Visibility icon component
function VisibilityIcon({ visibility }: { visibility: string }) {
  const iconConfig: Record<string, { icon: typeof Globe; color: string }> = {
    PUBLIC: { icon: Globe, color: "text-emerald-600 dark:text-emerald-400" },
    TENANT: { icon: Eye, color: "text-blue-600 dark:text-blue-400" },
    PRIVATE: { icon: Lock, color: "text-slate-600 dark:text-slate-400" },
  };

  const config = iconConfig[visibility] || { icon: Eye, color: "text-slate-600 dark:text-slate-400" };
  const Icon = config.icon;

  return <Icon className={cx("h-4 w-4", config.color)} />;
}

export function ProjectsTable({ rows, onEdit }: { rows: Project[]; onEdit?: (project: Project) => void }) {
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-950">
        <FolderKanban className="h-12 w-12 text-slate-300 dark:text-slate-700" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No projects found</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40">
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Project
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Key
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Dates
                </span>
              </th>
              <th className="px-6 py-4 text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((project, index) => {
              const name = String(project.name ?? "Untitled project");
              const key = String(project.key ?? "-");
              const status = String(project.status ?? "ACTIVE");
              const visibility = String(project.visibility ?? "PRIVATE");
              const description = project.description ? String(project.description) : null;
              
              // Format dates
              const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString() : null;
              const targetDate = project.targetDate ? new Date(project.targetDate).toLocaleDateString() : null;
              const hasDates = startDate || targetDate;

              return (
                <tr
                  key={project.id}
                  className={cx(
                    "group transition-all duration-200",
                    index % 2 === 0 
                      ? "bg-white dark:bg-slate-950" 
                      : "bg-slate-50/50 dark:bg-slate-900/20",
                    hoveredRow === project.id && "bg-slate-100/50 dark:bg-slate-800/30"
                  )}
                  onMouseEnter={() => setHoveredRow(project.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Project column */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={cx(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-all",
                        hoveredRow === project.id
                          ? "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                      )}>
                        <FolderKanban className={cx(
                          "h-5 w-5 transition-colors",
                          hoveredRow === project.id
                            ? "text-slate-700 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-500"
                        )} />
                      </div>

                      {/* Name and description */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/portal/projects/${encodeURIComponent(project.id)}`}
                            className="group/link"
                            onClick={() => writeStoredActiveProject(project)}
                          >
                            <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover/link:text-blue-600 dark:text-slate-100 dark:group-hover/link:text-blue-400">
                              {name}
                            </h3>
                          </Link>
                          <VisibilityIcon visibility={visibility} />
                        </div>
                        
                        {description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {description}
                          </p>
                        )}

                        {/* Mobile-friendly metadata (hidden on larger screens) */}
                        <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                          <StatusBadge status={status} />
                          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                            {key}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Key column - hidden on mobile */}
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {key}
                    </code>
                  </td>

                  {/* Status column - hidden on mobile */}
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <StatusBadge status={status} />
                  </td>

                  {/* Dates column */}
                  <td className="px-6 py-4">
                    {hasDates ? (
                      <div className="space-y-1">
                        {startDate && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Start: {startDate}</span>
                          </div>
                        )}
                        {targetDate && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Target: {targetDate}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="block text-xs text-slate-400 dark:text-slate-500">No dates set</span>
                        {onEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(project)}
                            className="text-xs font-semibold text-[#5E8500] hover:underline dark:text-[#86BF00]"
                          >
                            Set dates
                          </button>
                        ) : null}
                      </div>
                    )}
                    {hasDates && onEdit ? (
                      <button
                        type="button"
                        onClick={() => onEdit(project)}
                        className="mt-2 text-xs font-semibold text-slate-500 hover:text-[#5E8500] hover:underline dark:text-slate-400 dark:hover:text-[#86BF00]"
                      >
                        Edit dates
                      </button>
                    ) : null}
                  </td>

                  {/* Actions column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit(project)}
                          className={cx(
                            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                            "border border-slate-200 bg-white text-slate-700",
                            "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                            "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
                            "dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                          )}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="hidden xl:inline">Edit</span>
                        </button>
                      ) : null}

                      <Link
                        href={`/portal/projects/${encodeURIComponent(project.id)}`}
                        onClick={() => writeStoredActiveProject(project)}
                        className={cx(
                          "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          "border border-slate-200 bg-white text-slate-700",
                          "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
                          "dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                          hoveredRow === project.id && "border-slate-300 shadow-sm dark:border-slate-700"
                        )}
                      >
                        <span>Open</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>

                      {/* More actions button (can be expanded later) */}
                      <button
                        className={cx(
                          "rounded-lg border p-2 transition-all",
                          "border-slate-200 bg-white text-slate-500",
                          "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700",
                          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
                          "dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200",
                          hoveredRow === project.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                        title="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with summary */}
      <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/20">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <span className="font-medium text-slate-700 dark:text-slate-300">{rows.length}</span> projects
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              <span>Public</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5" />
              <span>Tenant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              <span>Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
