"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AddExpenseAttachmentDto,
  CreateProjectExpenseDto,
  DecideExpenseDto,
  UpdateProjectExpenseDto,
} from "@/logaxp/lib/project-finance/projectFinance.types";
import { projectFinanceService } from "@/logaxp/lib/project-finance/projectFinanceService";

function bump(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: ["project-expenses", projectId] }),
    qc.invalidateQueries({ queryKey: ["project-finance-summary", projectId] }),
  ]);
}

export function useCreateProjectExpense(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectExpenseDto) => projectFinanceService.expenses.create(projectId, dto),
    onSuccess: async () => bump(qc, projectId),
  });
}

export function useUpdateProjectExpense(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { expenseId: string; dto: UpdateProjectExpenseDto }) =>
      projectFinanceService.expenses.update(vars.expenseId, vars.dto),
    onSuccess: async () => bump(qc, projectId),
  });
}

export function useSubmitProjectExpense(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => projectFinanceService.expenses.submit(expenseId),
    onSuccess: async () => bump(qc, projectId),
  });
}

export function useApproveProjectExpense(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { expenseId: string; dto?: DecideExpenseDto }) =>
      projectFinanceService.expenses.approve(vars.expenseId, vars.dto),
    onSuccess: async () => bump(qc, projectId),
  });
}

export function useRejectProjectExpense(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { expenseId: string; dto?: DecideExpenseDto }) =>
      projectFinanceService.expenses.reject(vars.expenseId, vars.dto),
    onSuccess: async () => bump(qc, projectId),
  });
}

export function useDeleteProjectExpense(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => projectFinanceService.expenses.remove(expenseId),
    onSuccess: async () => bump(qc, projectId),
  });
}

export function useRestoreProjectExpense(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => projectFinanceService.expenses.restore(expenseId),
    onSuccess: async () => bump(qc, projectId),
  });
}

export function useAddExpenseAttachment(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { expenseId: string; dto: AddExpenseAttachmentDto }) =>
      projectFinanceService.expenses.addAttachment(vars.expenseId, vars.dto),
    onSuccess: async () => bump(qc, projectId),
  });
}

export function useRemoveExpenseAttachment(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => projectFinanceService.expenses.removeAttachment(attachmentId),
    onSuccess: async () => bump(qc, projectId),
  });
}