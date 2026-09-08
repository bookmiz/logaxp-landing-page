import type { PaginationDto } from "@/logaxp/lib/project-management/projectManagement.types";

export const boardKeys = {
  all: ["boards"] as const,
  listByProject: (projectId: string, query?: PaginationDto) =>
    [...boardKeys.all, "listByProject", projectId, query ?? {}] as const,
  byId: (id: string) => [...boardKeys.all, "byId", id] as const,
  columns: (boardId: string) => [...boardKeys.all, "columns", boardId] as const,
};