"use client";

import { useQuery } from "@tanstack/react-query";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type { TimeClockListFilterDto } from "@/logaxp/lib/time-management/timeManagement.types";
import { timeQueryKeys } from "./useTimeQueryKeys";

export function useTimeClocks(filter?: TimeClockListFilterDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.clockList(filter as any),
    queryFn: () => timeManagementService.clocks.list(filter),
    enabled,
  });
}