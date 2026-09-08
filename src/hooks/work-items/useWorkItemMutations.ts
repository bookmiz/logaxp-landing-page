"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type {
  CreateWorkItemDto,
  CreateWorkItemResponse,
  UpdateWorkItemDto,
  UpdateWorkItemResponse,
  SoftDeleteWorkItemResponse,
  RestoreWorkItemResponse,
  BulkUpdateWorkItemsDto,
  BulkUpdateWorkItemsResponse,
  AddWorkItemCommentResponse,
  AttachWorkItemLabelResponse,
  CreateLabelDto,
  CreateLabelResponse,
  CreateWorkItemRelationDto,
  CreateWorkItemRelationResponse,
  DeleteWorkItemCommentResponse,
  DeleteWorkItemRelationResponse,
  DetachWorkItemLabelResponse,
} from "@/logaxp/lib/project-management/projectManagement.types";
import { workItemKeys } from "./workItem.queryKeys";

export function useCreateWorkItem() {
  const qc = useQueryClient();
  return useMutation<CreateWorkItemResponse, unknown, CreateWorkItemDto>({
    mutationFn: (dto) => projectManagementService.workItems.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: workItemKeys.all });
    },
  });
}

export function useUpdateWorkItem() {
  const qc = useQueryClient();
  return useMutation<UpdateWorkItemResponse, unknown, { id: string; dto: UpdateWorkItemDto }>({
    mutationFn: ({ id, dto }) => projectManagementService.workItems.update(id, dto),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.all });
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.id) });
    },
  });
}

export function useSoftDeleteWorkItem() {
  const qc = useQueryClient();
  return useMutation<SoftDeleteWorkItemResponse, unknown, { id: string }>({
    mutationFn: ({ id }) => projectManagementService.workItems.softDelete(id),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.all });
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.id) });
    },
  });
}

export function useRestoreWorkItem() {
  const qc = useQueryClient();
  return useMutation<RestoreWorkItemResponse, unknown, { id: string }>({
    mutationFn: ({ id }) => projectManagementService.workItems.restore(id),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.all });
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.id) });
    },
  });
}

export function useBulkUpdateWorkItems() {
  const qc = useQueryClient();
  return useMutation<BulkUpdateWorkItemsResponse, unknown, BulkUpdateWorkItemsDto>({
    mutationFn: (dto) => projectManagementService.workItems.bulkUpdate(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: workItemKeys.all });
    },
  });
}

export function useCreateWorkItemLabel() {
  const qc = useQueryClient();
  return useMutation<CreateLabelResponse, unknown, CreateLabelDto>({
    mutationFn: (dto) => projectManagementService.workItems.createLabel(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: workItemKeys.labels() });
    },
  });
}

export function useAddWorkItemComment() {
  const qc = useQueryClient();
  return useMutation<AddWorkItemCommentResponse, unknown, { workItemId: string; body: string }>({
    mutationFn: ({ workItemId, body }) => projectManagementService.workItems.addComment(workItemId, { body }),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.activity(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.all });
    },
  });
}

export function useDeleteWorkItemComment() {
  const qc = useQueryClient();
  return useMutation<DeleteWorkItemCommentResponse, unknown, { workItemId: string; commentId: string }>({
    mutationFn: ({ workItemId, commentId }) => projectManagementService.workItems.deleteComment(workItemId, commentId),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.activity(vars.workItemId) });
    },
  });
}

export function useAttachWorkItemLabel() {
  const qc = useQueryClient();
  return useMutation<AttachWorkItemLabelResponse, unknown, { workItemId: string; labelId: string }>({
    mutationFn: ({ workItemId, labelId }) => projectManagementService.workItems.attachLabel(workItemId, labelId),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.activity(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.all });
    },
  });
}

export function useDetachWorkItemLabel() {
  const qc = useQueryClient();
  return useMutation<DetachWorkItemLabelResponse, unknown, { workItemId: string; labelId: string }>({
    mutationFn: ({ workItemId, labelId }) => projectManagementService.workItems.detachLabel(workItemId, labelId),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.activity(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.all });
    },
  });
}

export function useCreateWorkItemRelation() {
  const qc = useQueryClient();
  return useMutation<
    CreateWorkItemRelationResponse,
    unknown,
    { workItemId: string; dto: Omit<CreateWorkItemRelationDto, "fromId"> }
  >({
    mutationFn: ({ workItemId, dto }) => projectManagementService.workItems.createRelation(workItemId, dto),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.activity(vars.workItemId) });
    },
  });
}

export function useDeleteWorkItemRelation() {
  const qc = useQueryClient();
  return useMutation<DeleteWorkItemRelationResponse, unknown, { workItemId: string; relationId: string }>({
    mutationFn: ({ workItemId, relationId }) => projectManagementService.workItems.deleteRelation(workItemId, relationId),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: workItemKeys.byId(vars.workItemId) });
      await qc.invalidateQueries({ queryKey: workItemKeys.activity(vars.workItemId) });
    },
  });
}
