// src/logaxp/components/projects/timeline/events/EventRowActions.tsx
"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2, RotateCcw } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/logaxp/components/ui/dropdown-menu";

import type { ProjectTimelineEvent } from "@/logaxp/lib/project-management/projectManagement.types";

type Props = {
  row: ProjectTimelineEvent;
  onEdit: (row: ProjectTimelineEvent) => void;
  onDelete: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;
};

export function EventRowActions({ row, onEdit, onDelete, onRestore }: Props) {
  const deleted = Boolean(row.deletedAt);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Row actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem onClick={() => onEdit(row)} disabled={deleted}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {!deleted ? (
          <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => onDelete(String(row.id))}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onRestore(String(row.id))}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}