"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { ProjectListQuery, ListProjectsResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { projectKeys } from "./project.queryKeys";

export function useProjects(query?: ProjectListQuery) {
  return useQuery<ListProjectsResponse>({
    queryKey: projectKeys.list(query),
    queryFn: async () => projectManagementService.projects.list(query),
  });
}