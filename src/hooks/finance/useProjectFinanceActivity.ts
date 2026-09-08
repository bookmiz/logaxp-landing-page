"use client";

import { useQuery } from "@tanstack/react-query";
import { projectFinanceService } from "@/logaxp/lib/project-finance/projectFinanceService";

export function useProjectFinanceActivity(projectId: string) {
  return useQuery({
    queryKey: ["project-finance-activity", projectId],
    enabled: Boolean(projectId),
    queryFn: () => projectFinanceService.activity(projectId),
  });
}
