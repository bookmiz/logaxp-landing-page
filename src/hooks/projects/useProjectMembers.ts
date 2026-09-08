"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type {
  ListProjectMembersResponse,
  AddProjectMemberDto,
  AddProjectMemberResponse,
  ChangeProjectMemberRoleDto,
  ChangeProjectMemberRoleResponse,
  TransferProjectOwnerResponse,
  RemoveProjectMemberResponse,
} from "@/logaxp/lib/project-management/projectManagement.types";
import { projectKeys } from "./project.queryKeys";

export function useProjectMembers(projectId: string) {
  return useQuery<ListProjectMembersResponse>({
    queryKey: projectKeys.members(projectId),
    queryFn: () => projectManagementService.projectMembers.list(projectId),
    enabled: Boolean(projectId),
  });
}

export function useAddProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation<AddProjectMemberResponse, unknown, AddProjectMemberDto>({
    mutationFn: (dto) => projectManagementService.projectMembers.add(projectId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}

export function useChangeProjectMemberRole(projectId: string) {
  const qc = useQueryClient();
  return useMutation<
    ChangeProjectMemberRoleResponse,
    unknown,
    { projectMemberId: string; dto: ChangeProjectMemberRoleDto }
  >({
    mutationFn: ({ projectMemberId, dto }) =>
      projectManagementService.projectMembers.changeRole(projectMemberId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}

export function useTransferProjectOwner(projectId: string) {
  const qc = useQueryClient();
  return useMutation<TransferProjectOwnerResponse, unknown, { projectMemberId: string }>({
    mutationFn: ({ projectMemberId }) =>
      projectManagementService.projectMembers.transferOwner(projectId, projectMemberId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      await qc.invalidateQueries({ queryKey: projectKeys.byId(projectId) });
      await qc.invalidateQueries({ queryKey: projectKeys.activity(projectId) });
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation<RemoveProjectMemberResponse, unknown, { projectMemberId: string }>({
    mutationFn: ({ projectMemberId }) =>
      projectManagementService.projectMembers.remove(projectMemberId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}
