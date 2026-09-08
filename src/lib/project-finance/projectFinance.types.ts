/** ----------------------------------------
 * Generic API envelope (same style you use)
 * --------------------------------------- */
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type Maybe<T> = T | null;

export type ListMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export interface PaginationDto {
  page?: number;
  pageSize?: number;
}

/** ----------------------------------------
 * Enums (FE-safe mirrors)
 * --------------------------------------- */
export type ProjectBudgetStatus = string; // DRAFT | SUBMITTED | APPROVED | REJECTED | ARCHIVED
export type ProjectExpenseStatus = string; // future (Batch 3)

/** ----------------------------------------
 * Entities
 * --------------------------------------- */
export interface ProjectBudget {
  id: string;
  tenantId?: string;
  projectId: string;

  name: string;
  description?: string | null;

  currency?: string | null;

  plannedAmountCents: number;
  approvedAmountCents?: number | null;

  periodStart?: string | null;
  periodEnd?: string | null;

  status?: ProjectBudgetStatus;

  decisionNote?: string | null;

  submittedAt?: string | null;
  decidedAt?: string | null;

  createdByUserId?: string | null;
  decidedByUserId?: string | null;

  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

export type FinanceSummary = {
  currency: string;

  approvedBudgetCents: number;
  approvedExpenseCents: number;
  paidExpenseCents: number;

  laborMinutes: number;
  laborCostCents: number | null;

  actualCostCents: number;
  remainingCents: number;
};

export interface ProjectFinanceActivity {
  id: string;
  action?: string;
  entityType?: string;
  entityId?: string | null;
  actorUserId?: string | null;
  actorMembershipId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  createdAt?: string;
  [key: string]: unknown;
}

export interface ProjectFinanceExport {
  generatedAt: string;
  project?: unknown;
  summary: FinanceSummary;
  budgets: ProjectBudget[];
  expenses: ProjectExpense[];
  activity: ProjectFinanceActivity[];
  report?: {
    budgetVsActualCents?: {
      approvedBudget?: number;
      actualCost?: number;
      remaining?: number;
    };
    counts?: Record<string, number>;
  };
}

/** ----------------------------------------
 * DTOs (Budgets)
 * --------------------------------------- */
export interface CreateProjectBudgetDto {
  name: string;
  description?: string;
  currency?: string;
  plannedAmountCents: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface UpdateProjectBudgetDto {
  name?: string;
  description?: string;

  plannedAmountCents?: number;
  approvedAmountCents?: number;

  status?: ProjectBudgetStatus;

  periodStart?: string;
  periodEnd?: string;

  decisionNote?: string;
}

export interface DecideBudgetDto {
  note?: string;
  approvedAmountCents?: number; // approve only
}

export interface ListProjectBudgetsFilterDto {
  status?: ProjectBudgetStatus;
  q?: string;
  includeDeleted?: boolean;
}

export type ProjectBudgetsQuery = ListProjectBudgetsFilterDto & PaginationDto;

/** ----------------------------------------
 * Responses
 * --------------------------------------- */
export type ListBudgetsResponse = ApiResponse<{ items: ProjectBudget[]; total: number; meta?: ListMeta } | ProjectBudget[]>;
export type GetBudgetResponse = ApiResponse<ProjectBudget>;
export type CreateBudgetResponse = ApiResponse<ProjectBudget>;
export type UpdateBudgetResponse = ApiResponse<ProjectBudget>;
export type SubmitBudgetResponse = ApiResponse<ProjectBudget | { ok?: true }>;
export type DecideBudgetResponse = ApiResponse<ProjectBudget | { ok?: true }>;
export type DeleteBudgetResponse = ApiResponse<{ ok?: true }>;
export type RestoreBudgetResponse = ApiResponse<ProjectBudget | { ok?: true }>;
export type MarkPaidExpenseResponse = ApiResponse<ProjectExpense>;
export type GetFinanceSummaryResponse = ApiResponse<FinanceSummary>;
export type GetFinanceActivityResponse = ApiResponse<ProjectFinanceActivity[]>;
export type GetFinanceExportResponse = ApiResponse<ProjectFinanceExport>;



export type FileProvider = string; // CLOUDINARY | S3 | LOCAL

export interface FileEntity {
  id: string;
  provider?: FileProvider;
  url?: string | null;
  bucket?: string | null;
  key?: string | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface ProjectExpenseAttachment {
  id: string;
  expenseId: string;
  fileId: string;
  createdAt?: string;
  file?: FileEntity | null;
  [key: string]: unknown;
}

export interface ProjectExpense {
  id: string;
  tenantId?: string;
  projectId: string;

  title: string;
  description?: string | null;

  currency?: string | null;
  amountCents: number;

  spentAt?: string | null;

  status?: ProjectExpenseStatus; // DRAFT | SUBMITTED | APPROVED | REJECTED | PAID | CANCELED

  decisionNote?: string | null;
  submittedAt?: string | null;
  decidedAt?: string | null;

  createdByUserId?: string | null;
  decidedByUserId?: string | null;

  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  attachments?: ProjectExpenseAttachment[];

  [key: string]: unknown;
}

/** ----------------------------------------
 * DTOs (Expenses)
 * --------------------------------------- */
export interface CreateProjectExpenseDto {
  title: string;
  description?: string;

  currency?: string;
  amountCents: number;

  spentAt?: string; // ISO date string or datetime; backend accepts string
}

export interface UpdateProjectExpenseDto {
  title?: string;
  description?: string;

  currency?: string;
  amountCents?: number;

  spentAt?: string;

  status?: ProjectExpenseStatus;
  decisionNote?: string;
}

export interface DecideExpenseDto {
  note?: string;
}

export interface AddExpenseAttachmentDto {
  fileId: string;
}

export interface ListProjectExpensesFilterDto {
  status?: ProjectExpenseStatus;
  q?: string;
  from?: string; // ISO date
  to?: string;   // ISO date
  includeDeleted?: boolean;
}

export type ProjectExpensesQuery = ListProjectExpensesFilterDto & PaginationDto;

/** ----------------------------------------
 * Expense Responses
 * --------------------------------------- */
export type ListExpensesResponse = ApiResponse<
  { items: ProjectExpense[]; total: number; meta?: ListMeta } | ProjectExpense[]
>;
export type GetExpenseResponse = ApiResponse<ProjectExpense>;
export type CreateExpenseResponse = ApiResponse<ProjectExpense>;
export type UpdateExpenseResponse = ApiResponse<ProjectExpense>;
export type SubmitExpenseResponse = ApiResponse<ProjectExpense | { ok?: true }>;
export type DecideExpenseResponse = ApiResponse<ProjectExpense | { ok?: true }>;
export type DeleteExpenseResponse = ApiResponse<{ ok?: true }>;
export type RestoreExpenseResponse = ApiResponse<ProjectExpense | { ok?: true }>;
export type AddExpenseAttachmentResponse = ApiResponse<ProjectExpenseAttachment>;
export type RemoveExpenseAttachmentResponse = ApiResponse<{ ok?: true }>;
