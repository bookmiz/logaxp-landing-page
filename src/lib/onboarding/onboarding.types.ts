// src/lib/onboarding/onboarding.types.ts

/** ----------------------------------------
 * Generic API envelope (adjust if your backend differs)
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

export type ListData<T> =
  | T[]
  | {
      items: T[];
      meta?: ListMeta;
      [key: string]: unknown;
    };

/** ----------------------------------------
 * Common domain entities (frontend-facing)
 * NOTE: keep flexible because backend exact shapes may vary
 * --------------------------------------- */
export interface OnboardingTemplate {
  id: string;
  name: string;
  description?: string | null;
  metadata?: unknown;
  isActive?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface OnboardingStep {
  id: string;
  templateId?: string;
  order?: number;
  key?: string;
  code?: string;
  title?: string;
  name?: string;
  description?: string | null;
  kind?: string;
  type?: string;
  required?: boolean;
  dueDays?: number | null;
  config?: unknown;
  metadata?: unknown;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface OnboardingInstance {
  id: string;
  employeeId?: string;
  templateId?: string;
  status?: string;
  startedByUserId?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  metadata?: unknown;
  reason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface OnboardingStepInstance {
  id: string;
  onboardingInstanceId?: string;
  onboardingStepId?: string;
  status?: string;
  assignedToUserId?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  completedByUserId?: string | null;
  completedByMembershipId?: string | null;
  notes?: string | null;
  data?: unknown;
  blockedReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** ----------------------------------------
 * DTOs from backend (copied/aligned with your controllers)
 * --------------------------------------- */

// Templates
export interface CreateOnboardingTemplateDto {
  name: string;
  description?: string | null;
  metadata?: unknown;
  isActive?: boolean;
  version?: number;
}

export interface UpdateOnboardingTemplateDto {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  metadata?: unknown;
}

export interface TemplateListFilterDto {
  includeInactive?: boolean;
  q?: string;
}

// Steps (backend DTO shape not fully pasted, so keep flexible)
export interface CreateOnboardingStepDto {
  title?: string;
  name?: string;
  description?: string | null;
  type?: string;
  kind?: string;
  required?: boolean;
  order?: number;
  dueDays?: number | null;
  metadata?: unknown;
  config?: unknown;
  [key: string]: unknown;
}

export interface UpdateOnboardingStepDto extends Partial<CreateOnboardingStepDto> {
    title?: string;
    name?: string;
    description?: string | null;
    type?: string;
    kind?: string;
    required?: boolean;
    order?: number;
    dueDays?: number | null;
    metadata?: unknown;
    config?: unknown;
}

export interface ReorderStepsDto {
  order: number;
}

// Step instance actions
export interface AssignStepDto {
  assignedToUserId?: string | null;
  dueAt?: string | null; // ISO string
}

export interface CompleteStepDto {
  completedByUserId?: string;
  completedByMembershipId?: string;
  data?: unknown;
  notes?: string | null;
}

export interface SkipStepDto {
  reason?: string | null;
}

export interface BlockStepDto {
  reason: string;
}

export interface UploadStepDocumentDto {
  fileId: string;
  title?: string | null;
}

// Instances
export interface CreateOnboardingInstanceDto {
  employeeId: string;
  templateId: string;
  startedByUserId?: string;
}

export interface StartOnboardingInstanceDto {
  startedByUserId?: string;
}

export interface CompleteOnboardingInstanceDto {
  metadata?: unknown;
}

export interface CancelOnboardingInstanceDto {
  reason?: string | null;
}

export interface OnboardingInstanceFilterDto {
  employeeId?: string;
  status?: string;
}

/** ----------------------------------------
 * Response aliases
 * --------------------------------------- */

// Templates
export type ListOnboardingTemplatesResponse = ApiResponse<ListData<OnboardingTemplate>>;
export type GetOnboardingTemplateResponse = ApiResponse<OnboardingTemplate>;
export type CreateOnboardingTemplateResponse = ApiResponse<OnboardingTemplate>;
export type UpdateOnboardingTemplateResponse = ApiResponse<OnboardingTemplate>;
export type RemoveOnboardingTemplateResponse = ApiResponse<{ ok?: true } | OnboardingTemplate>;

// Steps
export type ListOnboardingStepsResponse = ApiResponse<ListData<OnboardingStep>>;
export type CreateOnboardingStepResponse = ApiResponse<OnboardingStep>;
export type UpdateOnboardingStepResponse = ApiResponse<OnboardingStep>;
export type ReorderOnboardingStepResponse = ApiResponse<OnboardingStep | { ok?: true }>;
export type RemoveOnboardingStepResponse = ApiResponse<{ ok?: true } | OnboardingStep>;

// Instances
export type ListOnboardingInstancesResponse = ApiResponse<ListData<OnboardingInstance>>;
export type GetOnboardingInstanceResponse = ApiResponse<OnboardingInstance>;
export type CreateOnboardingInstanceResponse = ApiResponse<OnboardingInstance>;
export type StartOnboardingInstanceResponse = ApiResponse<OnboardingInstance>;
export type CompleteOnboardingInstanceResponse = ApiResponse<OnboardingInstance>;
export type CancelOnboardingInstanceResponse = ApiResponse<OnboardingInstance>;

// Step Instances
export type GetOnboardingStepInstanceResponse = ApiResponse<OnboardingStepInstance>;
export type AssignOnboardingStepInstanceResponse = ApiResponse<OnboardingStepInstance>;
export type CompleteOnboardingStepInstanceResponse = ApiResponse<OnboardingStepInstance>;
export type SkipOnboardingStepInstanceResponse = ApiResponse<OnboardingStepInstance>;
export type BlockOnboardingStepInstanceResponse = ApiResponse<OnboardingStepInstance>;
export type UnblockOnboardingStepInstanceResponse = ApiResponse<OnboardingStepInstance>;
export type UploadOnboardingStepDocumentResponse = ApiResponse<OnboardingStepInstance>;