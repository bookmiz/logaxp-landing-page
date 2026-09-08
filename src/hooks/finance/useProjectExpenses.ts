"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProjectExpensesQuery } from "@/logaxp/lib/project-finance/projectFinance.types";
import { projectFinanceService } from "@/logaxp/lib/project-finance/projectFinanceService";

export function useProjectExpenses(projectId: string, query?: ProjectExpensesQuery) {
  return useQuery({
    queryKey: ["project-expenses", projectId, query ?? {}],
    queryFn: () => projectFinanceService.expenses.list(projectId, query),
    enabled: Boolean(projectId),
    staleTime: 10_000,
  });
}