"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type {
  ClockInDto,
  ClockOutDto,
  AddBreakDto,
  SetBreakDto,
  TimeClockAdjustDto,
} from "@/logaxp/lib/time-management/timeManagement.types";

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ClockInDto) => timeManagementService.clocks.clockIn(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clockId, dto }: { clockId: string; dto?: ClockOutDto }) =>
      timeManagementService.clocks.clockOut(clockId, dto ?? {}),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useAddBreak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clockId, dto }: { clockId: string; dto: AddBreakDto }) =>
      timeManagementService.clocks.addBreak(clockId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useSetBreak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clockId, dto }: { clockId: string; dto: SetBreakDto }) =>
      timeManagementService.clocks.setBreak(clockId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useAdjustTimeClock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clockId, dto }: { clockId: string; dto: TimeClockAdjustDto }) =>
      timeManagementService.clocks.adjust(clockId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}