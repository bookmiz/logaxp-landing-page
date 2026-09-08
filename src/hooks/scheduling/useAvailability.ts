"use client";

import { useQuery } from "@tanstack/react-query";
import { availabilityService } from "@/logaxp/lib/scheduling/availabilityService";
import type { AvailabilityListFilterDto } from "@/logaxp/lib/scheduling/availability.types";

export function useAvailability(filter?: AvailabilityListFilterDto, enabled = true) {
  return useQuery({
    queryKey: ["schedule", "availability", "list", filter] as const,
    queryFn: () => availabilityService.list(filter),
    enabled,
    staleTime: 15_000,
  });
}

export function useAvailabilityRule(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["schedule", "availability", "get", id] as const,
    queryFn: () => availabilityService.get(String(id)),
    enabled: Boolean(id) && enabled,
    staleTime: 15_000,
  });
}