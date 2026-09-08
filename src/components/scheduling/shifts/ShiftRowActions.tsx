"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Ban } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import type { Shift } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function ShiftRowActions({
  row,
  busy,
  onEdit,
  onCancel,
}: {
  row: Shift;
  busy?: boolean;
  onEdit: (row: Shift) => void;
  onCancel: (row: Shift) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(row)} disabled={busy}>
        <Pencil className="h-4 w-4" />
        Edit
      </Button>

      <Button variant="outline" size="sm" onClick={() => onCancel(row)} disabled={busy}>
        <Ban className="h-4 w-4" />
        Cancel
      </Button>

      <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
        <MoreHorizontal className="h-4 w-4" />
      </div>
    </div>
  );
}