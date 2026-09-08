// src/logaxp/components/projects/timeline/milestones/MilestoneLinkWorkItemsDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Badge } from "@/logaxp/components/ui/badge";

import type { ProjectMilestone, WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  projectId: string;
  milestone: ProjectMilestone | null;

  // supply these from your timeline hook/service wrapper
  searchWorkItems: (q: string) => Promise<WorkItem[]>;
  attach: (workItemId: string) => Promise<void>;
  detach: (workItemId: string) => Promise<void>;
  reloadMilestone?: () => Promise<void>;

  busy?: boolean;
};

export function MilestoneLinkWorkItemsDialog({
  open,
  onOpenChange,
  projectId,
  milestone,
  searchWorkItems,
  attach,
  detach,
  reloadMilestone,
  busy,
}: Props) {
  const [q, setQ] = React.useState("");
  const deferredQ = React.useDeferredValue(q);
  const [results, setResults] = React.useState<WorkItem[]>([]);
  const [loadingSearch, setLoadingSearch] = React.useState(false);

  const linkedIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (milestone?.workItems?.length) {
      for (const wi of milestone.workItems as any[]) ids.add(String(wi.id));
    }
    return ids;
  }, [milestone]);

  React.useEffect(() => {
    if (!open) return;
    setQ("");
    setResults([]);
  }, [open]);

  React.useEffect(() => {
    let alive = true;
    if (!open) return;
    const term = deferredQ.trim();
    if (!term) {
      setResults([]);
      return;
    }

    (async () => {
      setLoadingSearch(true);
      try {
        const items = await searchWorkItems(term);
        if (!alive) return;
        setResults(items);
      } finally {
        if (alive) setLoadingSearch(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, deferredQ, searchWorkItems]);

  if (!milestone) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Link work items</DialogTitle>
          <DialogDescription>
            Milestone: <span className="font-medium">{String(milestone.title ?? "")}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: linked items */}
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Linked</div>
              <Badge variant="muted" className="rounded-full">
                {milestone.workItems?.length ?? 0}
              </Badge>
            </div>

            <div className="space-y-2">
              {Array.isArray(milestone.workItems) && milestone.workItems.length ? (
                milestone.workItems.map((wi: any) => (
                  <div
                    key={String(wi.id)}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{String(wi.key ?? wi.id)}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {String(wi.title ?? "")}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={busy}
                      onClick={async () => {
                        await detach(String(wi.id));
                        if (reloadMilestone) await reloadMilestone();
                      }}
                    >
                      Unlink
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-300">No work items linked yet.</div>
              )}
            </div>
          </div>

          {/* Right: search + results */}
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-2 text-sm font-medium">Search work items</div>

            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or key..."
            />

            <div className="mt-3 space-y-2">
              {!deferredQ.trim() ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Type to search work items in this project.
                </div>
              ) : loadingSearch ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">Searching…</div>
              ) : results.length ? (
                results.map((wi) => {
                  const already = linkedIds.has(String(wi.id));
                  return (
                    <div
                      key={String(wi.id)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{String((wi as any).key ?? wi.id)}</div>
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {String((wi as any).title ?? "")}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className={cn("h-7 px-2 text-xs", already && "opacity-70")}
                        disabled={busy || already}
                        onClick={async () => {
                          await attach(String(wi.id));
                          if (reloadMilestone) await reloadMilestone();
                        }}
                      >
                        {already ? "Linked" : "Link"}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-300">No matches.</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}