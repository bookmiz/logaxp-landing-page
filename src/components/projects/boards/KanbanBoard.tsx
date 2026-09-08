"use client";

import * as React from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Minimize2, Maximize2 } from "lucide-react";

import type { BoardColumn, WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";
import { Button } from "@/logaxp/components/ui/button";
import { KanbanColumn } from "./KanbanColumn";

type PersistedState = {
  minimizedCols: string[];
  collapsedCols: string[];
  collapsedCards: string[];
  closedCards: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function readLS(key: string): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function writeLS(key: string, v: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

export function KanbanBoard({
  storageKey,
  columns,
  items,
  onMoveItem,
  onOpenItem,
  onCreateInColumn,
  maxVisibleColumns = 4,
}: {
  storageKey?: string;
  columns: BoardColumn[];
  items: WorkItem[];
  onMoveItem: (args: { id: string; toColumnId: string }) => Promise<void> | void;
  onOpenItem: (w: WorkItem) => void;
  onCreateInColumn: (columnId: string) => void;
  maxVisibleColumns?: number;
}) {
  const cols = React.useMemo(
    () => [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [columns]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 14 },
    })
  );

  const lsKey = storageKey ? `kanban:${storageKey}` : null;

  const [minimizedCols, setMinimizedCols] = React.useState<Set<string>>(() => new Set());
  const [collapsedCols, setCollapsedCols] = React.useState<Set<string>>(() => new Set());
  const [collapsedCards, setCollapsedCards] = React.useState<Set<string>>(() => new Set());
  const [closedCards, setClosedCards] = React.useState<Set<string>>(() => new Set());

  React.useEffect(() => {
    if (!lsKey) return;
    const v = readLS(lsKey);
    if (!v) return;

    setMinimizedCols(new Set(v.minimizedCols ?? []));
    setCollapsedCols(new Set(v.collapsedCols ?? []));
    setCollapsedCards(new Set(v.collapsedCards ?? []));
    setClosedCards(new Set(v.closedCards ?? []));
  }, [lsKey]);

  React.useEffect(() => {
    if (!lsKey) return;
    writeLS(lsKey, {
      minimizedCols: Array.from(minimizedCols),
      collapsedCols: Array.from(collapsedCols),
      collapsedCards: Array.from(collapsedCards),
      closedCards: Array.from(closedCards),
    });
  }, [lsKey, minimizedCols, collapsedCols, collapsedCards, closedCards]);

  const itemById = React.useMemo(() => {
    const m = new Map<string, WorkItem>();
    for (const w of items) m.set(String(w.id), w);
    return m;
  }, [items]);

  const itemsByColumn = React.useMemo(() => {
    const map: Record<string, WorkItem[]> = {};
    for (const c of cols) map[c.id] = [];
    for (const w of items) {
      const cid = w.columnId ? String(w.columnId) : "";
      if (cid && map[cid]) map[cid].push(w);
    }
    return map;
  }, [cols, items]);

  const hiddenCountByColumn = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of cols) out[c.id] = 0;

    for (const id of closedCards) {
      const w = itemById.get(id);
      const cid = w?.columnId ? String(w.columnId) : "";
      if (cid && out[cid] != null) out[cid] += 1;
    }
    return out;
  }, [cols, closedCards, itemById]);

  const visibleItemsForColumn = React.useCallback(
    (columnId: string) => {
      const list = itemsByColumn[columnId] ?? [];
      if (!closedCards.size) return list;
      return list.filter((w) => !closedCards.has(String(w.id)));
    },
    [itemsByColumn, closedCards]
  );

  const focusModeOn = minimizedCols.size > 0;

  const showAllColumns = () => setMinimizedCols(new Set());

  const focusAround = (columnId: string) => {
    const ids = cols.map((c) => c.id);
    const idx = ids.indexOf(columnId);
    if (idx < 0) return;

    const take = clamp(maxVisibleColumns, 1, ids.length);
    const half = Math.floor((take - 1) / 2);
    const start = clamp(idx - half, 0, Math.max(0, ids.length - take));
    const visible = new Set(ids.slice(start, start + take));

    const nextMin = new Set<string>();
    for (const id of ids) if (!visible.has(id)) nextMin.add(id);
    setMinimizedCols(nextMin);
  };

  const toggleMinimized = (columnId: string) => {
    setMinimizedCols((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  };

  const toggleCollapsed = (columnId: string) => {
    setCollapsedCols((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  };

  const restoreHiddenInColumn = (columnId: string) => {
    setClosedCards((prev) => {
      if (!prev.size) return prev;
      const next = new Set(prev);
      for (const id of prev) {
        const w = itemById.get(id);
        if (w?.columnId && String(w.columnId) === columnId) next.delete(id);
      }
      return next;
    });
  };

  const isCardCollapsed = (workItemId: string) => collapsedCards.has(workItemId);

  const toggleCardCollapsed = (workItemId: string) => {
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(workItemId)) next.delete(workItemId);
      else next.add(workItemId);
      return next;
    });
  };

  const closeCard = (workItemId: string) => {
    setClosedCards((prev) => {
      const next = new Set(prev);
      next.add(workItemId);
      return next;
    });
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const active = e.active?.id ? String(e.active.id) : "";
    const over = e.over?.id ? String(e.over.id) : "";
    if (!active.startsWith("item:")) return;
    if (!over.startsWith("col:")) return;

    const id = active.replace("item:", "");
    const toColumnId = over.replace("col:", "");
    await onMoveItem({ id, toColumnId });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
      {/* board controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-600 dark:text-slate-300">
          Visible columns:{" "}
          <span className="font-semibold">
            {cols.length - minimizedCols.size}/{cols.length}
          </span>
          {focusModeOn ? (
            <span className="ml-2 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              Focus mode
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          {focusModeOn ? (
            <Button variant="outline" onClick={showAllColumns}>
              <Maximize2 className="h-4 w-4" />
              Show all
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                if (cols[0]) focusAround(cols[0].id);
              }}
            >
              <Minimize2 className="h-4 w-4" />
              Focus {maxVisibleColumns}
            </Button>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cols.map((c) => {
            const colItems = visibleItemsForColumn(c.id);
            const sortableIds = colItems.map((w) => `item:${w.id}`);

            // ✅ smaller widths (compact)
            const isMin = minimizedCols.has(c.id);
            const wrapClass = isMin ? "min-w-[72px] max-w-[72px]" : "min-w-[320px] max-w-[320px]";

            return (
              <div key={c.id} className={wrapClass}>
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  <KanbanColumn
                    column={c}
                    items={colItems}
                    minimized={isMin}
                    onToggleMinimized={() => toggleMinimized(c.id)}
                    collapsed={collapsedCols.has(c.id)}
                    onToggleCollapsed={() => toggleCollapsed(c.id)}
                    hiddenCount={hiddenCountByColumn[c.id] ?? 0}
                    onRestoreHidden={() => restoreHiddenInColumn(c.id)}
                    onOpenItem={onOpenItem}
                    onCreateInColumn={onCreateInColumn}
                    onMinimizeOthers={() => focusAround(c.id)}
                    isCardCollapsed={isCardCollapsed}
                    onToggleCardCollapsed={toggleCardCollapsed}
                    onCloseCard={closeCard}
                  />
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}