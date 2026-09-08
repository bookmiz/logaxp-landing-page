// src/logaxp/components/projects/timeline/milestones/MilestonesTable.tsx
"use client";

import * as React from "react";
import { Flag, Save, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";

import { cn, fmtDate, safeStr } from "@/logaxp/components/projects/timeline/timeline.ui";
import type { ProjectMilestone } from "@/logaxp/lib/project-management/projectManagement.types";

import { MilestoneRowActions } from "./MilestoneRowActions";

type Props = {
  rows: ProjectMilestone[];
  busy?: boolean;
  onRefresh?: () => void | Promise<void>;

  onEdit: (row: ProjectMilestone) => void;

  onDelete: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;

  // manual order update (Batch 6 will do DnD)
  onSaveOrder: (items: Array<{ id: string; sortOrder: number }>) => void | Promise<void>;
};

export function MilestonesTable({
  rows,
  busy,
  onRefresh,
  onEdit,
  onDelete,
  onRestore,
  onSaveOrder,
}: Props) {
  const [orderDraft, setOrderDraft] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const init: Record<string, string> = {};
    for (const r of rows) {
      init[String(r.id)] = r.sortOrder != null ? String(r.sortOrder) : "";
    }
    setOrderDraft(init);
  }, [rows]);

  const hasOrderChanges = React.useMemo(() => {
    for (const r of rows) {
      const id = String(r.id);
      const current = r.sortOrder != null ? String(r.sortOrder) : "";
      const draft = orderDraft[id] ?? "";
      if (current !== draft) return true;
    }
    return false;
  }, [rows, orderDraft]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Flag className="h-4 w-4" />
          <span className="font-medium">Milestones</span>
          <Badge variant="muted" className="rounded-full">
            {rows.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh ? (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={busy}>
              <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
              Refresh
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            disabled={!hasOrderChanges || busy}
            onClick={() => {
              const payload = rows
                .map((r) => {
                  const draft = orderDraft[String(r.id)] ?? "";
                  if (draft.trim() === "") return null;
                  const n = Number(draft);
                  if (Number.isNaN(n)) return null;
                  return { id: String(r.id), sortOrder: n };
                })
                .filter(Boolean) as Array<{ id: string; sortOrder: number }>;

              return onSaveOrder(payload);
            }}
          >
            <Save className="h-4 w-4" />
            Save order
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Dates</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Order</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {rows.length ? (
          rows.map((r) => {
            const id = String(r.id);
            const deleted = Boolean(r.deletedAt);
            return (
              <div
                key={id}
                className={cn(
                  "grid grid-cols-12 gap-2 px-3 py-3 text-sm",
                  "border-b border-slate-100 last:border-b-0 dark:border-slate-900",
                  deleted && "opacity-60"
                )}
              >
                <div className="col-span-5 min-w-0">
                  <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                    {safeStr(r.title, "Untitled")}
                  </div>
                  {r.description ? (
                    <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {safeStr(r.description)}
                    </div>
                  ) : null}
                  {r.workItems?.length ? (
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      Linked work items: <span className="font-medium">{r.workItems.length}</span>
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.isOverdue ? (
                      <Badge variant="outline" className="rounded-full border-amber-200 text-amber-700">
                        Overdue
                      </Badge>
                    ) : null}
                    {r.isUpcoming ? (
                      <Badge variant="outline" className="rounded-full border-[#86BF00]/30 text-[#5E8500]">
                        Upcoming
                      </Badge>
                    ) : null}
                    {r.dependencyIds?.length ? (
                      <Badge variant="muted" className="rounded-full">
                        {r.dependencyIds.length} dependencies
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="col-span-2 text-xs text-slate-600 dark:text-slate-300">
                  <div>Start: {fmtDate(r.startAt as any)}</div>
                  <div>Due: {fmtDate(r.dueAt as any)}</div>
                </div>

                <div className="col-span-2">
                  <Badge variant="outline" className="rounded-full">
                    {safeStr(r.status, "—")}
                  </Badge>
                </div>

                <div className="col-span-2">
                  <Input
                    value={orderDraft[id] ?? ""}
                    disabled={busy}
                    onChange={(e) => setOrderDraft((s) => ({ ...s, [id]: e.target.value.replace(/[^\d-]/g, "") }))}
                    placeholder="e.g. 10"
                    className="h-8"
                  />
                </div>

                <div className="col-span-1 flex justify-end">
                  <MilestoneRowActions row={r} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8">
            <div className="text-sm text-slate-600 dark:text-slate-300">No milestones.</div>
          </div>
        )}
      </div>
    </div>
  );
}
