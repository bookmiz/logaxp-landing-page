"use client";

import { useQuery } from "@tanstack/react-query";
import { scheduleKeys } from "./queryKeys";
import { scheduleManagementService } from "@/logaxp/lib/scheduling/scheduleManagementService";
import type { ListShiftsDto, ShiftConflictsDto } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function useShifts(filter: ListShiftsDto | null, enabled = true) {
  return useQuery({
    queryKey: scheduleKeys.shifts(filter as any),
    queryFn: () => scheduleManagementService.shifts.list(filter as ListShiftsDto),
    enabled: Boolean(filter) && enabled,
  });
}

export function useShift(id: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: id ? scheduleKeys.shift(id) : scheduleKeys.shift("none"),
    queryFn: () => scheduleManagementService.shifts.get(String(id)),
    enabled: Boolean(id) && enabled,
  });
}

export function useShiftConflicts(dto: ShiftConflictsDto | null, enabled = true) {
  return useQuery({
    queryKey: scheduleKeys.conflicts(dto as any),
    queryFn: () => scheduleManagementService.shifts.conflicts(dto as ShiftConflictsDto),
    enabled: Boolean(dto) && enabled,
  });
}