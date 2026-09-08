"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timeAdminService } from "@/logaxp/lib/time-management/timeAdminService";
import type { UpdateTimeSettingsDto, UpdateOvertimePolicyDto, CalcOvertimeDto } from "@/logaxp/lib/time-management/timeAdmin.types";

export function useTimeSettings() {
  return useQuery({
    queryKey: ["time-settings"],
    queryFn: () => timeAdminService.timeSettings.get(),
  });
}

export function useUpdateTimeSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTimeSettingsDto) => timeAdminService.timeSettings.update(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["time-settings"] });
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useOvertimePolicy() {
  return useQuery({
    queryKey: ["overtime-policy"],
    queryFn: () => timeAdminService.overtime.getPolicy(),
  });
}

export function useUpdateOvertimePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateOvertimePolicyDto) => timeAdminService.overtime.updatePolicy(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["overtime-policy"] });
      await qc.invalidateQueries({ queryKey: ["timesheets"] });
      await qc.invalidateQueries({ queryKey: ["time"] as any });
    },
  });
}

export function useCalcOvertime() {
  return useMutation({
    mutationFn: (dto: CalcOvertimeDto) => timeAdminService.overtime.calc(dto),
  });
}