"use client";

import type { Project, ProjectSummary } from "@/logaxp/lib/project-management/projectManagement.types";

function fmtDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

function metadata(project: Project) {
  return project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
    ? (project.metadata as Record<string, unknown>)
    : {};
}

function healthLabel(value: unknown) {
  const raw = String(value ?? "ON_TRACK").toUpperCase();
  const map: Record<string, string> = {
    ON_TRACK: "On track",
    AT_RISK: "At risk",
    BLOCKED: "Blocked",
    COMPLETED: "Completed",
  };
  return map[raw] ?? raw;
}

function projectOwner(project: Project) {
  const members = Array.isArray((project as any).members) ? ((project as any).members as any[]) : [];
  const owner = members.find((member) => String(member?.role ?? "").toUpperCase() === "OWNER");
  const user = owner?.membership?.user;
  const profile = user?.profile;
  return (
    profile?.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    owner?.membershipId ||
    "-"
  );
}

export function ProjectMetaCard({ project, summary }: { project: Project; summary?: ProjectSummary | null }) {
  const progress = summary?.dateProgress;
  const kv = [
    ["Key", String(project.key ?? "-")],
    ["Owner", projectOwner(project)],
    ["Status", String(project.status ?? "-")],
    ["Health", healthLabel(summary?.health ?? metadata(project).health)],
    ["Visibility", String(project.visibility ?? "-")],
    ["Start", fmtDate(project.startDate)],
    ["Target", fmtDate(project.targetDate)],
    ["Days remaining", typeof progress?.daysRemaining === "number" ? String(progress.daysRemaining) : "-"],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Project details</div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {kv.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 text-sm">
            <div className="text-slate-600 dark:text-slate-300">{k}</div>
            <div className="font-medium text-slate-900 dark:text-slate-50">{v}</div>
          </div>
        ))}
      </div>
      {typeof progress?.progressPercent === "number" ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Date progress</span>
            <span>{progress.progressPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-950">
            <div
              className="h-full rounded-full bg-[#86BF00]"
              style={{ width: `${Math.max(0, Math.min(100, progress.progressPercent))}%` }}
            />
          </div>
          {progress.isOverdue ? (
            <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-300">Target date is overdue.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
