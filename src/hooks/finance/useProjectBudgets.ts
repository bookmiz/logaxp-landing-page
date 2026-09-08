"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProjectBudgetsQuery } from "@/logaxp/lib/project-finance/projectFinance.types";
import { projectFinanceService } from "@/logaxp/lib/project-finance/projectFinanceService";

export function useProjectBudgets(projectId: string, query?: ProjectBudgetsQuery) {
  return useQuery({
    queryKey: ["project-budgets", projectId, query ?? {}],
    queryFn: () => projectFinanceService.budgets.list(projectId, query),
    enabled: Boolean(projectId),
    staleTime: 10_000,
  });
}