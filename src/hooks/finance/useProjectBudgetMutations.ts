"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProjectBudgetDto, DecideBudgetDto, UpdateProjectBudgetDto } from "@/logaxp/lib/project-finance/projectFinance.types";
import { projectFinanceService } from "@/logaxp/lib/project-finance/projectFinanceService";

export function useCreateProjectBudget(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectBudgetDto) => projectFinanceService.budgets.create(projectId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["project-budgets", projectId] });
      await qc.invalidateQueries({ queryKey: ["project-finance-summary", projectId] });
    },
  });
}

export function useUpdateProjectBudget(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { budgetId: string; dto: UpdateProjectBudgetDto }) =>
      projectFinanceService.budgets.update(vars.budgetId, vars.dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["project-budgets", projectId] });
      await qc.invalidateQueries({ queryKey: ["project-finance-summary", projectId] });
    },
  });
}

export function useSubmitProjectBudget(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: string) => projectFinanceService.budgets.submit(budgetId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["project-budgets", projectId] });
      await qc.invalidateQueries({ queryKey: ["project-finance-summary", projectId] });
    },
  });
}

export function useApproveProjectBudget(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { budgetId: string; dto?: DecideBudgetDto }) =>
      projectFinanceService.budgets.approve(vars.budgetId, vars.dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["project-budgets", projectId] });
      await qc.invalidateQueries({ queryKey: ["project-finance-summary", projectId] });
    },
  });
}

export function useRejectProjectBudget(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { budgetId: string; dto?: DecideBudgetDto }) =>
      projectFinanceService.budgets.reject(vars.budgetId, vars.dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["project-budgets", projectId] });
      await qc.invalidateQueries({ queryKey: ["project-finance-summary", projectId] });
    },
  });
}

export function useDeleteProjectBudget(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: string) => projectFinanceService.budgets.remove(budgetId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["project-budgets", projectId] });
      await qc.invalidateQueries({ queryKey: ["project-finance-summary", projectId] });
    },
  });
}

export function useRestoreProjectBudget(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: string) => projectFinanceService.budgets.restore(budgetId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["project-budgets", projectId] });
      await qc.invalidateQueries({ queryKey: ["project-finance-summary", projectId] });
    },
  });
}