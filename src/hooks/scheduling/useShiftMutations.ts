"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleKeys } from "./queryKeys";
import { scheduleManagementService } from "@/logaxp/lib/scheduling/scheduleManagementService";
import type {
  CreateShiftDto,
  UpdateShiftDto,
  CancelShiftDto,
  GenerateShiftsDto,
  PublishShiftsDto,
} from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateShiftDto) => scheduleManagementService.shifts.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
    },
  });
}

export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateShiftDto }) => scheduleManagementService.shifts.update(id, dto),
    onSuccess: async (_res, vars) => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
      await qc.invalidateQueries({ queryKey: scheduleKeys.shift(vars.id) as any });
    },
  });
}

export function useCancelShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: CancelShiftDto }) =>
      scheduleManagementService.shifts.cancel(id, dto ?? {}),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
    },
  });
}

export function useGenerateShifts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: GenerateShiftsDto) => scheduleManagementService.shifts.generate(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
    },
  });
}

export function usePublishShifts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PublishShiftsDto) => scheduleManagementService.shifts.publish(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
    },
  });
}