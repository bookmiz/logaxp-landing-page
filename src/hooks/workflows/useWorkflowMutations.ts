"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type {
  CreateWorkflowDto,
  CreateWorkflowResponse,
  CloneWorkflowDto,
  CloneWorkflowResponse,
  RenameWorkflowDto,
  RenameWorkflowResponse,
  SetDefaultWorkflowResponse,
  CreateWorkflowStatusDto,
  AddWorkflowStatusResponse,
  ReorderWorkflowStatusesItemDto,
  ReorderWorkflowStatusesResponse,
  DeleteWorkflowStatusResponse,
} from "@/logaxp/lib/project-management/projectManagement.types";
import { workflowKeys } from "./workflow.queryKeys";

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation<CreateWorkflowResponse, unknown, CreateWorkflowDto>({
    mutationFn: (dto) => projectManagementService.workflows.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: workflowKeys.all });
    },
  });
}

export function useCloneWorkflow() {
  const qc = useQueryClient();
  return useMutation<CloneWorkflowResponse, unknown, { workflowId: string; dto?: CloneWorkflowDto }>({
    mutationFn: ({ workflowId, dto }) => projectManagementService.workflows.clone(workflowId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: workflowKeys.all });
    },
  });
}

export function useRenameWorkflow() {
  const qc = useQueryClient();
  return useMutation<RenameWorkflowResponse, unknown, { workflowId: string; dto: RenameWorkflowDto }>({
    mutationFn: ({ workflowId, dto }) => projectManagementService.workflows.rename(workflowId, dto),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workflowKeys.all });
      await qc.invalidateQueries({ queryKey: workflowKeys.byId(vars.workflowId) });
    },
  });
}

export function useSetDefaultWorkflow() {
  const qc = useQueryClient();
  return useMutation<SetDefaultWorkflowResponse, unknown, { workflowId: string }>({
    mutationFn: ({ workflowId }) => projectManagementService.workflows.setDefault(workflowId),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workflowKeys.all });
      await qc.invalidateQueries({ queryKey: workflowKeys.byId(vars.workflowId) });
    },
  });
}

export function useAddWorkflowStatus() {
  const qc = useQueryClient();
  return useMutation<
    AddWorkflowStatusResponse,
    unknown,
    { workflowId: string; dto: CreateWorkflowStatusDto }
  >({
    mutationFn: ({ workflowId, dto }) => projectManagementService.workflows.addStatus(workflowId, dto),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workflowKeys.all });
      await qc.invalidateQueries({ queryKey: workflowKeys.byId(vars.workflowId) });
    },
  });
}

export function useReorderWorkflowStatuses() {
  const qc = useQueryClient();
  return useMutation<
    ReorderWorkflowStatusesResponse,
    unknown,
    { workflowId: string; items: ReorderWorkflowStatusesItemDto[] }
  >({
    mutationFn: ({ workflowId, items }) => projectManagementService.workflows.reorderStatuses(workflowId, items),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workflowKeys.all });
      await qc.invalidateQueries({ queryKey: workflowKeys.byId(vars.workflowId) });
    },
  });
}

export function useDeleteWorkflowStatus() {
  const qc = useQueryClient();
  return useMutation<DeleteWorkflowStatusResponse, unknown, { workflowId: string; statusId: string }>({
    mutationFn: ({ statusId }) => projectManagementService.workflows.deleteStatus(statusId),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workflowKeys.all });
      await qc.invalidateQueries({ queryKey: workflowKeys.byId(vars.workflowId) });
    },
  });
}
