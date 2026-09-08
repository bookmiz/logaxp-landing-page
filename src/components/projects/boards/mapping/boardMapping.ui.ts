import type { Board, BoardColumn, Workflow, WorkflowStatus } from "@/logaxp/lib/project-management/projectManagement.types";

/**
 * Stored in Board.metadata so we don't need new endpoints.
 */
export type BoardWorkflowMappingV1 = {
  version: 1;
  workflowId: string;
  statusToColumn: Record<string, string>; // statusId -> columnId
};

type AnyObj = Record<string, any>;

export function readBoardWorkflowMapping(board?: Board | null): BoardWorkflowMappingV1 | null {
  const md = (board?.metadata ?? null) as AnyObj | null;
  const wm = md?.workflowMapping as AnyObj | undefined;
  if (!wm) return null;

  if (wm.version !== 1) return null;
  if (typeof wm.workflowId !== "string" || !wm.workflowId) return null;

  const stc = wm.statusToColumn;
  if (!stc || typeof stc !== "object") return null;

  return {
    version: 1,
    workflowId: wm.workflowId,
    statusToColumn: stc as Record<string, string>,
  };
}

export function writeBoardWorkflowMapping(board: Board, mapping: BoardWorkflowMappingV1): unknown {
  const prev = (board.metadata ?? {}) as AnyObj;
  return {
    ...prev,
    workflowMapping: mapping,
  };
}

export function invertStatusToColumn(statusToColumn: Record<string, string>): Record<string, string> {
  // If multiple statuses map to same column, the *first* one wins (stable behavior is enforced by caller)
  const out: Record<string, string> = {};
  for (const [statusId, columnId] of Object.entries(statusToColumn)) {
    if (!columnId) continue;
    if (!out[columnId]) out[columnId] = statusId;
  }
  return out;
}

export function getWorkflowById(workflows: Workflow[], workflowId: string): Workflow | null {
  return workflows.find((w) => w.id === workflowId) ?? null;
}

export function getStatuses(workflow: Workflow | null): WorkflowStatus[] {
  const s = Array.isArray(workflow?.statuses) ? (workflow!.statuses as WorkflowStatus[]) : [];
  return [...s].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function normalizeColumns(cols: BoardColumn[]): BoardColumn[] {
  return [...cols].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function pickColumnByFlags(columns: BoardColumn[], flag: "isBacklog" | "isDone"): BoardColumn | null {
  return columns.find((c) => Boolean((c as any)[flag])) ?? null;
}

function pickFirstMiddleColumn(columns: BoardColumn[]): BoardColumn | null {
  const middle = columns.find((c) => !c.isBacklog && !c.isDone) ?? null;
  if (middle) return middle;
  return columns[0] ?? null;
}

/**
 * Auto-maps statuses -> columns using simple heuristics (category + backlog/done flags).
 * Works even if category strings vary; it checks substring includes.
 */
export function autoMapStatusToColumn(statuses: WorkflowStatus[], columns: BoardColumn[]): Record<string, string> {
  const cols = normalizeColumns(columns);
  const backlogCol = pickColumnByFlags(cols, "isBacklog") ?? cols[0] ?? null;
  const doneCol = pickColumnByFlags(cols, "isDone") ?? cols[cols.length - 1] ?? null;
  const inProgCol = pickFirstMiddleColumn(cols);

  const out: Record<string, string> = {};

  for (const s of statuses) {
    const cat = String(s.category ?? "").toUpperCase();

    if (cat.includes("DONE")) {
      if (doneCol) out[s.id] = doneCol.id;
      continue;
    }

    if (cat.includes("IN") || cat.includes("PROGRESS")) {
      if (inProgCol) out[s.id] = inProgCol.id;
      continue;
    }

    // default to TODO/backlog
    if (backlogCol) out[s.id] = backlogCol.id;
  }

  return out;
}

export function validateMapping(
  statuses: WorkflowStatus[],
  columns: BoardColumn[],
  statusToColumn: Record<string, string>
): { unmappedStatusIds: string[]; invalidPairs: Array<{ statusId: string; columnId: string }> } {
  const colIds = new Set(columns.map((c) => c.id));
  const invalidPairs: Array<{ statusId: string; columnId: string }> = [];

  for (const [sid, cid] of Object.entries(statusToColumn)) {
    if (!cid) continue;
    if (!colIds.has(cid)) invalidPairs.push({ statusId: sid, columnId: cid });
  }

  const unmappedStatusIds = statuses
    .filter((s) => !statusToColumn[s.id])
    .map((s) => s.id);

  return { unmappedStatusIds, invalidPairs };
}