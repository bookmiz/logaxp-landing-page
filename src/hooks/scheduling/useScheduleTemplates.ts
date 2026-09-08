"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleKeys } from "./queryKeys";
import { scheduleManagementService } from "@/logaxp/lib/scheduling/scheduleManagementService";
import type { CreateScheduleTemplateDto, UpdateScheduleTemplateDto } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function useScheduleTemplates(enabled = true) {
  return useQuery({
    queryKey: scheduleKeys.templates(),
    queryFn: () => scheduleManagementService.templates.list(),
    enabled,
  });
}

export function useScheduleTemplate(id: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: id ? scheduleKeys.template(id) : scheduleKeys.template("none"),
    queryFn: () => scheduleManagementService.templates.get(String(id)),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateScheduleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateScheduleTemplateDto) => scheduleManagementService.templates.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.templates() as any });
    },
  });
}

export function useUpdateScheduleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateScheduleTemplateDto }) =>
      scheduleManagementService.templates.update(id, dto),
    onSuccess: async (_res, vars) => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.templates() as any });
      await qc.invalidateQueries({ queryKey: scheduleKeys.template(vars.id) as any });
    },
  });
}

export function useDeleteScheduleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleManagementService.templates.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.templates() as any });
    },
  });
}