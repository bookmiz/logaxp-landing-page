"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { GetProjectResponse, ProjectActivityResponse, ProjectSummaryResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { projectKeys } from "./project.queryKeys";

export function useProject(id: string) {
  return useQuery<GetProjectResponse>({
    queryKey: projectKeys.byId(id),
    queryFn: async () => projectManagementService.projects.get(id),
    enabled: Boolean(id),
  });
}

export function useProjectSummary(id: string) {
  return useQuery<ProjectSummaryResponse>({
    queryKey: projectKeys.summary(id),
    queryFn: async () => projectManagementService.projects.summary(id),
    enabled: Boolean(id),
  });
}

export function useProjectActivity(id: string) {
  return useQuery<ProjectActivityResponse>({
    queryKey: projectKeys.activity(id),
    queryFn: async () => projectManagementService.projects.activity(id),
    enabled: Boolean(id),
  });
}
