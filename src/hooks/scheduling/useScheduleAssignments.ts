"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleKeys } from "./queryKeys";
import { scheduleManagementService } from "@/logaxp/lib/scheduling/scheduleManagementService";
import type { CreateScheduleAssignmentDto, UpdateScheduleAssignmentDto } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function useScheduleAssignments(
  params?: { employeeId?: string; orgUnitId?: string; templateId?: string },
  enabled = true
) {
  return useQuery({
    queryKey: scheduleKeys.assignments(params as any),
    queryFn: () => scheduleManagementService.assignments.list(params),
    enabled,
  });
}

export function useCreateScheduleAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateScheduleAssignmentDto) => scheduleManagementService.assignments.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
    },
  });
}

export function useUpdateScheduleAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateScheduleAssignmentDto }) =>
      scheduleManagementService.assignments.update(id, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
    },
  });
}

export function useDeleteScheduleAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleManagementService.assignments.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
    },
  });
}