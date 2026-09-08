"use client";

import Link from "next/link";
import * as React from "react";
import { ExternalLink, Pencil, Play, CheckCircle2 } from "lucide-react";

import type { Sprint } from "@/logaxp/lib/project-management/projectManagement.types";
import { SprintStatusBadge } from "./SprintStatusBadge";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function IconBtn({
  title,
  onClick,
  disabled,
  tone = "neutral",
  children,
}: {
  title: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  tone?: "neutral" | "emerald" | "sky";
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "emerald"
      ? "hover:border-emerald-400 hover:text-emerald-700 dark:hover:border-emerald-400/40 dark:hover:text-emerald-200"
      : tone === "sky"
      ? "hover:border-sky-400 hover:text-sky-700 dark:hover:border-sky-400/40 dark:hover:text-sky-200"
      : "hover:border-slate-400 hover:text-slate-900 dark:hover:border-slate-500 dark:hover:text-slate-50";

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition",
        "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
        "disabled:opacity-50 disabled:hover:bg-white",
        "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/40",
        toneCls
      )}
    >
      {children}
    </button>
  );
}

function formatShortDate(v: any) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function SprintsTable({
  projectId,
  rows,
  busy,
  onEdit,
  onStart,
  onClose,
}: {
  projectId: string;
  rows: Sprint[];
  busy?: boolean;
  onEdit: (s: Sprint) => void;
  onStart: (s: Sprint) => void;
  onClose: (s: Sprint) => void;
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            <tr>
              <th className="w-[320px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Name</th>
              <th className="w-[140px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Status</th>
              <th className="w-[220px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Dates</th>
              <th className="w-[220px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Board</th>
              <th className="w-[200px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((s) => {
              const status = String(s.status ?? "").toUpperCase();
              const rowProjectId = String(s.projectId ?? projectId ?? "");

              // Simple gating (adjust to your exact statuses)
              const canStart = status === "PLANNED" || status === "DRAFT";
              const canClose = status === "ACTIVE" || status === "STARTED";

              return (
                <tr
                  key={s.id}
                  className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/30"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="truncate font-semibold text-slate-900 dark:text-slate-50">
                      {String(s.name ?? "-")}
                    </div>
                    {s.goal ? (
                      <div className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {String(s.goal)}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">No goal.</div>
                    )}
                  </td>

                  <td className="px-4 py-3 align-top">
                    <SprintStatusBadge status={String(s.status ?? "")} />
                  </td>

                  <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Start:</span>{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-200">{formatShortDate((s as any).startAt)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">End:</span>{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-200">{formatShortDate((s as any).endAt)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="truncate text-xs text-slate-600 dark:text-slate-300">
                      {s.board && typeof s.board === "object"
                        ? String((s.board as any).name ?? "-")
                        : String((s as any).boardId ?? "-")}
                    </div>
                    {s.capacityPoints !== null && s.capacityPoints !== undefined ? (
                      <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        Capacity: {String(s.capacityPoints)}
                      </div>
                    ) : null}
                    {s.project && typeof s.project === "object" ? (
                      <div className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-500">
                        Project: {String((s.project as any).name ?? (s.project as any).key ?? rowProjectId)}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-2">
                      <Link
                        title="Open sprint"
                        href={
                          rowProjectId
                            ? `/portal/sprints/${encodeURIComponent(s.id)}?projectId=${encodeURIComponent(rowProjectId)}`
                            : `/portal/sprints/${encodeURIComponent(s.id)}`
                        }
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition",
                          "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/40 dark:hover:text-slate-50"
                        )}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>

                      <IconBtn
                        title="Edit sprint"
                        disabled={busy}
                        onClick={(e) => {
                          e.preventDefault();
                          onEdit(s);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </IconBtn>

                      <IconBtn
                        title={canStart ? "Start sprint" : "Start unavailable"}
                        disabled={busy || !canStart}
                        tone="emerald"
                        onClick={(e) => {
                          e.preventDefault();
                          onStart(s);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </IconBtn>

                      <IconBtn
                        title={canClose ? "Close sprint" : "Close unavailable"}
                        disabled={busy || !canClose}
                        tone="sky"
                        onClick={(e) => {
                          e.preventDefault();
                          onClose(s);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
