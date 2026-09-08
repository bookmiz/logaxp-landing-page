"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  ApiResponse,

  ProjectBudgetsQuery,
  CreateProjectBudgetDto,
  UpdateProjectBudgetDto,
  DecideBudgetDto,

  ProjectBudget,
  FinanceSummary,

  ListBudgetsResponse,
  GetBudgetResponse,
  CreateBudgetResponse,
  UpdateBudgetResponse,
  SubmitBudgetResponse,
  DecideBudgetResponse,
  DeleteBudgetResponse,
  RestoreBudgetResponse,
  GetFinanceSummaryResponse,
  GetFinanceActivityResponse,
  GetFinanceExportResponse,
  ProjectFinanceActivity,
  ProjectFinanceExport,

  // expenses types
  ProjectExpensesQuery,
  ProjectExpense,
  CreateProjectExpenseDto,
  UpdateProjectExpenseDto,
  DecideExpenseDto,
  ListExpensesResponse,
  GetExpenseResponse,
  CreateExpenseResponse,
  UpdateExpenseResponse,
  SubmitExpenseResponse,
  DecideExpenseResponse,
  MarkPaidExpenseResponse,
  DeleteExpenseResponse,
  RestoreExpenseResponse,
  AddExpenseAttachmentDto,
  ProjectExpenseAttachment,
  AddExpenseAttachmentResponse,
  RemoveExpenseAttachmentResponse,
} from "./projectFinance.types";

function ok<T>(statusCode: number, data: T): ApiResponse<T> {
  return { statusCode, message: "ok", data };
}

function cleanParams(obj?: Record<string, unknown> | object): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function enc(v: string) {
  return encodeURIComponent(v);
}

/**
 * ✅ Matches BE controller exactly:
 *
 * SUMMARY
 * - GET /projects/:projectId/finance/summary
 *
 * BUDGETS (scoped)
 * - GET    /projects/:projectId/finance/budgets
 * - POST   /projects/:projectId/finance/budgets
 *
 * BUDGETS (by id)
 * - GET    /projects/finance/budgets/:budgetId
 * - PATCH  /projects/finance/budgets/:budgetId
 * - POST   /projects/finance/budgets/:budgetId/submit
 * - POST   /projects/finance/budgets/:budgetId/approve
 * - POST   /projects/finance/budgets/:budgetId/reject
 * - DELETE /projects/finance/budgets/:budgetId
 * - POST   /projects/finance/budgets/:budgetId/restore
 *
 * EXPENSES (scoped)
 * - GET    /projects/:projectId/finance/expenses
 * - POST   /projects/:projectId/finance/expenses
 *
 * EXPENSES (by id)
 * - GET    /projects/finance/expenses/:expenseId
 * - PATCH  /projects/finance/expenses/:expenseId
 * - POST   /projects/finance/expenses/:expenseId/submit
 * - POST   /projects/finance/expenses/:expenseId/approve
 * - POST   /projects/finance/expenses/:expenseId/reject
 * - POST   /projects/finance/expenses/:expenseId/paid
 * - DELETE /projects/finance/expenses/:expenseId
 * - POST   /projects/finance/expenses/:expenseId/restore
 *
 * ATTACHMENTS
 * - POST   /projects/finance/expenses/:expenseId/attachments
 * - DELETE /projects/finance/expenses/attachments/:attachmentId
 */
