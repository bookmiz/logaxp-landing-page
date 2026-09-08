export const scheduleKeys = {
  root: ["schedule"] as const,

  settings: () => [...scheduleKeys.root, "settings"] as const,

  templates: () => [...scheduleKeys.root, "templates"] as const,
  template: (id: string) => [...scheduleKeys.templates(), id] as const,

  assignments: (params?: Record<string, unknown>) => [...scheduleKeys.root, "assignments", params ?? {}] as const,

  shifts: (filter?: Record<string, unknown>) => [...scheduleKeys.root, "shifts", filter ?? {}] as const,
  shift: (id: string) => [...scheduleKeys.root, "shift", id] as const,

  conflicts: (dto?: Record<string, unknown>) => [...scheduleKeys.root, "conflicts", dto ?? {}] as const,
};