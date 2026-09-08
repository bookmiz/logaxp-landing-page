"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type {
  ListBoardColumnsResponse,
  CreateBoardColumnDto,
  CreateBoardColumnResponse,
  UpdateBoardColumnDto,
  UpdateBoardColumnResponse,
  RemoveBoardColumnResponse,
  ReorderBoardColumnsDto,
  ReorderBoardColumnsResponse,
} from "@/logaxp/lib/project-management/projectManagement.types";
import { boardKeys } from "./board.queryKeys";

export function useBoardColumns(boardId: string) {
  return useQuery<ListBoardColumnsResponse>({
    queryKey: boardKeys.columns(boardId),
    queryFn: async () => projectManagementService.boards.listColumns(boardId),
    enabled: Boolean(boardId),
  });
}

export function useCreateBoardColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation<CreateBoardColumnResponse, unknown, CreateBoardColumnDto>({
    mutationFn: (dto) => projectManagementService.boards.createColumn(boardId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: boardKeys.columns(boardId) });
    },
  });
}

export function useUpdateBoardColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation<UpdateBoardColumnResponse, unknown, { columnId: string; dto: UpdateBoardColumnDto }>({
    mutationFn: ({ columnId, dto }) => projectManagementService.boards.updateColumn(columnId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: boardKeys.columns(boardId) });
    },
  });
}

export function useRemoveBoardColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation<RemoveBoardColumnResponse, unknown, { columnId: string }>({
    mutationFn: ({ columnId }) => projectManagementService.boards.removeColumn(columnId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: boardKeys.columns(boardId) });
    },
  });
}

export function useReorderBoardColumns(boardId: string) {
  const qc = useQueryClient();
  return useMutation<ReorderBoardColumnsResponse, unknown, ReorderBoardColumnsDto>({
    mutationFn: (dto) => projectManagementService.boards.reorderColumns(boardId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: boardKeys.columns(boardId) });
    },
  });
}