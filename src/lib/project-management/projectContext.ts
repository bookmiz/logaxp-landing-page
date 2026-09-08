"use client";

import type { Project } from "./projectManagement.types";

export const ACTIVE_PROJECT_KEY = "logaxp.activeProject";

export type ActiveProjectContext = {
  id: string;
  name?: string;
  key?: string;
};

export function normalizeProjectId(value: unknown) {
  const next = String(value ?? "").trim();
  if (!next || next === "undefined" || next === "null") return "";
  return next;
}

export function withProjectId(path: string, projectId?: unknown) {
  const id = normalizeProjectId(projectId);
  if (!id) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}projectId=${encodeURIComponent(id)}`;
}

export function projectScopedHref(path: string, projectId?: unknown) {
  const id = normalizeProjectId(projectId);
  if (!id) return path;
  if (path.includes("[projectId]")) return path.replace("[projectId]", encodeURIComponent(id));
  return withProjectId(path, id);
}

export function projectFromEntity(project?: Project | null): ActiveProjectContext | null {
  const id = normalizeProjectId(project?.id);
  if (!id) return null;
  return {
    id,
    name: project?.name ? String(project.name) : undefined,
    key: project?.key ? String(project.key) : undefined,
  };
}

export function readStoredActiveProject(): ActiveProjectContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveProjectContext;
    const id = normalizeProjectId(parsed?.id);
    if (!id) return null;
    return {
      id,
      name: parsed?.name ? String(parsed.name) : undefined,
      key: parsed?.key ? String(parsed.key) : undefined,
    };
  } catch {
    return null;
  }
}

export function writeStoredActiveProject(project: ActiveProjectContext | Project) {
  if (typeof window === "undefined") return;
  const id = normalizeProjectId(project?.id);
  if (!id) return;
  try {
    window.localStorage.setItem(
      ACTIVE_PROJECT_KEY,
      JSON.stringify({
        id,
        name: project?.name ? String(project.name) : undefined,
        key: project?.key ? String(project.key) : undefined,
      })
    );
  } catch {
    // Local storage is optional; URL projectId remains the source of truth.
  }
}

