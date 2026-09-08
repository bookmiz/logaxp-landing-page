"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { ListWorkflowsResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { workflowKeys } from "./workflow.queryKeys";

export function useWorkflows() {
  return useQuery<ListWorkflowsResponse>({
    queryKey: workflowKeys.list(),
    queryFn: () => projectManagementService.workflows.list(),
  });
}