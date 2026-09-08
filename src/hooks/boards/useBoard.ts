"use client";

import { useQuery } from "@tanstack/react-query";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { GetBoardResponse } from "@/logaxp/lib/project-management/projectManagement.types";
import { boardKeys } from "./board.queryKeys";

export function useBoard(id: string) {
  return useQuery<GetBoardResponse>({
    queryKey: boardKeys.byId(id),
    queryFn: async () => projectManagementService.boards.get(id),
    enabled: Boolean(id),
  });
}