export const workflowKeys = {
  all: ["workflows"] as const,
  list: () => [...workflowKeys.all, "list"] as const,
  byId: (id: string) => [...workflowKeys.all, "byId", id] as const,
};