export const projectFinanceService = {
  async summary(projectId: string): Promise<GetFinanceSummaryResponse> {
    const res = await api.get<FinanceSummary>(`/projects/${enc(projectId)}/finance/summary`);
    return ok(res.status, res.data);
  },

  async activity(projectId: string): Promise<GetFinanceActivityResponse> {
    const res = await api.get<ProjectFinanceActivity[]>(`/projects/${enc(projectId)}/finance/activity`);
    return ok(res.status, res.data);
  },

  async export(projectId: string): Promise<GetFinanceExportResponse> {
    const res = await api.get<ProjectFinanceExport>(`/projects/${enc(projectId)}/finance/export`);
    return ok(res.status, res.data);
  },

  budgets: {
    async list(projectId: string, query?: ProjectBudgetsQuery): Promise<ListBudgetsResponse> {
      const res = await api.get<ListBudgetsResponse["data"]>(`/projects/${enc(projectId)}/finance/budgets`, {
        params: cleanParams(query as Record<string, unknown>),
      });
      return ok(res.status, res.data);
    },

    async get(budgetId: string): Promise<GetBudgetResponse> {
      const res = await api.get<ProjectBudget>(`/projects/finance/budgets/${enc(budgetId)}`);
      return ok(res.status, res.data);
    },

    async create(projectId: string, dto: CreateProjectBudgetDto): Promise<CreateBudgetResponse> {
      const res = await api.post<ProjectBudget>(`/projects/${enc(projectId)}/finance/budgets`, dto);
      return ok(res.status, res.data);
    },

    async update(budgetId: string, dto: UpdateProjectBudgetDto): Promise<UpdateBudgetResponse> {
      const res = await api.patch<ProjectBudget>(`/projects/finance/budgets/${enc(budgetId)}`, dto);
      return ok(res.status, res.data);
    },

    async submit(budgetId: string): Promise<SubmitBudgetResponse> {
      const res = await api.post<ProjectBudget | { ok?: true }>(`/projects/finance/budgets/${enc(budgetId)}/submit`);
      return ok(res.status, res.data);
    },

    async approve(budgetId: string, dto?: DecideBudgetDto): Promise<DecideBudgetResponse> {
      const res = await api.post<ProjectBudget | { ok?: true }>(
        `/projects/finance/budgets/${enc(budgetId)}/approve`,
        dto ?? {}
      );
      return ok(res.status, res.data);
    },

    async reject(budgetId: string, dto?: DecideBudgetDto): Promise<DecideBudgetResponse> {
      const res = await api.post<ProjectBudget | { ok?: true }>(
        `/projects/finance/budgets/${enc(budgetId)}/reject`,
        dto ?? {}
      );
      return ok(res.status, res.data);
    },

    async remove(budgetId: string): Promise<DeleteBudgetResponse> {
      const res = await api.delete<{ ok?: true }>(`/projects/finance/budgets/${enc(budgetId)}`);
      return ok(res.status, res.data);
    },

    async restore(budgetId: string): Promise<RestoreBudgetResponse> {
      const res = await api.post<ProjectBudget | { ok?: true }>(`/projects/finance/budgets/${enc(budgetId)}/restore`);
      return ok(res.status, res.data);
    },
  },

  expenses: {
    async list(projectId: string, query?: ProjectExpensesQuery): Promise<ListExpensesResponse> {
      const res = await api.get<ListExpensesResponse["data"]>(`/projects/${enc(projectId)}/finance/expenses`, {
        params: cleanParams(query as Record<string, unknown>),
      });
      return ok(res.status, res.data);
    },

    async get(expenseId: string): Promise<GetExpenseResponse> {
      const res = await api.get<ProjectExpense>(`/projects/finance/expenses/${enc(expenseId)}`);
      return ok(res.status, res.data);
    },

    async create(projectId: string, dto: CreateProjectExpenseDto): Promise<CreateExpenseResponse> {
      const res = await api.post<ProjectExpense>(`/projects/${enc(projectId)}/finance/expenses`, dto);
      return ok(res.status, res.data);
    },

    async update(expenseId: string, dto: UpdateProjectExpenseDto): Promise<UpdateExpenseResponse> {
      const res = await api.patch<ProjectExpense>(`/projects/finance/expenses/${enc(expenseId)}`, dto);
      return ok(res.status, res.data);
    },

    async submit(expenseId: string): Promise<SubmitExpenseResponse> {
      const res = await api.post<ProjectExpense | { ok?: true }>(`/projects/finance/expenses/${enc(expenseId)}/submit`);
      return ok(res.status, res.data);
    },

    async approve(expenseId: string, dto?: DecideExpenseDto): Promise<DecideExpenseResponse> {
      const res = await api.post<ProjectExpense | { ok?: true }>(
        `/projects/finance/expenses/${enc(expenseId)}/approve`,
        dto ?? {}
      );
      return ok(res.status, res.data);
    },

    async reject(expenseId: string, dto?: DecideExpenseDto): Promise<DecideExpenseResponse> {
      const res = await api.post<ProjectExpense | { ok?: true }>(
        `/projects/finance/expenses/${enc(expenseId)}/reject`,
        dto ?? {}
      );
      return ok(res.status, res.data);
    },

    async markPaid(expenseId: string): Promise<MarkPaidExpenseResponse> {
      const res = await api.post<ProjectExpense>(`/projects/finance/expenses/${enc(expenseId)}/paid`);
      return ok(res.status, res.data);
    },

    async remove(expenseId: string): Promise<DeleteExpenseResponse> {
      const res = await api.delete<{ ok?: true }>(`/projects/finance/expenses/${enc(expenseId)}`);
      return ok(res.status, res.data);
    },

    async restore(expenseId: string): Promise<RestoreExpenseResponse> {
      const res = await api.post<ProjectExpense | { ok?: true }>(`/projects/finance/expenses/${enc(expenseId)}/restore`);
      return ok(res.status, res.data);
    },

    async addAttachment(expenseId: string, dto: AddExpenseAttachmentDto): Promise<AddExpenseAttachmentResponse> {
      const res = await api.post<ProjectExpenseAttachment>(
        `/projects/finance/expenses/${enc(expenseId)}/attachments`,
        dto
      );
      return ok(res.status, res.data);
    },

    async removeAttachment(attachmentId: string): Promise<RemoveExpenseAttachmentResponse> {
      const res = await api.delete<{ ok?: true }>(`/projects/finance/expenses/attachments/${enc(attachmentId)}`);
      return ok(res.status, res.data);
    },
  },
};
