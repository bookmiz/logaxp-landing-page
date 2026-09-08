"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDroppable } from "@dnd-kit/core";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Inbox,
  CheckCircle2,
  KanbanSquare,
  EyeOff,
  PanelRightClose,
  PanelRightOpen,
  Eye,
  MoreHorizontal,
  LayoutGrid,
} from "lucide-react";

import type { BoardColumn, WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";
import { Button } from "@/logaxp/components/ui/button";
import { KanbanCard } from "./KanbanCard";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function pickColumnIcon(c: BoardColumn) {
  if (c.isBacklog) return Inbox;
  if (c.isDone) return CheckCircle2;
  return KanbanSquare;
}

function Pill({
  children,
  tone = "neutral",
  title,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn";
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone === "warn"
          ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
          : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
      )}
    >
      {children}
    </span>
  );
}

function IconButton({
  title,
  onClick,
  children,
  disabled,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cx(
        "grid h-8 w-8 place-items-center rounded-lg border text-slate-700 hover:bg-slate-50 disabled:opacity-60",
        "border-slate-200 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30"
      )}
    >
      {children}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onSelect,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
  danger?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        e.preventDefault();
        onSelect();
      }}
      className={cx(
        "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none",
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900/40"
      )}
    >
      <span className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </DropdownMenu.Item>
  );
}

