"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/logaxp/components/ui/input";
import type { Board, BoardColumn } from "@/logaxp/lib/project-management/projectManagement.types";

export type WorkItemsFilterState = {
  q: string;
  boardId?: string;
  columnId?: string;
  type?: string;
  priority?: string;
};

export function WorkItemsFilters({
  value,
  onChange,
  boards,
  columns,
}: {
  value: WorkItemsFilterState;
  onChange: (next: WorkItemsFilterState) => void;
  boards: Board[];
  columns: BoardColumn[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px_180px_180px] lg:items-end">
      <Input
        label="Search"
        placeholder="Search work items..."
        value={value.q}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
        leftIcon={<Search className="h-4 w-4" />}
      />

      <div className="space-y-1">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Board</div>
        <select
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          value={value.boardId ?? ""}
          onChange={(e) => onChange({ ...value, boardId: e.target.value || undefined, columnId: undefined })}
        >
          <option value="">All boards</option>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {String(b.name ?? "Untitled")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</div>
        <select
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          value={value.type ?? ""}
          onChange={(e) => onChange({ ...value, type: e.target.value || undefined })}
        >
          <option value="">All types</option>
          {["TASK", "BUG", "STORY", "EPIC"].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Priority</div>
        <select
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          value={value.priority ?? ""}
          onChange={(e) => onChange({ ...value, priority: e.target.value || undefined })}
        >
          <option value="">All priorities</option>
          {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Column</div>
        <select
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950"
          disabled={!value.boardId}
          value={value.columnId ?? ""}
          onChange={(e) => onChange({ ...value, columnId: e.target.value || undefined })}
        >
          <option value="">{value.boardId ? "All columns" : "Select a board first"}</option>
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {String(c.name ?? "-")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
