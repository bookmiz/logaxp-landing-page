// src/hooks/useOnboarding.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { onboardingService } from "@/logaxp/lib/onboarding/onboardingService";
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
} from "@/logaxp/lib/onboarding/onboarding.types";

type ApiErrorShape = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
  message?: unknown;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;

  if (err && typeof err === "object") {
    const e = err as ApiErrorShape;

    const apiMsg = e.response?.data?.message;

    if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;

    if (Array.isArray(apiMsg) && apiMsg.length > 0) {
      const firstString = apiMsg.find((x) => typeof x === "string");
      if (typeof firstString === "string" && firstString.trim()) return firstString;
    }

    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Something went wrong";
}

export function useOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  /* =========================================
   * Templates
   * ======================================= */

  const listTemplates = useCallback(
    (filter?: TemplateListFilterDto) => wrap(() => onboardingService.listTemplates(filter)),
    [wrap]
  );

  const getTemplate = useCallback(
    (id: string) => wrap(() => onboardingService.getTemplate(id)),
    [wrap]
  );

  const createTemplate = useCallback(
    (dto: CreateOnboardingTemplateDto) => wrap(() => onboardingService.createTemplate(dto)),
    [wrap]
  );

  const updateTemplate = useCallback(
    (id: string, dto: UpdateOnboardingTemplateDto) => wrap(() => onboardingService.updateTemplate(id, dto)),
    [wrap]
  );
    const listStepInstances = useCallback(
    (instanceId: string) => wrap(() => onboardingService.listStepInstances(instanceId)),
    [wrap]
  );

  const removeTemplate = useCallback(
    (id: string) => wrap(() => onboardingService.removeTemplate(id)),
    [wrap]
  );

  /* =========================================
   * Template Steps
   * ======================================= */

  const listSteps = useCallback(
    (templateId: string) => wrap(() => onboardingService.listSteps(templateId)),
    [wrap]
  );

  const createStep = useCallback(
    (templateId: string, dto: CreateOnboardingStepDto) => wrap(() => onboardingService.createStep(templateId, dto)),
    [wrap]
  );

  const updateStep = useCallback(
    (stepId: string, dto: UpdateOnboardingStepDto) => wrap(() => onboardingService.updateStep(stepId, dto)),
    [wrap]
  );

  const reorderStep = useCallback(
    (stepId: string, dto: ReorderStepsDto) => wrap(() => onboardingService.reorderStep(stepId, dto)),
    [wrap]
  );

  const removeStep = useCallback(
    (stepId: string) => wrap(() => onboardingService.removeStep(stepId)),
    [wrap]
  );

  /* =========================================
   * Instances
   * ======================================= */

  const listInstances = useCallback(
    (filter?: OnboardingInstanceFilterDto) => wrap(() => onboardingService.listInstances(filter)),
    [wrap]
  );

  const getInstance = useCallback(
    (id: string) => wrap(() => onboardingService.getInstance(id)),
    [wrap]
  );

  const createInstance = useCallback(
    (dto: CreateOnboardingInstanceDto) => wrap(() => onboardingService.createInstance(dto)),
    [wrap]
  );

  const startInstance = useCallback(
    (id: string, dto?: StartOnboardingInstanceDto) => wrap(() => onboardingService.startInstance(id, dto)),
    [wrap]
  );

  const completeInstance = useCallback(
    (id: string, dto?: CompleteOnboardingInstanceDto) => wrap(() => onboardingService.completeInstance(id, dto)),
    [wrap]
  );

  const cancelInstance = useCallback(
    (id: string, dto?: CancelOnboardingInstanceDto) => wrap(() => onboardingService.cancelInstance(id, dto)),
    [wrap]
  );

  /* =========================================
   * Step Instances
   * ======================================= */

  const getStepInstance = useCallback(
    (id: string) => wrap(() => onboardingService.getStepInstance(id)),
    [wrap]
  );

  const assignStepInstance = useCallback(
    (id: string, dto: AssignStepDto) => wrap(() => onboardingService.assignStepInstance(id, dto)),
    [wrap]
  );

  const completeStepInstance = useCallback(
    (id: string, dto: CompleteStepDto) => wrap(() => onboardingService.completeStepInstance(id, dto)),
    [wrap]
  );

  const skipStepInstance = useCallback(
    (id: string, dto?: SkipStepDto) => wrap(() => onboardingService.skipStepInstance(id, dto)),
    [wrap]
  );

  const blockStepInstance = useCallback(
    (id: string, dto: BlockStepDto) => wrap(() => onboardingService.blockStepInstance(id, dto)),
    [wrap]
  );

  const unblockStepInstance = useCallback(
    (id: string) => wrap(() => onboardingService.unblockStepInstance(id)),
    [wrap]
  );

  const uploadStepDocument = useCallback(
    (id: string, dto: UploadStepDocumentDto) => wrap(() => onboardingService.uploadStepDocument(id, dto)),
    [wrap]
  );

  /* =========================================
   * Grouped API surfaces (nice DX)
   * ======================================= */

  const templates = useMemo(
    () => ({
      list: listTemplates,
      get: getTemplate,
      create: createTemplate,
      update: updateTemplate,
      remove: removeTemplate,
    }),
    [listTemplates, getTemplate, createTemplate, updateTemplate, removeTemplate]
  );

  const steps = useMemo(
    () => ({
      list: listSteps,
      create: createStep,
      update: updateStep,
      reorder: reorderStep,
      remove: removeStep,
    }),
    [listSteps, createStep, updateStep, reorderStep, removeStep]
  );

  const instances = useMemo(
    () => ({
      list: listInstances,
      get: getInstance,
      create: createInstance,
      start: startInstance,
      complete: completeInstance,
      cancel: cancelInstance,
    }),
    [listInstances, getInstance, createInstance, startInstance, completeInstance, cancelInstance]
  );

    const stepInstances = useMemo(
    () => ({
      list: listStepInstances,
      get: getStepInstance,
      assign: assignStepInstance,
      complete: completeStepInstance,
      skip: skipStepInstance,
      block: blockStepInstance,
      unblock: unblockStepInstance,
      upload: uploadStepDocument,
    }),
    [
      listStepInstances,
      getStepInstance,
      assignStepInstance,
      completeStepInstance,
      skipStepInstance,
      blockStepInstance,
      unblockStepInstance,
      uploadStepDocument,
    ]
  );
  return {
    loading,
    error,
    clearError,
    wrap,

    // grouped surfaces
    templates,
    steps,
    instances,
    stepInstances,

    // flat methods (optional convenience)
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    removeTemplate,

    listSteps,
    createStep,
    updateStep,
    reorderStep,
    removeStep,

    listInstances,
    getInstance,
    createInstance,
    startInstance,
    completeInstance,
    cancelInstance,

    getStepInstance,
    assignStepInstance,
    completeStepInstance,
    skipStepInstance,
    blockStepInstance,
    unblockStepInstance,
    uploadStepDocument,
  };
}