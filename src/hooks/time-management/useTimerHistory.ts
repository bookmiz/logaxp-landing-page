"use client";

import { useQuery } from "@tanstack/react-query";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type { TimerHistoryFilterDto } from "@/logaxp/lib/time-management/timeManagement.types";
import { timeQueryKeys } from "./useTimeQueryKeys";

export function useTimerHistory(filter?: TimerHistoryFilterDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.history(filter as any),
    queryFn: () => timeManagementService.timers.history(filter),
    enabled,
  });
}