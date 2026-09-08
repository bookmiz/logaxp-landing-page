"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Sparkles,
  ListTodo,
  CalendarRange,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  ArrowRightCircle,
  ArrowLeftCircle,
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";

import type { Sprint, WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function clipText(v: unknown, max: number) {
  const s = String(v ?? "");
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

function IconAction({
  title,
  onClick,
  disabled,
  tone = "neutral",
  children,
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  tone?: "neutral" | "emerald" | "sky" | "danger";
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "emerald"
      ? "hover:border-emerald-400 hover:text-emerald-700 dark:hover:border-emerald-400/40 dark:hover:text-emerald-200"
      : tone === "sky"
      ? "hover:border-sky-400 hover:text-sky-700 dark:hover:border-sky-400/40 dark:hover:text-sky-200"
      : tone === "danger"
      ? "hover:border-red-400 hover:text-red-700 dark:hover:border-red-400/40 dark:hover:text-red-200"
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

function WorkItemCard({
  w,
  busy,
  lane,
  onMove,
  onOpen,
  onEdit,
  onDelete,
  selected,
  onToggleSelected,
}: {
  w: WorkItem;
  busy?: boolean;
  lane: "backlog" | "sprint";
  onMove: (id: string) => void | Promise<void>;
  onOpen: (w: WorkItem) => void;
  onEdit: (w: WorkItem) => void;
  onDelete: (w: WorkItem) => void;
  selected?: boolean;
  onToggleSelected?: (id: string) => void;
}) {
  const key = String((w as any).key ?? w.id);
  const desc = w.description ? clipText(w.description, 160) : "";

  const accent =
    lane === "backlog"
      ? "before:bg-emerald-400 dark:before:bg-emerald-400/70"
      : "before:bg-sky-400 dark:before:bg-sky-400/70";

  const moveTitle = lane === "backlog" ? "Add to sprint" : "Remove to backlog";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(w)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(w);
      }}
      className={cn(
        "group relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
        "dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700",
        "focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10",
        "before:absolute before:left-0 before:top-3 before:h-[calc(100%-24px)] before:w-1 before:rounded-full",
        accent
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
            {String(w.title ?? "-")}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="rounded-full font-mono text-[11px]">
              {key}
            </Badge>

            {/* Optional chips if you have them */}
            {(w as any).type ? (
              <Badge variant="muted" className="rounded-full text-[11px]">
                {String((w as any).type)}
              </Badge>
            ) : null}

            {(w as any).priority ? (
              <Badge variant="muted" className="rounded-full text-[11px]">
                {String((w as any).priority)}
              </Badge>
            ) : null}
          </div>

          {desc ? (
            <div className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
              {desc}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">No description.</div>
          )}
        </div>

        {/* Move action (primary) */}
        <IconAction
          title={moveTitle}
          disabled={busy}
          tone={lane === "backlog" ? "emerald" : "sky"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void onMove(w.id);
          }}
        >
          {lane === "backlog" ? (
            <ArrowRightCircle className="h-4 w-4" />
          ) : (
            <ArrowLeftCircle className="h-4 w-4" />
          )}
        </IconAction>
      </div>

      {/* Footer actions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {lane === "backlog" && onToggleSelected ? (
          <label
            className="inline-flex cursor-pointer items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={Boolean(selected)}
              onChange={() => onToggleSelected(w.id)}
              disabled={busy}
              className="h-4 w-4 rounded border-slate-300"
            />
            Select for sprint
          </label>
        ) : (
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Click card to open
          </div>
        )}

        <div className="flex items-center gap-2">
          <IconAction
            title="Open"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen(w);
            }}
          >
            <Eye className="h-4 w-4" />
          </IconAction>

          <IconAction
            title="Edit"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(w);
            }}
          >
            <Pencil className="h-4 w-4" />
          </IconAction>

          <IconAction
            title="Delete"
            disabled={busy}
            tone="danger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(w);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </IconAction>
        </div>
      </div>
    </div>
  );
}

export function BacklogView({
  projectId,
  sprints,
  backlogItems,
  sprintItems,
  selectedSprintId,
  onSelectSprint,
  onAddToSprint,
  onBulkAddToSprint,
  onRemoveFromSprint,
  onOpenItem,
  onEditItem,
  onDeleteItem,
  busy,
}: {
  projectId: string;
  sprints: Sprint[];
  backlogItems: WorkItem[];
  sprintItems: WorkItem[];
  selectedSprintId: string;
  onSelectSprint: (id: string) => void;

  onAddToSprint: (workItemId: string) => Promise<void> | void;
  onBulkAddToSprint?: (workItemIds: string[]) => Promise<void> | void;
  onRemoveFromSprint: (workItemId: string) => Promise<void> | void;

  onOpenItem: (w: WorkItem) => void;
  onEditItem: (w: WorkItem) => void;
  onDeleteItem: (w: WorkItem) => void;
  busy?: boolean;
}) {
  const selected = sprints.find((s) => s.id === selectedSprintId) ?? null;

  const [backlogQ, setBacklogQ] = React.useState("");
  const [sprintQ, setSprintQ] = React.useState("");
  const [selectedBacklogIds, setSelectedBacklogIds] = React.useState<string[]>([]);

  const backlogNeedle = React.useDeferredValue(backlogQ.trim().toLowerCase());
  const sprintNeedle = React.useDeferredValue(sprintQ.trim().toLowerCase());

  const backlogRows = React.useMemo(() => {
    if (!backlogNeedle) return backlogItems;
    return backlogItems.filter((w) => {
      const t = String(w.title ?? "").toLowerCase();
      const k = String((w as any).key ?? w.id).toLowerCase();
      return t.includes(backlogNeedle) || k.includes(backlogNeedle);
    });
  }, [backlogItems, backlogNeedle]);

  const sprintRows = React.useMemo(() => {
    if (!sprintNeedle) return sprintItems;
    return sprintItems.filter((w) => {
      const t = String(w.title ?? "").toLowerCase();
      const k = String((w as any).key ?? w.id).toLowerCase();
      return t.includes(sprintNeedle) || k.includes(sprintNeedle);
    });
  }, [sprintItems, sprintNeedle]);

  React.useEffect(() => {
    const visibleIds = new Set(backlogRows.map((w) => w.id));
    setSelectedBacklogIds((ids) => ids.filter((id) => visibleIds.has(id)));
  }, [backlogRows]);

  React.useEffect(() => {
    setSelectedBacklogIds([]);
  }, [selectedSprintId]);

  const selectedBacklogSet = React.useMemo(() => new Set(selectedBacklogIds), [selectedBacklogIds]);
  const selectedBacklogPoints = React.useMemo(
    () =>
      backlogRows
        .filter((w) => selectedBacklogSet.has(w.id))
        .reduce((sum, w) => sum + Number(w.storyPoints ?? 0), 0),
    [backlogRows, selectedBacklogSet]
  );
  const sprintPoints = React.useMemo(
    () => sprintRows.reduce((sum, w) => sum + Number(w.storyPoints ?? 0), 0),
    [sprintRows]
  );

  const toggleSelected = React.useCallback((id: string) => {
    setSelectedBacklogIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }, []);

  const selectVisible = React.useCallback(() => {
    setSelectedBacklogIds(backlogRows.map((w) => w.id));
  }, [backlogRows]);

  const clearSelected = React.useCallback(() => setSelectedBacklogIds([]), []);

  return (
    <div className="space-y-4">
      {/* Sprint selector bar */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/12" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />

        <CardHeader className="relative pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                Target sprint
              </div>

              <CardTitle className="mt-2 text-base">
                {selected ? String(selected.name ?? "-") : "No sprint selected"}
              </CardTitle>

              <CardDescription className="mt-1">
                Pick a sprint, then move items between backlog and sprint.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted" className="rounded-full">
                <ListTodo className="mr-1 h-3.5 w-3.5" />
                Backlog: {backlogItems.length}
              </Badge>

                <Badge variant="muted" className="rounded-full">
                  <CalendarRange className="mr-1 h-3.5 w-3.5" />
                Sprint: {sprintItems.length} items • {sprintPoints} pts
              </Badge>

              <Link href={`/portal/sprints?projectId=${encodeURIComponent(projectId)}`}>
                <Button variant="outline">
                  Sprints
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>

              {selected ? (
                <Link href={`/portal/sprints/${encodeURIComponent(selected.id)}?projectId=${encodeURIComponent(projectId)}`}>
                  <Button variant="outline">Open sprint</Button>
                </Link>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative pt-0">
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto] md:items-center">
            <div className="relative">
              <select
                className={cn(
                  "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-10 text-sm outline-none",
                  "focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-100/10"
                )}
                value={selectedSprintId}
                onChange={(e) => onSelectSprint(e.target.value)}
              >
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {String(s.name ?? "-")} ({String((s as any).status ?? "PLANNED")})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Tip: create a sprint in{" "}
              <Link className="underline" href={`/portal/sprints?projectId=${encodeURIComponent(projectId)}`}>
                Sprints
              </Link>
              .
            </div>
          </div>
        </CardContent>
      </Card>

      {!selected ? (
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
          <EmptyState title="No sprint selected" description="Select a sprint to plan work into it." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Backlog lane */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Backlog</CardTitle>
                  <CardDescription>Items not assigned to any sprint</CardDescription>
                </div>
                <Badge variant="muted" className="rounded-full">{backlogRows.length}</Badge>
              </div>

              <div className="mt-3">
                <Input
                  label="Search backlog"
                  placeholder="Search title or key..."
                  value={backlogQ}
                  onChange={(e) => setBacklogQ(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/20">
                <div className="text-slate-600 dark:text-slate-300">
                  Selected: <span className="font-semibold">{selectedBacklogIds.length}</span> items •{" "}
                  <span className="font-semibold">{selectedBacklogPoints}</span> pts
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={selectVisible} disabled={busy || !backlogRows.length}>
                    Select visible
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelected} disabled={busy || !selectedBacklogIds.length}>
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    disabled={busy || !selectedBacklogIds.length || !selected || !onBulkAddToSprint}
                    onClick={async () => {
                      if (!onBulkAddToSprint) return;
                      await onBulkAddToSprint(selectedBacklogIds);
                      clearSelected();
                    }}
                  >
                    Move selected
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {backlogRows.length ? (
                backlogRows.map((w) => (
                  <WorkItemCard
                    key={w.id}
                    w={w}
                    busy={busy}
                    lane="backlog"
                    onMove={(id) => onAddToSprint(id)}
                    onOpen={onOpenItem}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    selected={selectedBacklogSet.has(w.id)}
                    onToggleSelected={toggleSelected}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  Backlog is empty.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sprint lane */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    Sprint: {String(selected.name ?? "-")}
                  </CardTitle>
                  <CardDescription>Items assigned to this sprint</CardDescription>
                </div>
                <Badge variant="muted" className="rounded-full">{sprintRows.length}</Badge>
              </div>

              <div className="mt-3">
                <Input
                  label="Search sprint"
                  placeholder="Search title or key..."
                  value={sprintQ}
                  onChange={(e) => setSprintQ(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {sprintRows.length ? (
                sprintRows.map((w) => (
                  <WorkItemCard
                    key={w.id}
                    w={w}
                    busy={busy}
                    lane="sprint"
                    onMove={(id) => onRemoveFromSprint(id)}
                    onOpen={onOpenItem}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  No items in sprint yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
