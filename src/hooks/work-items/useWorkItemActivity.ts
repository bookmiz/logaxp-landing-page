"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { WorkItemActivityResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { workItemKeys } from "./workItem.queryKeys";

export function useWorkItemActivity(workItemId?: string | null) {
  return useQuery<WorkItemActivityResponse>({
    queryKey: workItemKeys.activity(workItemId ?? ""),
    queryFn: async () => projectManagementService.workItems.activity(String(workItemId)),
    enabled: Boolean(workItemId),
  });
}
