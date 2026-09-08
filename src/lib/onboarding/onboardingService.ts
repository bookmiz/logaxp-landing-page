// src/lib/onboarding/onboardingService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  // DTOs
  TemplateListFilterDto,
  CreateOnboardingTemplateDto,
  UpdateOnboardingTemplateDto,


  CreateOnboardingStepDto,
  UpdateOnboardingStepDto,
  ReorderStepsDto,

  OnboardingInstanceFilterDto,
  CreateOnboardingInstanceDto,
  StartOnboardingInstanceDto,
  CompleteOnboardingInstanceDto,
  CancelOnboardingInstanceDto,

  AssignStepDto,
  CompleteStepDto,
  SkipStepDto,
  BlockStepDto,
  UploadStepDocumentDto,

  // Responses
  ListOnboardingTemplatesResponse,
  GetOnboardingTemplateResponse,
  CreateOnboardingTemplateResponse,
  UpdateOnboardingTemplateResponse,
  RemoveOnboardingTemplateResponse,

  ListOnboardingStepsResponse,
  CreateOnboardingStepResponse,
  UpdateOnboardingStepResponse,
  ReorderOnboardingStepResponse,
  RemoveOnboardingStepResponse,

  ListOnboardingInstancesResponse,
  GetOnboardingInstanceResponse,
  CreateOnboardingInstanceResponse,
  StartOnboardingInstanceResponse,
  CompleteOnboardingInstanceResponse,
  CancelOnboardingInstanceResponse,

  GetOnboardingStepInstanceResponse,
  AssignOnboardingStepInstanceResponse,
  CompleteOnboardingStepInstanceResponse,
  SkipOnboardingStepInstanceResponse,
  BlockOnboardingStepInstanceResponse,
  UnblockOnboardingStepInstanceResponse,
  UploadOnboardingStepDocumentResponse,
} from "./onboarding.types";
import { ListOnboardingStepInstancesResponse } from "../orgStructure/orgStructure.types";

