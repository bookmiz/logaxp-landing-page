"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { GetSprintResponse, SprintBoardViewResponse, SprintVelocityResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { sprintKeys } from "./sprint.queryKeys";

export function useSprint(sprintId: string) {
  return useQuery<GetSprintResponse>({
    queryKey: sprintKeys.byId(sprintId),
    enabled: Boolean(sprintId),
    queryFn: async () => projectManagementService.sprints.get(sprintId),
  });
}

export function useSprintBoardView(sprintId: string) {
  return useQuery<SprintBoardViewResponse>({
    queryKey: sprintKeys.boardView(sprintId),
    enabled: Boolean(sprintId),
    queryFn: async () => projectManagementService.sprints.boardView(sprintId),
  });
}

export function useSprintVelocity(projectId: string) {
  return useQuery<SprintVelocityResponse>({
    queryKey: sprintKeys.velocity(projectId),
    enabled: Boolean(projectId),
    queryFn: async () => projectManagementService.sprints.velocity(projectId),
  });
}
