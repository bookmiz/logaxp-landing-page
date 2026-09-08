"use client";

import * as React from "react";
import { useShiftConflicts } from "@/logaxp/hooks/scheduling/useShifts";
import type { ShiftConflictsResponse } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export type ShiftConflictFlags = {
  overlap?: boolean;
  restViolation?: boolean;
  invalid?: boolean;
};

export function useShiftConflictsMap(
  input: { from: string; to: string; employeeId?: string; orgUnitId?: string; locationId?: string },
  enabled: boolean
) {
  const q = useShiftConflicts(input as any, enabled);

  const conflictMap = React.useMemo(() => {
    const res = (q.data as ShiftConflictsResponse | null)?.data;
    const m: Record<string, ShiftConflictFlags> = {};
    if (!res) return m;

    const mark = (id: unknown, patch: ShiftConflictFlags) => {
      if (!id) return;
      const k = String(id);
      m[k] = { ...(m[k] ?? {}), ...patch };
    };

    // overlaps: { employeeId, a, b } where a/b are shift ids
    for (const x of res.overlaps ?? []) {
      mark((x as any).a, { overlap: true });
      mark((x as any).b, { overlap: true });
    }

    // restViolations: { prevId, nextId, ... } where prevId/nextId are shift ids
    for (const x of res.restViolations ?? []) {
      mark((x as any).prevId, { restViolation: true });
      mark((x as any).nextId, { restViolation: true });
    }

    // invalid: { id, reason } where id is shift id
    for (const x of res.invalid ?? []) {
      mark((x as any).id, { invalid: true });
    }

    return m;
  }, [q.data]);

  const totals = React.useMemo(() => {
    const res = (q.data as ShiftConflictsResponse | null)?.data;
    return {
      overlaps: res?.overlaps?.length ?? 0,
      rest: res?.restViolations?.length ?? 0,
      invalid: res?.invalid?.length ?? 0,
    };
  }, [q.data]);

  return { ...q, conflictMap, totals };
}