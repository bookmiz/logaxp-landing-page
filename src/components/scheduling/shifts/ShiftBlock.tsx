"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { Shift } from "@/logaxp/lib/scheduling/scheduleManagement.types";
import type { ShiftConflictFlags } from "@/logaxp/hooks/scheduling/useShiftConflictsMap";

function fmtTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ShiftBlock({
  shift,
  conflict,
  selected,
  onClick,
}: {
  shift: Shift;
  conflict?: ShiftConflictFlags;
  selected?: boolean;
  onClick?: () => void;
}) {
  const hasIssue = Boolean(conflict?.invalid || conflict?.overlap || conflict?.restViolation);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl border p-2 text-left text-xs shadow-sm",
        "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900",
        selected ? "border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-950/40" : "border-slate-200 dark:border-slate-800",
      ].join(" ")}
      title={shift.id}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-slate-900 dark:text-slate-50">
          {fmtTime(shift.startAt)}–{fmtTime(shift.endAt)}
        </div>

        {hasIssue ? (
          <Badge className="rounded-full border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            Issue
          </Badge>
        ) : (
          <Badge variant="muted" className="rounded-full">
            {String(shift.status ?? "DRAFT")}
          </Badge>
        )}
      </div>

      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        {shift.employeeId ? `Emp ${String(shift.employeeId).slice(0, 6)}` : shift.orgUnitId ? `Org ${String(shift.orgUnitId).slice(0, 6)}` : "—"}
        {shift.locationId ? ` • Loc ${String(shift.locationId).slice(0, 6)}` : ""}
      </div>

      {hasIssue ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {conflict?.overlap ? <Badge variant="muted" className="rounded-full">Overlap</Badge> : null}
          {conflict?.restViolation ? <Badge variant="muted" className="rounded-full">Rest</Badge> : null}
          {conflict?.invalid ? <Badge variant="muted" className="rounded-full">Invalid</Badge> : null}
        </div>
      ) : null}
    </button>
  );
}