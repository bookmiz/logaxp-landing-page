"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { GetWorkItemResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { workItemKeys } from "./workItem.queryKeys";

export function useWorkItem(id: string) {
  return useQuery<GetWorkItemResponse>({
    queryKey: workItemKeys.byId(id),
    queryFn: async () => projectManagementService.workItems.get(id),
    enabled: Boolean(id),
  });
}