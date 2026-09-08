"use client";

import * as React from "react";
import { Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import type { ProjectExpense, ProjectExpenseAttachment } from "@/logaxp/lib/project-finance/projectFinance.types";

/**
 * Plug your existing "upload/register -> fileId" flow here.
 * You can replace `onPickFileId` with your real UploadButton later.
 */
export function ExpenseAttachments({
  expense,
  busy,
  onAddFileId,
  onRemoveAttachment,
}: {
  expense: ProjectExpense;
  busy?: boolean;
  onAddFileId: (fileId: string) => Promise<void> | void;
  onRemoveAttachment: (attachmentId: string) => Promise<void> | void;
}) {
  const attachments = (expense.attachments ?? []) as ProjectExpenseAttachment[];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Attachments</div>

        {/* TEMP button (replace with your UploadButton that returns fileId) */}
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            const fileId = prompt("Paste uploaded fileId (temporary)");
            if (!fileId?.trim()) return;
            await onAddFileId(fileId.trim());
          }}
        >
          <Paperclip className="h-4 w-4" />
          Add
        </Button>
      </div>

      {attachments.length ? (
        <div className="space-y-2">
          {attachments.map((a) => {
            const url = a.file?.url ?? null;
            return (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="min-w-0">
                  <div className="truncate text-slate-700 dark:text-slate-200">
                    {a.fileId}
                  </div>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sky-600 hover:underline dark:text-sky-400"
                    >
                      Open file
                    </a>
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400">No URL</div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onRemoveAttachment(a.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-slate-500 dark:text-slate-400">No attachments yet.</div>
      )}
    </div>
  );
}