"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { WorkflowStatus } from "@/logaxp/lib/project-management/projectManagement.types";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function SortRow({ s }: { s: WorkflowStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
        "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
        isDragging && "opacity-70"
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{String(s.name ?? "-")}</div>
        <div className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {String(s.key ?? "-")} • {String(s.category ?? "-")}
        </div>
      </div>

      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

export function StatusReorderDnd({
  statuses,
  disabled,
  onReorder,
}: {
  statuses: WorkflowStatus[];
  disabled?: boolean;
  onReorder: (ordered: WorkflowStatus[]) => void;
}) {
  const [items, setItems] = React.useState<WorkflowStatus[]>(statuses);

  React.useEffect(() => setItems(statuses), [statuses]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((x) => x.id === active.id);
    const newIndex = items.findIndex((x) => x.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    onReorder(next);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Reorder statuses</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">Drag by the handle to reorder.</div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={disabled ? undefined : onDragEnd}>
        <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className={cx("space-y-2", disabled && "opacity-60 pointer-events-none")}>
            {items.map((s) => <SortRow key={s.id} s={s} />)}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}