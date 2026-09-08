// src/logaxp/components/projects/timeline/events/EventsTable.tsx
"use client";

import * as React from "react";
import { Zap, RefreshCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";

import { cn, fmtDateTime, safeStr } from "@/logaxp/components/projects/timeline/timeline.ui";
import type { ProjectTimelineEvent } from "@/logaxp/lib/project-management/projectManagement.types";

import { EventRowActions } from "./EventRowActions";

type Props = {
  rows: ProjectTimelineEvent[];
  busy?: boolean;
  onRefresh?: () => void | Promise<void>;

  onEdit: (row: ProjectTimelineEvent) => void;

  onDelete: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;
};

export function EventsTable({ rows, busy, onRefresh, onEdit, onDelete, onRestore }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Zap className="h-4 w-4" />
          <span className="font-medium">Events</span>
          <Badge variant="muted" className="rounded-full">
            {rows.length}
          </Badge>
        </div>

        {onRefresh ? (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={busy}>
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="col-span-6">Title</div>
          <div className="col-span-3">Time</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {rows.length ? (
          rows.map((r) => {
            const deleted = Boolean(r.deletedAt);
            return (
              <div
                key={String(r.id)}
                className={cn(
                  "grid grid-cols-12 gap-2 px-3 py-3 text-sm",
                  "border-b border-slate-100 last:border-b-0 dark:border-slate-900",
                  deleted && "opacity-60"
                )}
              >
                <div className="col-span-6 min-w-0">
                  <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                    {safeStr(r.title, "Untitled")}
                  </div>
                  {r.description ? (
                    <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {safeStr(r.description)}
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
                    {r.milestoneId ? (
                      <Badge variant="muted" className="rounded-full">
                        Linked milestone
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="col-span-3 text-xs text-slate-600 dark:text-slate-300">
                  <div>Start: {fmtDateTime(r.startAt as any)}</div>
                  <div>End: {fmtDateTime(r.endAt as any)}</div>
                </div>

                <div className="col-span-2">
                  <Badge variant="outline" className="rounded-full">
                    {safeStr(r.type, "EVENT")}
                  </Badge>
                </div>

                <div className="col-span-1 flex justify-end">
                  <EventRowActions row={r} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8">
            <div className="text-sm text-slate-600 dark:text-slate-300">No events.</div>
          </div>
        )}
      </div>
    </div>
  );
}
