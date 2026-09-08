"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type {
  CreateProjectDto,
  UpdateProjectDto,
  CreateProjectResponse,
  UpdateProjectResponse,
  ArchiveProjectResponse,
  RestoreProjectResponse,
  SoftDeleteProjectResponse,
} from "@/logaxp/lib/project-management/projectManagement.types";
import { projectKeys } from "./project.queryKeys";

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation<CreateProjectResponse, unknown, CreateProjectDto>({
    mutationFn: (dto) => projectManagementService.projects.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation<
    UpdateProjectResponse,
    unknown,
    { id: string; dto: UpdateProjectDto }
  >({
    mutationFn: ({ id, dto }) => projectManagementService.projects.update(id, dto),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.all });
      await qc.invalidateQueries({ queryKey: projectKeys.byId(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.summary(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.activity(vars.id) });
    },
  });
}

export function useArchiveProject() {
  const qc = useQueryClient();
  return useMutation<ArchiveProjectResponse, unknown, { id: string }>({
    mutationFn: ({ id }) => projectManagementService.projects.archive(id),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.all });
      await qc.invalidateQueries({ queryKey: projectKeys.byId(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.summary(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.activity(vars.id) });
    },
  });
}

export function useRestoreProject() {
  const qc = useQueryClient();
  return useMutation<RestoreProjectResponse, unknown, { id: string }>({
    mutationFn: ({ id }) => projectManagementService.projects.restore(id),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.all });
      await qc.invalidateQueries({ queryKey: projectKeys.byId(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.summary(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.activity(vars.id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation<SoftDeleteProjectResponse, unknown, { id: string }>({
    mutationFn: ({ id }) => projectManagementService.projects.softDelete(id),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.all });
      await qc.invalidateQueries({ queryKey: projectKeys.byId(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.summary(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.activity(vars.id) });
    },
  });
}
