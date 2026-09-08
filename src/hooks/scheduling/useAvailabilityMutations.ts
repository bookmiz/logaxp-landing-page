"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityService } from "@/logaxp/lib/scheduling/availabilityService";
import type {
  BulkUpsertAvailabilityDto,
  CreateAvailabilityRuleDto,
  UpdateAvailabilityRuleDto,
} from "@/logaxp/lib/scheduling/availability.types";

export function useCreateAvailabilityRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAvailabilityRuleDto) => availabilityService.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["schedule", "availability"] as any });
    },
  });
}

export function useUpdateAvailabilityRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; dto: UpdateAvailabilityRuleDto }) =>
      availabilityService.update(p.id, p.dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["schedule", "availability"] as any });
    },
  });
}

export function useDeleteAvailabilityRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityService.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["schedule", "availability"] as any });
    },
  });
}

export function useBulkUpsertAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkUpsertAvailabilityDto) => availabilityService.bulkUpsert(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["schedule", "availability"] as any });
    },
  });
}