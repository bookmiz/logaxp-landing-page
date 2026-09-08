"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import { Badge } from "@/logaxp/components/ui/badge";
import type { ShiftConflictsResponse } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function ConflictsDrawer({
  open,
  onOpenChange,
  conflicts,
  rangeLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conflicts: ShiftConflictsResponse | null;
  rangeLabel: string;
}) {
  const data = conflicts?.data ?? null;

  const overlaps = data?.overlaps ?? [];
  const rest = data?.restViolations ?? [];
  const invalid = data?.invalid ?? [];

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Conflicts & Policy Violations"
      subtitle="Overlap detection + min rest rule violations. Fix these before publishing."
      widthClassName="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <ShieldAlert className="h-3.5 w-3.5" />
            Range: {rangeLabel}
          </Badge>

          <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            Overlaps: {overlaps.length}
          </Badge>

          <Badge className="rounded-full border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            Rest violations: {rest.length}
          </Badge>

          <Badge variant="muted" className="rounded-full">
            Invalid: {invalid.length}
          </Badge>
        </div>

        {(!overlaps.length && !rest.length && !invalid.length) ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
            ✅ No conflicts detected.
          </div>
        ) : null}

        {overlaps.length ? (
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              Overlaps
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {overlaps.slice(0, 50).map((o, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="font-medium">Employee: {o.employeeId}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Shift A: {o.a} • Shift B: {o.b}
                  </div>
                </div>
              ))}
              {overlaps.length > 50 ? <div className="text-xs text-slate-500">Truncated at 50 rows.</div> : null}
            </div>
          </div>
        ) : null}

        {rest.length ? (
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300" />
              Min-rest Violations
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {rest.slice(0, 50).map((r, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="font-medium">Employee: {r.employeeId}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Prev: {r.prevId} • Next: {r.nextId} • Rest: {r.restMinutes}m • Required: {r.required}m
                  </div>
                </div>
              ))}
              {rest.length > 50 ? <div className="text-xs text-slate-500">Truncated at 50 rows.</div> : null}
            </div>
          </div>
        ) : null}

        {invalid.length ? (
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-sm font-medium">Invalid Shifts</div>
            <div className="mt-2 space-y-2 text-sm">
              {invalid.slice(0, 50).map((r, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="font-medium">Shift: {r.id}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.reason}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}