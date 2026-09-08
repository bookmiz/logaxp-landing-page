"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type {
  CreateSprintDto,
  CreateSprintResponse,
  CloseSprintDto,
  UpdateSprintDto,
  UpdateSprintResponse,
  StartSprintResponse,
  CloseSprintResponse,
} from "@/logaxp/lib/project-management/projectManagement.types";
import { sprintKeys } from "./sprint.queryKeys";

export function useCreateSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation<CreateSprintResponse, unknown, CreateSprintDto>({
    mutationFn: (dto) => projectManagementService.sprints.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      await qc.invalidateQueries({ queryKey: sprintKeys.all });
    },
  });
}

export function useUpdateSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation<UpdateSprintResponse, unknown, { id: string; dto: UpdateSprintDto }>({
    mutationFn: ({ id, dto }) => projectManagementService.sprints.update(id, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      await qc.invalidateQueries({ queryKey: sprintKeys.all });
    },
  });
}

export function useStartSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation<StartSprintResponse, unknown, { id: string }>({
    mutationFn: ({ id }) => projectManagementService.sprints.start(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      await qc.invalidateQueries({ queryKey: sprintKeys.all });
    },
  });
}

export function useCloseSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation<CloseSprintResponse, unknown, { id: string; dto?: CloseSprintDto }>({
    mutationFn: ({ id, dto }) => projectManagementService.sprints.close(id, dto),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      await qc.invalidateQueries({ queryKey: sprintKeys.byId(vars.id) });
      await qc.invalidateQueries({ queryKey: sprintKeys.boardView(vars.id) });
      await qc.invalidateQueries({ queryKey: sprintKeys.velocity(projectId) });
      await qc.invalidateQueries({ queryKey: sprintKeys.all });
    },
  });
}
