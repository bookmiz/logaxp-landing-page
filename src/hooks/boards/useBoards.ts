"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { ListBoardsResponse, PaginationDto } from "@/logaxp/lib/project-management/projectManagement.types";
import { boardKeys } from "./board.queryKeys";

export function useBoards(projectId: string, query?: PaginationDto) {
  return useQuery<ListBoardsResponse>({
    queryKey: boardKeys.listByProject(projectId, query),
    queryFn: async () => projectManagementService.boards.listByProject(projectId),
    enabled: Boolean(projectId),
  });
}