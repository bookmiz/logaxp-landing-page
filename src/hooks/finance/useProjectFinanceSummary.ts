"use client";

import { useQuery } from "@tanstack/react-query";
import { projectFinanceService } from "@/logaxp/lib/project-finance/projectFinanceService";

export function useProjectFinanceSummary(projectId: string) {
  return useQuery({
    queryKey: ["project-finance-summary", projectId],
    queryFn: () => projectFinanceService.summary(projectId),
    enabled: Boolean(projectId),
    staleTime: 30_000,
  });
}