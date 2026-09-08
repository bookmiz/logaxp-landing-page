"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { ListSprintsResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { sprintKeys } from "./sprint.queryKeys";

export function useSprints(projectId?: string) {
  return useQuery<ListSprintsResponse>({
    queryKey: sprintKeys.byProject(projectId),
    queryFn: () => projectManagementService.sprints.listByProject(projectId),
  });
}
