import type { WorkItemListQuery } from "@/logaxp/lib/project-management/projectManagement.types";

export const workItemKeys = {
  all: ["work-items"] as const,
  list: (query?: WorkItemListQuery) => [...workItemKeys.all, "list", query ?? {}] as const,
  byId: (id: string) => [...workItemKeys.all, "byId", id] as const,
  labels: () => [...workItemKeys.all, "labels"] as const,
  activity: (id: string) => [...workItemKeys.all, "activity", id] as const,
};
