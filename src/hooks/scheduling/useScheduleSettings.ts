"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleKeys } from "./queryKeys";
import { scheduleManagementService } from "@/logaxp/lib/scheduling/scheduleManagementService";
import type { UpdateScheduleSettingsDto } from "@/logaxp/lib/scheduling/scheduleManagement.types";

export function useScheduleSettings(enabled = true) {
  return useQuery({
    queryKey: scheduleKeys.settings(),
    queryFn: () => scheduleManagementService.settings.get(),
    enabled,
  });
}

export function useUpdateScheduleSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateScheduleSettingsDto) => scheduleManagementService.settings.update(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleKeys.root as any });
    },
  });
}