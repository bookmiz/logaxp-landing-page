"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type {
  CreateBoardDto,
  CreateBoardResponse,
  UpdateBoardDto,
  UpdateBoardResponse,
  SoftDeleteBoardResponse,
  RestoreBoardResponse,
} from "@/logaxp/lib/project-management/projectManagement.types";
import { boardKeys } from "./board.queryKeys";

export function useCreateBoard(projectId: string) {
  const qc = useQueryClient();
  return useMutation<CreateBoardResponse, unknown, CreateBoardDto>({
    mutationFn: (dto) => projectManagementService.boards.create(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: boardKeys.listByProject(projectId) as any });
      await qc.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useUpdateBoard(projectId: string) {
  const qc = useQueryClient();
  return useMutation<UpdateBoardResponse, unknown, { id: string; dto: UpdateBoardDto }>({
    mutationFn: ({ id, dto }) => projectManagementService.boards.update(id, dto),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: boardKeys.byId(vars.id) });
      await qc.invalidateQueries({ queryKey: boardKeys.listByProject(projectId) as any });
    },
  });
}

export function useDeleteBoard(projectId: string) {
  const qc = useQueryClient();
  return useMutation<SoftDeleteBoardResponse, unknown, { id: string }>({
    mutationFn: ({ id }) => projectManagementService.boards.softDelete(id),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: boardKeys.byId(vars.id) });
      await qc.invalidateQueries({ queryKey: boardKeys.listByProject(projectId) as any });
    },
  });
}

export function useRestoreBoard(projectId: string) {
  const qc = useQueryClient();
  return useMutation<RestoreBoardResponse, unknown, { id: string }>({
    mutationFn: ({ id }) => projectManagementService.boards.restore(id),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: boardKeys.byId(vars.id) });
      await qc.invalidateQueries({ queryKey: boardKeys.listByProject(projectId) as any });
      await qc.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
