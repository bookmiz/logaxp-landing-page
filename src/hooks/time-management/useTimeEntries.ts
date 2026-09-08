"use client";

import { useQuery } from "@tanstack/react-query";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type { TimeEntryListFilterDto } from "@/logaxp/lib/time-management/timeManagement.types";
import { timeQueryKeys } from "./useTimeQueryKeys";

export function useTimeEntries(filter?: TimeEntryListFilterDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.entryList(filter as any),
    queryFn: () => timeManagementService.entries.list(filter),
    enabled,
  });
}