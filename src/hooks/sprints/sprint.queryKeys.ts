export const sprintKeys = {
  all: ["sprints"] as const,
  byProject: (projectId?: string) => [...sprintKeys.all, "byProject", projectId || "all"] as const,
  byId: (sprintId: string) => [...sprintKeys.all, "byId", sprintId] as const,
  boardView: (sprintId: string) => [...sprintKeys.byId(sprintId), "boardView"] as const,
  velocity: (projectId: string) => [...sprintKeys.all, "velocity", projectId] as const,
};
