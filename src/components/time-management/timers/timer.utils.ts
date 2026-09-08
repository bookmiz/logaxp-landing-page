"use client";

export function safeDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function minutesBetween(aIso?: string | null, bIso?: string | null): number | null {
  const a = safeDate(aIso)?.getTime();
  const b = safeDate(bIso)?.getTime();
  if (!a || !b) return null;
  return Math.max(0, Math.round((b - a) / 60000));
}

export function formatElapsedMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (hh > 0) return `${hh}:${pad(mm)}:${pad(ss)}`;
  return `${mm}:${pad(ss)}`;
}

export function workLabel(projectId?: string | null, workItemId?: string | null) {
  if (workItemId) return `WorkItem ${workItemId}`;
  if (projectId) return `Project ${projectId}`;
  return "Unassigned";
}