// src/components/orgStructure/shared/RowActionsMenu.tsx
"use client";

import React from "react";
import { MoreHorizontal, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/logaxp/components/ui/dropdown-menu";

export function RowActionsMenu({
  onEdit,
  onDelete,
  onRestore,
  canEdit = true,
  canDelete = true,
  canRestore = true,
  isDeleted,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  isDeleted?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Row actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {canEdit && onEdit ? (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        {!isDeleted && canDelete && onDelete ? (
          <DropdownMenuItem onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        ) : null}

        {isDeleted && canRestore && onRestore ? (
          <DropdownMenuItem onClick={onRestore}>
            <RotateCcw className="h-4 w-4" /> Restore
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}