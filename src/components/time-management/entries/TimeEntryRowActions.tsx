"use client";

import * as React from "react";
import { Pencil, Trash2, RotateCcw, Flame } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import type { TimeEntry } from "@/logaxp/lib/time-management/timeManagement.types";

type Props = {
  row: TimeEntry;
  onEdit: (row: TimeEntry) => void;
  onSoftDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
  busy?: boolean;
};

export function TimeEntryRowActions({
  row,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
  busy,
}: Props) {
  const isDeleted = Boolean(row.deletedAt);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(row)} disabled={busy}>
        <Pencil className="h-4 w-4" />
        Edit
      </Button>

      {!isDeleted ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSoftDelete(row.id)}
          disabled={busy}
          className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      ) : (
        <>
          <Button variant="outline" size="sm" onClick={() => onRestore(row.id)} disabled={busy}>
            <RotateCcw className="h-4 w-4" />
            Restore
          </Button>
          <Button
            size="sm"
            onClick={() => onHardDelete(row.id)}
            disabled={busy}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Flame className="h-4 w-4" />
            Hard delete
          </Button>
        </>
      )}
    </div>
  );
}