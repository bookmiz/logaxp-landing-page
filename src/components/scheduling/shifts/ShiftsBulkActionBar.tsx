"use client";

import * as React from "react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Trash2, Upload, Undo2, Ban } from "lucide-react";

export function ShiftsBulkActionBar({
  count,
  disabled,
  canPublish,
  canCancel,
  canDelete,
  onClear,
  onPublish,
  onUnpublish,
  onCancel,
  onDelete,
}: {
  count: number;
  disabled?: boolean;

  canPublish: boolean;
  canCancel: boolean;
  canDelete: boolean;

  onClear: () => void;

  onPublish: () => void | Promise<void>;
  onUnpublish: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}) {
  if (count <= 0) return null;

  return (
    <div className="sticky top-2 z-10 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            Selected: {count}
          </Badge>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={disabled || !canPublish} onClick={onPublish}>
            <Upload className="h-4 w-4" />
            Publish
          </Button>

          <Button variant="outline" disabled={disabled || !canPublish} onClick={onUnpublish}>
            <Undo2 className="h-4 w-4" />
            Unpublish
          </Button>

          <Button variant="outline" disabled={disabled || !canCancel} onClick={onCancel}>
            <Ban className="h-4 w-4" />
            Cancel
          </Button>

          <Button variant="outline" disabled={disabled || !canDelete} onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}