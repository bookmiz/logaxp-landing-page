"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type { StartTimerDto, StopRunningTimerDto, SwitchTimerDto, StopTimerDto } from "@/logaxp/lib/time-management/timeManagement.types";

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: StartTimerDto) => timeManagementService.timers.start(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useStopRunningTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: StopRunningTimerDto) => timeManagementService.timers.stopRunning(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useSwitchTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SwitchTimerDto) => timeManagementService.timers.switch(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

// Optional (if you later want per-timer stop)
export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ timerId, dto }: { timerId: string; dto?: StopTimerDto }) =>
      timeManagementService.timers.stop(timerId, dto ?? {}),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}