function cleanParams<T extends object = Record<string, unknown>>(obj?: T): Record<string, unknown> | undefined {
  if (!obj) return undefined;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

export const onboardingService = {
  /* =========================================
   * Templates
   * ======================================= */

 async listTemplates(filter?: TemplateListFilterDto) {
  const params: Partial<TemplateListFilterDto> | undefined = cleanParams(filter);

  // ✅ only send when true
  if (params?.includeInactive === false) delete params.includeInactive;

  const res = await api.get("/onboarding/templates", { params });
  return res.data;
},

  async getTemplate(id: string): Promise<GetOnboardingTemplateResponse> {
    const res = await api.get<GetOnboardingTemplateResponse>(`/onboarding/templates/${enc(id)}`);
    return res.data;
  },

  async createTemplate(dto: CreateOnboardingTemplateDto): Promise<CreateOnboardingTemplateResponse> {
    const res = await api.post<CreateOnboardingTemplateResponse>("/onboarding/templates", dto);
    return res.data;
  },

  async updateTemplate(id: string, dto: UpdateOnboardingTemplateDto): Promise<UpdateOnboardingTemplateResponse> {
    const res = await api.patch<UpdateOnboardingTemplateResponse>(`/onboarding/templates/${enc(id)}`, dto);
    return res.data;
  },

  async removeTemplate(id: string): Promise<RemoveOnboardingTemplateResponse> {
    const res = await api.delete<RemoveOnboardingTemplateResponse>(`/onboarding/templates/${enc(id)}`);
    return res.data;
  },

  /* =========================================
   * Template Steps
   * Routes live under /onboarding/templates...
   * ======================================= */

  async listSteps(templateId: string): Promise<ListOnboardingStepsResponse> {
    const res = await api.get<ListOnboardingStepsResponse>(
      `/onboarding/templates/${enc(templateId)}/steps`
    );
    return res.data;
  },

  async createStep(
    templateId: string,
    dto: CreateOnboardingStepDto
  ): Promise<CreateOnboardingStepResponse> {
    const res = await api.post<CreateOnboardingStepResponse>(
      `/onboarding/templates/${enc(templateId)}/steps`,
      dto
    );
    return res.data;
  },

  async updateStep(stepId: string, dto: UpdateOnboardingStepDto): Promise<UpdateOnboardingStepResponse> {
    const res = await api.patch<UpdateOnboardingStepResponse>(
      `/onboarding/templates/steps/${enc(stepId)}`,
      dto
    );
    return res.data;
  },

  async reorderStep(stepId: string, dto: ReorderStepsDto): Promise<ReorderOnboardingStepResponse> {
    const res = await api.patch<ReorderOnboardingStepResponse>(
      `/onboarding/templates/steps/${enc(stepId)}/reorder`,
      dto
    );
    return res.data;
  },

    // List step instances for an onboarding instance (enterprise: detail screen always uses this)
  async listStepInstances(instanceId: string): Promise<ListOnboardingStepInstancesResponse> {
    const res = await api.get<ListOnboardingStepInstancesResponse>(
      `/onboarding/instances/${enc(instanceId)}/step-instances`
    );
    return res.data;
  },

  async removeStep(stepId: string): Promise<RemoveOnboardingStepResponse> {
    const res = await api.delete<RemoveOnboardingStepResponse>(
      `/onboarding/templates/steps/${enc(stepId)}`
    );
    return res.data;
  },

  /* =========================================
   * Onboarding Instances
   * ======================================= */

  async listInstances(filter?: OnboardingInstanceFilterDto): Promise<ListOnboardingInstancesResponse> {
    const res = await api.get<ListOnboardingInstancesResponse>("/onboarding/instances", {
      params: cleanParams(filter),
    });
    return res.data;
  },

  async getInstance(id: string): Promise<GetOnboardingInstanceResponse> {
    const res = await api.get<GetOnboardingInstanceResponse>(`/onboarding/instances/${enc(id)}`);
    return res.data;
  },

  async createInstance(dto: CreateOnboardingInstanceDto): Promise<CreateOnboardingInstanceResponse> {
    const res = await api.post<CreateOnboardingInstanceResponse>("/onboarding/instances", dto);
    return res.data;
  },

  async startInstance(
    id: string,
    dto: StartOnboardingInstanceDto = {}
  ): Promise<StartOnboardingInstanceResponse> {
    const res = await api.post<StartOnboardingInstanceResponse>(
      `/onboarding/instances/${enc(id)}/start`,
      dto
    );
    return res.data;
  },

  async completeInstance(
    id: string,
    dto: CompleteOnboardingInstanceDto = {}
  ): Promise<CompleteOnboardingInstanceResponse> {
    const res = await api.post<CompleteOnboardingInstanceResponse>(
      `/onboarding/instances/${enc(id)}/complete`,
      dto
    );
    return res.data;
  },

  async cancelInstance(
    id: string,
    dto: CancelOnboardingInstanceDto = {}
  ): Promise<CancelOnboardingInstanceResponse> {
    const res = await api.post<CancelOnboardingInstanceResponse>(
      `/onboarding/instances/${enc(id)}/cancel`,
      dto
    );
    return res.data;
  },

  /* =========================================
   * Onboarding Step Instances
   * ======================================= */

  async getStepInstance(id: string): Promise<GetOnboardingStepInstanceResponse> {
    const res = await api.get<GetOnboardingStepInstanceResponse>(`/onboarding/step-instances/${enc(id)}`);
    return res.data;
  },

  async assignStepInstance(
    id: string,
    dto: AssignStepDto
  ): Promise<AssignOnboardingStepInstanceResponse> {
    const res = await api.post<AssignOnboardingStepInstanceResponse>(
      `/onboarding/step-instances/${enc(id)}/assign`,
      dto
    );
    return res.data;
  },

  async completeStepInstance(
    id: string,
    dto: CompleteStepDto
  ): Promise<CompleteOnboardingStepInstanceResponse> {
    const res = await api.post<CompleteOnboardingStepInstanceResponse>(
      `/onboarding/step-instances/${enc(id)}/complete`,
      dto
    );
    return res.data;
  },

  async skipStepInstance(id: string, dto: SkipStepDto = {}): Promise<SkipOnboardingStepInstanceResponse> {
    const res = await api.post<SkipOnboardingStepInstanceResponse>(
      `/onboarding/step-instances/${enc(id)}/skip`,
      dto
    );
    return res.data;
  },

  async blockStepInstance(id: string, dto: BlockStepDto): Promise<BlockOnboardingStepInstanceResponse> {
    const res = await api.post<BlockOnboardingStepInstanceResponse>(
      `/onboarding/step-instances/${enc(id)}/block`,
      dto
    );
    return res.data;
  },

  async unblockStepInstance(id: string): Promise<UnblockOnboardingStepInstanceResponse> {
    const res = await api.post<UnblockOnboardingStepInstanceResponse>(
      `/onboarding/step-instances/${enc(id)}/unblock`
    );
    return res.data;
  },

  async uploadStepDocument(
    id: string,
    dto: UploadStepDocumentDto
  ): Promise<UploadOnboardingStepDocumentResponse> {
    const res = await api.post<UploadOnboardingStepDocumentResponse>(
      `/onboarding/step-instances/${enc(id)}/upload`,
      dto
    );
    return res.data;
  },
};