"use client";

import Link from "next/link";
import * as React from "react";
import { ExternalLink, Pencil, Trash2, Eye, PlusCircle, MinusCircle, FileText } from "lucide-react";

import type { WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";
import { TypeBadge } from "./TypeBadge";
import { PriorityPill } from "./PriorityPill";

function cn(...c: Array<string | string[] | false | null | undefined>) {
  return c
    .flat()
    .filter(Boolean)
    .join(" ");
}

function formatWorkItemId(id: string, key?: string) {
  // Show the key if available, otherwise show a truncated ID
  if (key) return key;
  return `#${id.slice(0, 8)}`;
}

function formatDescription(description: unknown, maxChars: number) {
  const s = String(description ?? "");
  if (!s) return null;
  
  try {
    const parsed = JSON.parse(s);
    if (typeof parsed === 'string') return parsed;
    if (parsed.text) return parsed.text;
    if (parsed.body) return parsed.body;
  } catch {
    // Not JSON, continue with string
  }
  
  // Truncate with ellipsis
  if (s.length > maxChars) {
    return s.slice(0, maxChars - 1).trimEnd() + "…";
  }
  return s;
}

function formatTitle(title: unknown, maxLength = 90) {
  const text = String(title ?? "Untitled").trim() || "Untitled";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function IconBtn({
  title,
  onClick,
  disabled,
  children,
  variant = "default",
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200",
        variant === "default" && [
          "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200",
        ],
        variant === "destructive" && [
          "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700",
          "dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-300",
        ],
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    >
      {children}
    </button>
  );
}

export function WorkItemsTable({
  rows,
  busy,
  onOpen,
  onEdit,
  onDelete,
  laneAction,

  descriptionMaxChars = 84,
  stickyHeader = true,
  onRowClick,
}: {
  rows: WorkItem[];
  busy?: boolean;

  onOpen: (w: WorkItem) => void;
  onEdit: (w: WorkItem) => void;
  onDelete: (w: WorkItem) => void;

  laneAction?: {
    kind: "add" | "remove";
    onClick: (w: WorkItem) => void | Promise<void>;
    title?: string;
  };

  descriptionMaxChars?: number;
  stickyHeader?: boolean;
  onRowClick?: (w: WorkItem) => void;
}) {
  if (!rows.length) return null;

  const laneTitle =
    laneAction?.kind === "add"
      ? laneAction.title ?? "Add to sprint"
      : laneAction?.kind === "remove"
      ? laneAction.title ?? "Remove from sprint"
      : null;

  const laneIcon = laneAction?.kind === "add" ? PlusCircle : MinusCircle;
  const LaneIcon = laneIcon;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead
            className={cn(
              "border-b border-slate-200 bg-slate-50/80 text-slate-600 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
              stickyHeader && "sticky top-0 z-10"
            )}
          >
            <tr>
              {/* ID / Key */}
              <th className="w-[140px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                ID
              </th>

              {/* Title */}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Title
              </th>

              {/* Type */}
              <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Type
              </th>

              {/* Priority */}
              <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Priority
              </th>

              {/* Lane action */}
              {laneAction ? (
                <th className="w-[100px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {laneAction.kind === "add" ? "Add" : "Remove"}
                </th>
              ) : null}

              {/* Actions */}
              <th className="w-[240px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((w, index) => {
              const workItemId = formatWorkItemId(w.id, w.key);
              const projectId = String((w as any).projectId ?? "");
              const description = w.description 
                ? formatDescription(w.description, descriptionMaxChars)
                : null;
              
              const title = formatTitle(w.title);

              return (
                <tr
                  key={w.id}
                  className={cn(
                    "group transition-colors duration-150",
                    "hover:bg-slate-50 dark:hover:bg-slate-900/30",
                    onRowClick && "cursor-pointer",
                    index % 2 === 0 ? "bg-white dark:bg-slate-950" : "bg-slate-50/50 dark:bg-slate-900/20"
                  )}
                  onClick={() => {
                    if (!onRowClick) return;
                    onRowClick(w);
                  }}
                >
                  {/* ID / Key */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                        {workItemId}
                      </span>
                      {!w.key && (
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                          {w.id.slice(0, 4)}…{w.id.slice(-4)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-900 dark:text-slate-100" title={String(w.title ?? "Untitled")}>
                        {title}
                      </span>
                      
                      {description ? (
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                          <span className="line-clamp-2 leading-relaxed">{description}</span>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400 dark:text-slate-500">
                          No description
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3 align-top">
                    <TypeBadge 
                      type={String((w as any).type ?? "")} 
                      size="sm"
                    />
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3 align-top">
                    <PriorityPill 
                      priority={String((w as any).priority ?? "")} 
                      size="sm"
                    />
                  </td>

                  {/* Lane action */}
                  {laneAction ? (
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-center">
                        <IconBtn
                          title={laneTitle || ""}
                          disabled={busy}
                          onClick={() => {
                            void laneAction.onClick(w);
                          }}
                        >
                          <LaneIcon className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </td>
                  ) : null}

                  {/* Actions */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
                      <IconBtn
                        title="Open details"
                        disabled={busy}
                        onClick={() => {
                          onOpen(w);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </IconBtn>

                      <IconBtn
                        title="Edit"
                        disabled={busy}
                        onClick={() => {
                          onEdit(w);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </IconBtn>

                      <IconBtn
                        title="Delete"
                        variant="destructive"
                        disabled={busy}
                        onClick={() => {
                          onDelete(w);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconBtn>

                      <Link
                        title="Open full page"
                        onClick={(e) => e.stopPropagation()}
                        href={`/portal/work-items/${encodeURIComponent(w.id)}${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ''}`}
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200",
                          "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                        )}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
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
