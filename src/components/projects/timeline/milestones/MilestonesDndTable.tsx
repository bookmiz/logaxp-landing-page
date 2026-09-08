// src/logaxp/components/projects/timeline/milestones/MilestonesDndTable.tsx
"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Flag, GripVertical, RefreshCcw, Save } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";

import { cn, fmtDate, safeStr } from "@/logaxp/components/projects/timeline/timeline.ui";
import type { ProjectMilestone, WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";

import { MilestoneRowActions } from "./MilestoneRowActions";

type SortItem = { id: string; sortOrder: number };

type Props = {
  rows: ProjectMilestone[];
  busy?: boolean;
  onRefresh?: () => void | Promise<void>;

  onEdit: (row: ProjectMilestone) => void;
  onDelete: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;

  onSaveOrder: (items: SortItem[]) => void | Promise<void>;

  // linking UI
  onOpenLinks: (row: ProjectMilestone) => void;
};

function SortableRow({
  row,
  onEdit,
  onDelete,
  onRestore,
  onOpenLinks,
}: {
  row: ProjectMilestone;
  onEdit: (r: ProjectMilestone) => void;
  onDelete: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;
  onOpenLinks: (r: ProjectMilestone) => void;
}) {
  const id = String(row.id);
  const deleted = Boolean(row.deletedAt);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "grid grid-cols-12 gap-2 px-3 py-3 text-sm",
          "border-b border-slate-100 last:border-b-0 dark:border-slate-900",
          deleted && "opacity-60"
        )}
      >
        {/* Drag handle */}
        <div className="col-span-1 flex items-start">
          <button
            type="button"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md border",
              "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
              "dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900",
              deleted && "pointer-events-none"
            )}
            aria-label="Drag"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="col-span-4 min-w-0">
          <div className="truncate font-medium text-slate-900 dark:text-slate-100">
            {safeStr(row.title, "Untitled")}
          </div>

          {row.description ? (
            <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {safeStr(row.description)}
            </div>
          ) : null}

          {/* Linked work items */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="rounded-full">
              Linked: {Array.isArray(row.workItems) ? row.workItems.length : 0}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onOpenLinks(row)}
              disabled={deleted}
            >
              Manage links
            </Button>
          </div>

          {/* Show up to 3 linked work item titles */}
          {Array.isArray(row.workItems) && row.workItems.length ? (
            <div className="mt-2 space-y-1">
              {row.workItems.slice(0, 3).map((item) => (
                <div key={String(item.workItem?.id)} className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  • {safeStr(item.workItem?.key)} — {safeStr(item.workItem?.title)}
                </div>
              ))}
              {row.workItems.length > 3 ? (
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  +{row.workItems.length - 3} more…
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="col-span-3 text-xs text-slate-600 dark:text-slate-300">
          <div>Start: {fmtDate(row.startAt as any)}</div>
          <div>Due: {fmtDate(row.dueAt as any)}</div>
        </div>

        <div className="col-span-3">
          <Badge variant="outline" className="rounded-full">
            {safeStr(row.status, "—")}
          </Badge>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Current order: {row.sortOrder ?? "—"}
          </div>
        </div>

        <div className="col-span-1 flex justify-end">
          <MilestoneRowActions row={row} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
        </div>
      </div>
    </div>
  );
}

export function MilestonesDndTable({
  rows,
  busy,
  onRefresh,
  onEdit,
  onDelete,
  onRestore,
  onSaveOrder,
  onOpenLinks,
}: Props) {
  // local order state
  const [ordered, setOrdered] = React.useState<ProjectMilestone[]>([]);

  React.useEffect(() => {
    // default ordering: by sortOrder asc, then title
    const sorted = [...rows].sort((a, b) => {
      const ao = a.sortOrder ?? 0;
      const bo = b.sortOrder ?? 0;
      if (ao !== bo) return ao - bo;
      return String(a.title ?? "").localeCompare(String(b.title ?? ""));
    });
    setOrdered(sorted);
  }, [rows]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = React.useMemo(() => ordered.map((r) => String(r.id)), [ordered]);

  const hasChanges = React.useMemo(() => {
    // compare ids order only
    const a = rows.map((r) => String(r.id));
    const b = ordered.map((r) => String(r.id));
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true;
    return false;
  }, [rows, ordered]);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((x) => String(x.id) === String(active.id));
    const newIndex = ordered.findIndex((x) => String(x.id) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setOrdered((items) => arrayMove(items, oldIndex, newIndex));
  }

  async function saveOrder() {
    // assign new sortOrder sequentially based on list position (10,20,30...)
    const payload: SortItem[] = ordered.map((r, idx) => ({
      id: String(r.id),
      sortOrder: (idx + 1) * 10,
    }));
    await onSaveOrder(payload);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Flag className="h-4 w-4" />
          <span className="font-medium">Milestones</span>
          <Badge variant="muted" className="rounded-full">
            {ordered.length}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Drag to reorder
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh ? (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={busy}>
              <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
              Refresh
            </Button>
          ) : null}

          <Button variant="outline" size="sm" disabled={!hasChanges || busy} onClick={saveOrder}>
            <Save className="h-4 w-4" />
            Save order
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="col-span-1">Move</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-3">Dates</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {ordered.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {ordered.map((r) => (
                <SortableRow
                  key={String(r.id)}
                  row={r}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onOpenLinks={onOpenLinks}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="p-8">
            <div className="text-sm text-slate-600 dark:text-slate-300">No milestones.</div>
          </div>
        )}
      </div>
    </div>
  );
}