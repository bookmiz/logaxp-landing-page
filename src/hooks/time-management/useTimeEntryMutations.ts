"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { timeManagementService } from "@/logaxp/lib/time-management/timeManagementService";
import type {
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
} from "@/logaxp/lib/time-management/timeManagement.types";

export function useCreateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTimeEntryDto) => timeManagementService.entries.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useUpdateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTimeEntryDto }) =>
      timeManagementService.entries.update(id, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useSoftDeleteTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeManagementService.entries.softDelete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useRestoreTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeManagementService.entries.restore(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useHardDeleteTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeManagementService.entries.hardDelete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}