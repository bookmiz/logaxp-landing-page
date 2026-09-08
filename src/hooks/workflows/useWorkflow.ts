"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { ApiResponse, Workflow } from "@/logaxp/lib/project-management/projectManagement.types";
import { workflowKeys } from "./workflow.queryKeys";

export type GetWorkflowResponse = ApiResponse<Workflow | null>;

export function useWorkflow(workflowId: string) {
  return useQuery<GetWorkflowResponse>({
    queryKey: workflowKeys.byId(workflowId),
    enabled: Boolean(workflowId),
    queryFn: async () => {
      const res = await projectManagementService.workflows.list();
      const data = (res as any)?.data;

      const items = Array.isArray(data?.items)
        ? (data.items as Workflow[])
        : Array.isArray(data)
          ? (data as Workflow[])
          : [];

      const found = items.find((w) => w.id === workflowId) ?? null;

      return { statusCode: 200, message: "ok", data: found };
    },
  });
}