"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { ListWorkItemsResponse, WorkItemListQuery } from "@/logaxp/lib/project-management/projectManagement.types";
import { workItemKeys } from "./workItem.queryKeys";

export function useWorkItems(query?: WorkItemListQuery) {
  const enabled = Boolean(query?.projectId);
  return useQuery<ListWorkItemsResponse>({
    queryKey: workItemKeys.list(query),
    queryFn: async () => projectManagementService.workItems.list(query),
    enabled,
  });
}