export function KanbanColumn({
  column,
  items,

  minimized,
  onToggleMinimized,

  collapsed,
  onToggleCollapsed,

  hiddenCount,
  onRestoreHidden,

  onMinimizeOthers,

  onOpenItem,
  onCreateInColumn,
  maxBodyHeightClass = "max-h-[62vh]",

  isCardCollapsed,
  onToggleCardCollapsed,
  onCloseCard,
}: {
  column: BoardColumn;
  items: WorkItem[];

  minimized: boolean;
  onToggleMinimized: () => void;

  collapsed: boolean;
  onToggleCollapsed: () => void;

  hiddenCount: number;
  onRestoreHidden: () => void;

  onMinimizeOthers: () => void;

  onOpenItem: (w: WorkItem) => void;
  onCreateInColumn: (columnId: string) => void;
  maxBodyHeightClass?: string;

  isCardCollapsed: (workItemId: string) => boolean;
  onToggleCardCollapsed: (workItemId: string) => void;
  onCloseCard: (workItemId: string) => void;
}) {
  const dropId = `col:${column.id}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId });
  const Icon = pickColumnIcon(column);

  const wip = column.wipLimit != null ? Number(column.wipLimit) : null;
  const wipOver = wip != null ? items.length > wip : false;

  // =========================
  // MINIMIZED (RAIL)
  // =========================
  if (minimized) {
    return (
      <div
        ref={setNodeRef}
        className={cx(
          "h-full rounded-xl border bg-white shadow-sm",
          "border-slate-200 dark:border-slate-800 dark:bg-slate-950",
          isOver && "ring-2 ring-slate-300 dark:ring-slate-700"
        )}
      >
        <button
          type="button"
          onClick={onToggleMinimized}
          className="flex h-full w-full flex-col items-center justify-between p-2"
          title="Expand column"
        >
          <div className="flex w-full flex-col items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200">
              <Icon className="h-4 w-4" />
            </div>

            <Pill title="Items in column">{items.length}</Pill>

            {wip != null ? (
              <Pill tone={wipOver ? "warn" : "neutral"} title="Work in progress limit">
                WIP {wip}
              </Pill>
            ) : null}

            <div
              className="mt-2 select-none text-xs font-semibold text-slate-900 dark:text-slate-50"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {String(column.name ?? "-")}
            </div>
          </div>

          <div className="mb-1 grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200">
            <PanelRightOpen className="h-4 w-4" />
          </div>
        </button>
      </div>
    );
  }

  // =========================
  // NORMAL COLUMN
  // =========================
  return (
    <div
      className={cx(
        "rounded-xl border bg-white shadow-sm",
        "border-slate-200 dark:border-slate-800 dark:bg-slate-950",
        isOver && "ring-2 ring-slate-300 dark:ring-slate-700"
      )}
    >
      {/* Header (compact, 2 rows) */}
      <div className="sticky top-0 z-10 rounded-t-xl border-b border-slate-200 bg-white/90 p-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-start gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Row 1: title */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapsed();
                }}
                className="inline-flex min-w-0 items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {String(column.name ?? "-")}
                </span>
              </button>

              <span className="ml-auto truncate font-mono text-[10px] text-slate-400 dark:text-slate-500">
                {String(column.key ?? "-")}
              </span>
            </div>

            {/* Row 2: pills */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Pill title="Items in column">{items.length}</Pill>
              {wip != null ? (
                <Pill tone={wipOver ? "warn" : "neutral"} title="Work in progress limit">
                  WIP {wip}
                </Pill>
              ) : null}
              {column.isBacklog ? <Pill title="Backlog column">Backlog</Pill> : null}
              {column.isDone ? <Pill title="Done column">Done</Pill> : null}
              {hiddenCount > 0 ? <Pill title="Hidden cards">Hidden {hiddenCount}</Pill> : null}
            </div>
          </div>

          {/* Right actions: Add + 3-dot menu */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2 text-xs"
              title="Add work item"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onCreateInColumn(column.id);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className={cx(
                    "grid h-8 w-8 place-items-center rounded-lg border",
                    "border-slate-200 text-slate-700 hover:bg-slate-50",
                    "dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/30"
                  )}
                  title="Column actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={8}
                  align="end"
                  className={cx(
                    "z-50 w-56 rounded-xl border bg-white p-1 shadow-xl",
                    "border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem icon={<Plus className="h-4 w-4" />} label="Add work item" onSelect={() => onCreateInColumn(column.id)} />
                  <MenuItem icon={<Eye className="h-4 w-4" />} label="Focus (keep 4 open)" onSelect={onMinimizeOthers} />
                  <MenuItem
                    icon={<LayoutGrid className="h-4 w-4" />}
                    label={collapsed ? "Expand vertically" : "Collapse vertically"}
                    onSelect={onToggleCollapsed}
                  />
                  <MenuItem
                    icon={<PanelRightClose className="h-4 w-4" />}
                    label="Collapse to rail"
                    onSelect={onToggleMinimized}
                  />
                  {hiddenCount > 0 ? (
                    <>
                      <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                      <MenuItem icon={<EyeOff className="h-4 w-4" />} label={`Restore hidden (${hiddenCount})`} onSelect={onRestoreHidden} />
                    </>
                  ) : null}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Collapsed drop zone (still droppable) */}
        {collapsed ? (
          <div
            ref={setNodeRef}
            className={cx(
              "mt-2 rounded-lg border border-dashed p-2 text-xs",
              "border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400",
              isOver && "bg-slate-50 dark:bg-slate-900/30"
            )}
          >
            Drop here to move items
          </div>
        ) : null}
      </div>

      {/* Body */}
      {!collapsed ? (
        <div className="p-2.5">
          <div
            ref={setNodeRef}
            className={cx(
              "rounded-lg border border-dashed p-2",
              "border-slate-200 dark:border-slate-800",
              isOver && "bg-slate-50 dark:bg-slate-900/30"
            )}
          >
            <div className={cx("space-y-2 overflow-y-auto", maxBodyHeightClass)}>
              {items.length ? (
                items.map((w) => (
                  <KanbanCard
                    key={w.id}
                    item={w}
                    collapsed={isCardCollapsed(w.id)}
                    onToggleCollapsed={() => onToggleCardCollapsed(w.id)}
                    onClose={() => onCloseCard(w.id)}
                    onOpen={() => onOpenItem(w)}
                  />
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  <p>No items yet</p>
                  <p className="mt-1">Drag here or click Add</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}