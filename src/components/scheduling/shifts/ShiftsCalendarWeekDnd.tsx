"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Badge } from "@/logaxp/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/logaxp/components/ui/tooltip";
import { AlertTriangle, Clock } from "lucide-react";
import type { Shift } from "@/logaxp/lib/scheduling/scheduleManagement.types";
import type { ShiftConflictFlags } from "@/logaxp/hooks/scheduling/useShiftConflictsMap";
import { cn } from "@/logaxp/lib/cn";
import { ShiftBlock } from "./ShiftBlock";

type DayKey = string; // YYYY-MM-DD

// ────────────────────────────────────────────────
// Date/Time Helpers (LOCAL-safe)
// ────────────────────────────────────────────────
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dayKeyLocal(date: Date): DayKey {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0..6 (Sun..Sat)
  const diff = day === 0 ? 6 : day - 1; // Monday start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function durationText(start?: string | null, end?: string | null): string {
  if (!start || !end) return "?";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function durationMinutes(shift: Shift): number {
  if (!shift.startAt || !shift.endAt) return 0;
  const ms = new Date(shift.endAt).getTime() - new Date(shift.startAt).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function minutesOfDayLocal(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function isoForDayMinutesLocal(dayKey: string, minutes: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0); // local midnight
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  date.setHours(hours, mins, 0, 0);
  return date.toISOString();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getStatusColor(status?: string): string {
  switch (status?.toUpperCase()) {
    case "PUBLISHED":
      return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50";
    case "DRAFT":
      return "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50";
    case "CANCELED":
      return "bg-red-50 border-red-200 opacity-75 dark:bg-red-950/30 dark:border-red-800/50 line-through";
    default:
      return "bg-slate-50 border-slate-200 dark:bg-slate-800/30 dark:border-slate-700/50";
  }
}

// ────────────────────────────────────────────────
// Overlap lane assignment (per day)
// ────────────────────────────────────────────────
type LaneInfo = { lane: number; lanes: number };

function assignLanesForDay(shifts: Shift[]): Map<string, LaneInfo> {
  // Greedy lane assignment; uses local minutes
  const sorted = [...shifts].sort((a, b) => (a.startAt ?? "").localeCompare(b.startAt ?? ""));
  const laneEnds: number[] = []; // end minute per lane
  const laneMap = new Map<string, number>();

  for (const s of sorted) {
    const sid = String(s.id);
    if (!s.startAt || !s.endAt) {
      laneMap.set(sid, 0);
      continue;
    }
    const start = minutesOfDayLocal(s.startAt);
    const end = minutesOfDayLocal(s.endAt);

    let lane = laneEnds.findIndex((le) => le <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    laneMap.set(sid, lane);
  }

  const lanes = Math.max(1, laneEnds.length);
  const out = new Map<string, LaneInfo>();
  for (const [sid, lane] of laneMap.entries()) out.set(sid, { lane, lanes });
  return out;
}

// ────────────────────────────────────────────────
// Draggable Shift Item
// ────────────────────────────────────────────────
function DraggableShiftItem({
  shift,
  conflict,
  selected,
  canEdit,
  onClick,
  style,
}: {
  shift: Shift;
  conflict?: ShiftConflictFlags;
  selected: boolean;
  canEdit: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}) {
  const id = String(shift.id);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: !canEdit,
  });

  const dndStyle: React.CSSProperties = {
    ...style,
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    zIndex: isDragging ? 50 : style.zIndex,
    opacity: isDragging ? 0.35 : 1,
    touchAction: "none",
  };

  const hasConflict = conflict && Object.values(conflict).some(Boolean);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={setNodeRef}
          style={dndStyle}
          {...attributes}
          {...listeners}
          className={cn(
            "absolute",
            canEdit && "cursor-grab active:cursor-grabbing",
            selected && "ring-2 ring-primary ring-offset-2",
            hasConflict && "ring-2 ring-destructive/70"
          )}
          onClick={(e) => {
            // prevent click during drag feel
            e.stopPropagation();
            onClick();
          }}
        >
          <ShiftBlock shift={shift} conflict={conflict} selected={selected} onClick={onClick} />
        </div>
      </TooltipTrigger>

      <TooltipContent side="top" className="max-w-xs text-xs">
        <div className="space-y-1">
          <p className="font-medium">
            {formatTime(shift.startAt)} – {formatTime(shift.endAt)}
          </p>
          <p className="text-muted-foreground">
            Duration: {durationText(shift.startAt, shift.endAt)}
          </p>
          {hasConflict && (
            <p className="text-destructive flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              Conflict detected
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// ────────────────────────────────────────────────
// Droppable Day Column
// ────────────────────────────────────────────────
function DayColumn({
  date,
  dateKey,
  isToday,
  hours,
  shifts,
  laneInfo,
  conflictMap,
  selectedIds,
  canEdit,
  onSelect,
  setColRef,
}: {
  date: Date;
  dateKey: DayKey;
  isToday: boolean;
  hours: { start: number; end: number };
  shifts: Shift[];
  laneInfo: Map<string, LaneInfo>;
  conflictMap: Record<string, ShiftConflictFlags>;
  selectedIds: Set<string>;
  canEdit: boolean;
  onSelect: (shift: Shift) => void;
  setColRef: (dayKey: DayKey, el: HTMLDivElement | null) => void;
}) {
  const droppableId = `day:${dateKey}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId, disabled: !canEdit });

  const visibleMinutes = (hours.end - hours.start) * 60;

  const totalMinutes = shifts.reduce((acc, s) => acc + durationMinutes(s), 0);
  const totalHrs = totalMinutes >= 60 ? `${Math.round((totalMinutes / 60) * 10) / 10}h` : `${totalMinutes}m`;

  const conflictCount = shifts.reduce((acc, s) => {
    const flags = conflictMap[String(s.id)];
    return acc + (flags && Object.values(flags).some(Boolean) ? 1 : 0);
  }, 0);

  return (
    <div
      className={cn(
        "flex min-h-[560px] flex-col bg-card transition-colors",
        isToday && "bg-accent/15",
        canEdit && "hover:bg-accent/10"
      )}
    >
      {/* Sticky Day Header */}
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 border-b bg-muted/60 text-sm font-medium",
          isToday && "text-primary"
        )}
      >
        <div className="flex items-center gap-2">
          <span>{formatDayHeader(date)}</span>
          <Badge variant="secondary" className="text-xs px-2">
            {shifts.length}
          </Badge>
          {conflictCount > 0 && (
            <Badge variant="destructive" className="text-xs px-2">
              {conflictCount} conflicts
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {totalHrs}
        </div>
      </div>

      {/* Calendar Body (droppable) */}
      <div
        ref={(el) => {
          setNodeRef(el);
          setColRef(dateKey, el);
        }}
        className={cn(
          "relative flex-1 overflow-hidden",
          isOver && canEdit && "outline  outline-primary/10 outline-offset-[-2px]"
        )}
      >
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: hours.end - hours.start + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-border/30"
              style={{ top: `${(i / (hours.end - hours.start)) * 100}%` }}
            />
          ))}
        </div>

        {/* Shift blocks */}
        {shifts.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/70 italic">
            No shifts
          </div>
        ) : (
          <div className="absolute inset-0 p-2">
            {shifts.map((shift) => {
              const sid = String(shift.id);
              const selected = selectedIds.has(sid);
              const conflict = conflictMap[sid];

              // Compute top/height from time window (LOCAL)
              const start = shift.startAt ? minutesOfDayLocal(shift.startAt) : hours.start * 60;
              const end = shift.endAt ? minutesOfDayLocal(shift.endAt) : start + 60;

              const windowStart = hours.start * 60;
              const windowEnd = hours.end * 60;

              const clampedStart = clamp(start, windowStart, windowEnd);
              const clampedEnd = clamp(end, windowStart, windowEnd);

              const topPct = ((clampedStart - windowStart) / visibleMinutes) * 100;
              const heightPct = Math.max(((clampedEnd - clampedStart) / visibleMinutes) * 100, 4); // min height

              const lane = laneInfo.get(sid)?.lane ?? 0;
              const lanes = laneInfo.get(sid)?.lanes ?? 1;
              const widthPct = 100 / lanes;
              const leftPct = lane * widthPct;

              const style: React.CSSProperties = {
                top: `${topPct}%`,
                height: `${heightPct}%`,
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                paddingRight: lanes > 1 ? 6 : 0,
              };

              return (
                <DraggableShiftItem
                  key={sid}
                  shift={shift}
                  conflict={conflict}
                  selected={selected}
                  canEdit={canEdit}
                  onClick={() => onSelect(shift)}
                  style={style}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
interface ShiftsCalendarWeekDndProps {
  anchorFromIso: string;
  rows: Shift[];
  conflictMap?: Record<string, ShiftConflictFlags>;
  selectedIds?: Set<string>;
  onSelect: (shift: Shift) => void;
  canEdit: boolean;
  hours?: { start: number; end: number }; // visible hours (e.g. 6–22)
  onMove: (shiftId: string, nextStartAt: string, nextEndAt: string) => void | Promise<void>;
}

export function ShiftsCalendarWeekDnd({
  anchorFromIso,
  rows,
  conflictMap = {},
  selectedIds = new Set(),
  onSelect,
  canEdit,
  hours = { start: 6, end: 22 },
  onMove,
}: ShiftsCalendarWeekDndProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const [activeShift, setActiveShift] = React.useState<Shift | null>(null);

  const anchor = React.useMemo(() => startOfWeekMonday(new Date(anchorFromIso)), [anchorFromIso]);
  const days = React.useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(anchor, i)), [anchor]);

  const todayKey = React.useMemo(() => dayKeyLocal(new Date()), []);

  // group shifts by LOCAL day key
  const shiftsByDay = React.useMemo(() => {
    const map: Record<DayKey, Shift[]> = {};
    for (const s of rows) {
      const key = s.startAt ? dayKeyLocal(new Date(s.startAt)) : dayKeyLocal(anchor);
      map[key] = map[key] ?? [];
      map[key].push(s);
    }
    for (const list of Object.values(map)) {
      list.sort((a, b) => (a.startAt ?? "").localeCompare(b.startAt ?? ""));
    }
    return map;
  }, [rows, anchor]);

  // lane info per day
  const lanesByDay = React.useMemo(() => {
    const out: Record<DayKey, Map<string, LaneInfo>> = {};
    for (const d of days) {
      const dk = dayKeyLocal(d);
      out[dk] = assignLanesForDay(shiftsByDay[dk] ?? []);
    }
    return out;
  }, [days, shiftsByDay]);

  // refs for drop-position calculation
  const colRefs = React.useRef<Record<DayKey, HTMLDivElement | null>>({});

  // Track pointer position during drag (so drop time is accurate)
  const pointerRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const pointerMove = React.useCallback((ev: PointerEvent) => {
    pointerRef.current = { x: ev.clientX, y: ev.clientY };
  }, []);

  const handleDragStart = (e: DragStartEvent) => {
    if (!canEdit) return;

    document.addEventListener("pointermove", pointerMove, { passive: true });

    const sid = String(e.active.id);
    const shift = rows.find((s) => String(s.id) === sid);
    if (shift) setActiveShift(shift);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    document.removeEventListener("pointermove", pointerMove);
    setActiveShift(null);

    if (!canEdit || !e.over) return;

    const shiftId = String(e.active.id);
    const shift = rows.find((s) => String(s.id) === shiftId);
    if (!shift || !shift.startAt || !shift.endAt) return;

    const overId = String(e.over.id);
    if (!overId.startsWith("day:")) return;

    const dk = overId.replace("day:", "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) return;

    const colEl = colRefs.current[dk];
    if (!colEl) return;

    const rect = colEl.getBoundingClientRect();
    const clientY = pointerRef.current.y;

    const relativeY = clamp(clientY - rect.top, 0, rect.height);
    const visibleMinutes = (hours.end - hours.start) * 60;
    const frac = rect.height > 0 ? relativeY / rect.height : 0;

    // target minutes snapped to 15
    let targetMinutes = hours.start * 60 + Math.round(frac * visibleMinutes);
    targetMinutes = Math.round(targetMinutes / 15) * 15;

    const dur = durationMinutes(shift);
    const windowStart = hours.start * 60;
    const windowEnd = hours.end * 60;

    // clamp so shift doesn't run past window end
    targetMinutes = clamp(targetMinutes, windowStart, Math.max(windowStart, windowEnd - dur));

    const nextStart = isoForDayMinutesLocal(dk, targetMinutes);
    const nextEnd = isoForDayMinutesLocal(dk, targetMinutes + dur);

    await onMove(shiftId, nextStart, nextEnd);
  };

  const handleDragCancel = () => {
    document.removeEventListener("pointermove", pointerMove);
    setActiveShift(null);
  };

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b bg-muted/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Weekly Shift Schedule</h2>
            <Badge variant="secondary" className="text-xs">
              {hours.start}:00–{hours.end}:00
            </Badge>
          </div>
          {!canEdit && (
            <Badge variant="outline" className="text-xs">
              Read-only mode
            </Badge>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x bg-border/50">
            {days.map((day) => {
              const dateKey = dayKeyLocal(day);
              const dayShifts = shiftsByDay[dateKey] ?? [];
              const laneInfo = lanesByDay[dateKey] ?? new Map();

              return (
                <DayColumn
                  key={dateKey}
                  date={day}
                  dateKey={dateKey}
                  isToday={dateKey === todayKey}
                  hours={hours}
                  shifts={dayShifts}
                  laneInfo={laneInfo}
                  conflictMap={conflictMap}
                  selectedIds={selectedIds}
                  canEdit={canEdit}
                  onSelect={onSelect}
                  setColRef={(dk, el) => {
                    colRefs.current[dk] = el;
                  }}
                />
              );
            })}
          </div>

          {/* Drag Overlay */}
          <DragOverlay dropAnimation={null}>
            {activeShift && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0.75 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "rounded-lg border-2 border-primary/60 bg-primary/10 p-3 shadow-xl backdrop-blur-sm pointer-events-none",
                  getStatusColor(activeShift.status)
                )}
              >
                <div className="font-medium text-sm">
                  {formatTime(activeShift.startAt)} – {formatTime(activeShift.endAt)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Drop to reschedule…</div>
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  );
}