"use client";

import { useQuery } from "@tanstack/react-query";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type {
  TimeEntriesStatsDto,
  TimeEntriesDailySummaryDto,
  TimeEntryListFilterDto,
  TimerHistoryFilterDto,
  TimeClockListFilterDto,
  TimeClockSummaryDto,
} from "@/logaxp/lib/time-management/timeManagement.types";
import { timeQueryKeys } from "./useTimeQueryKeys";

export function useTimeEntriesStats(filter?: TimeEntriesStatsDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.entryStats(filter as any),
    queryFn: () => timeManagementService.entries.stats(filter),
    enabled,
  });
}

export function useTimeEntriesDailySummary(filter?: TimeEntriesDailySummaryDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.entryDailySummary(filter as any),
    queryFn: () => timeManagementService.entries.dailySummary(filter!),
    enabled: enabled && Boolean(filter?.from && filter?.to),
  });
}

export function useTimeEntriesPreview(filter?: TimeEntryListFilterDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.entryList({ ...(filter as any), _preview: true }),
    queryFn: () => timeManagementService.entries.list(filter),
    enabled,
  });
}

export function useTimerHistoryPreview(filter?: TimerHistoryFilterDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.history({ ...(filter as any), _preview: true }),
    queryFn: () => timeManagementService.timers.history(filter),
    enabled,
  });
}

export function useRunningTimer(membershipId?: string | null, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.running(membershipId ?? undefined),
    queryFn: () => timeManagementService.timers.getRunning(membershipId!),
    enabled: enabled && Boolean(membershipId),
  });
}

export function useTimeClocksPreview(filter?: TimeClockListFilterDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.clockList({ ...(filter as any), _preview: true }),
    queryFn: () => timeManagementService.clocks.list(filter),
    enabled,
  });
}

export function useTimeClockSummary(filter?: TimeClockSummaryDto, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.clockSummary(filter as any),
    queryFn: () => timeManagementService.clocks.summary(filter!),
    enabled: enabled && Boolean(filter?.from && filter?.to),
  });
}

export function useOpenTimeClock(employeeId?: string | null, enabled = true) {
  return useQuery({
    queryKey: timeQueryKeys.openClock(employeeId ?? undefined),
    queryFn: () => timeManagementService.clocks.getOpen(employeeId!),
    enabled: enabled && Boolean(employeeId),
  });
}