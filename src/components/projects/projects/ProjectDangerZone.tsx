"use client";

import * as React from "react";
import { Button } from "@/logaxp/components/ui/button";
import type { Project } from "@/logaxp/lib/project-management/projectManagement.types";

export function ProjectDangerZone({
  project,
  busy,
  onArchive,
  onRestore,
  onDelete,
}: {
  project: Project;
  busy?: boolean;
  onArchive: () => Promise<void> | void;
  onRestore?: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}) {
  const [confirmArchive, setConfirmArchive] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleteText, setDeleteText] = React.useState("");
  const isArchived = String(project.status ?? "").toUpperCase() === "ARCHIVED" || Boolean(project.archivedAt);
  const projectKey = String(project.key ?? "").trim();

  return (
    <div className="rounded-2xl border border-red-200 bg-white p-4 dark:border-red-900/40 dark:bg-slate-950">
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Danger zone</div>
      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Archive removes the project from active planning. Safe delete keeps the record recoverable.
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {isArchived && onRestore ? (
          <Button variant="outline" disabled={busy} onClick={onRestore}>
            Restore project
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setConfirmArchive(true)}
          >
            Archive project
          </Button>
        )}

        <Button
          variant="outline"
          disabled={busy}
          onClick={() => setConfirmDelete(true)}
        >
          Soft delete project
        </Button>
      </div>

      {confirmArchive ? (
        <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
          <div className="font-medium text-slate-900 dark:text-slate-50">Confirm archive?</div>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={() => setConfirmArchive(false)} disabled={busy}>Cancel</Button>
            <Button
              onClick={async () => {
                await onArchive();
                setConfirmArchive(false);
              }}
              disabled={busy}
            >
              Confirm
            </Button>
          </div>
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
          <div className="font-medium text-slate-900 dark:text-slate-50">Confirm delete?</div>
          <div className="mt-1 text-slate-600 dark:text-slate-300">
            Type <span className="font-mono font-semibold">{projectKey || "DELETE"}</span> to confirm.
          </div>
          <input
            className="mt-3 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={deleteText}
            onChange={(event) => setDeleteText(event.target.value)}
            placeholder={projectKey || "DELETE"}
          />
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDelete(false);
                setDeleteText("");
              }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await onDelete();
                setConfirmDelete(false);
                setDeleteText("");
              }}
              disabled={busy || deleteText.trim() !== (projectKey || "DELETE")}
            >
              Confirm
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
