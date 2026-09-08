import type { ProjectListQuery } from "@/logaxp/lib/project-management/projectManagement.types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (query?: ProjectListQuery) => [...projectKeys.all, "list", query ?? {}] as const,
  byId: (id: string) => [...projectKeys.all, "byId", id] as const,
  summary: (id: string) => [...projectKeys.all, "summary", id] as const,
  activity: (id: string) => [...projectKeys.all, "activity", id] as const,
  members: (projectId: string) => [...projectKeys.all, "members", projectId] as const,
};
