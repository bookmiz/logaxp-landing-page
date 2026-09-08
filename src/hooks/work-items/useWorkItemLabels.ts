"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { ListWorkItemLabelsResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { workItemKeys } from "./workItem.queryKeys";

export function useWorkItemLabels() {
  return useQuery<ListWorkItemLabelsResponse>({
    queryKey: workItemKeys.labels(),
    queryFn: async () => projectManagementService.workItems.listLabels(),
  });
}
