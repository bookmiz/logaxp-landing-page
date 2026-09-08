"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";

import type { WorkItem } from "@/logaxp/lib/project-management/projectManagement.types";
import { TypeBadge } from "@/logaxp/components/projects/work-items/TypeBadge";
import { PriorityPill } from "@/logaxp/components/projects/work-items/PriorityPill";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

export function KanbanCard({
  item,
  collapsed,
  onToggleCollapsed,
  onClose,
  onOpen,
}: {
  item: WorkItem;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onClose: () => void;
  onOpen: () => void;
}) {
  const id = `item:${item.id}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const keyLabel = String(item.key ?? "").trim() || item.id.slice(0, 8);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(
        "group relative rounded-xl border bg-white",
        "border-slate-200 dark:border-slate-800 dark:bg-slate-950",
        "shadow-sm hover:shadow-md transition-shadow",
        isDragging && "opacity-70"
      )}
      // ✅ card click opens (PointerSensor distance prevents accidental opens during drag)
      onClick={() => {
        if (!isDragging) onOpen();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isDragging) onOpen();
        }
      }}
    >
      <div className="flex items-start gap-2 px-2.5 py-2.5">
        {/* ✅ Drag handle ONLY (FIXED) */}
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          // ✅ keep click from opening drawer
          onClick={(e) => e.stopPropagation()}
          // ❌ DO NOT add onPointerDown here (it overrides dnd-kit and breaks drag)
          className={cx(
            "mt-[2px] grid h-8 w-8 place-items-center rounded-lg border",
            "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/40"
          )}
          title="Drag"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* top meta row */}
          <div className="flex items-center gap-2">
            <TypeBadge type={String(item.type ?? "")} />
            <PriorityPill priority={String(item.priority ?? "")} />

            <span className="ml-auto font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {keyLabel}
            </span>

            {/* ✅ 3-dot menu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  // prevent opening drawer when clicking menu
                  onClick={(e) => e.stopPropagation()}
                  className={cx(
                    "grid h-8 w-8 place-items-center rounded-lg border",
                    "border-slate-200 text-slate-700 hover:bg-slate-50",
                    "dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/40",
                    "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  )}
                  title="Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={8}
                  align="end"
                  className={cx(
                    "z-50 w-52 rounded-xl border bg-white p-1 shadow-xl",
                    "border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                  )}
                  // prevent click bubbling into card open
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem icon={<ExternalLink className="h-4 w-4" />} label="Open" onSelect={onOpen} />

                  <MenuItem
                    icon={collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    label={collapsed ? "Expand card" : "Collapse card"}
                    onSelect={onToggleCollapsed}
                  />

                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

                  <MenuItem icon={<X className="h-4 w-4" />} label="Hide card" onSelect={onClose} danger />
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* title */}
          <div
            className={cx(
              "mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50",
              collapsed ? "line-clamp-1" : "line-clamp-2"
            )}
          >
            {String(item.title ?? "-")}
          </div>

          {/* small secondary line (optional) */}
          {!collapsed && item.description ? (
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {String(item.description)}
            </div>
          ) : null}
        </div>
      </div>

      {/* subtle collapsed hint */}
      {collapsed ? (
        <div className="px-2.5 pb-2 text-[11px] text-slate-500 dark:text-slate-400">
          Collapsed • Click to open
        </div>
      ) : null}
    </div>
  );
}