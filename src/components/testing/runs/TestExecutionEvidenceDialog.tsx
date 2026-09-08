"use client";

import * as React from "react";
import type {
  AddExecutionEvidenceDto,
  TestExecution,
} from "@/logaxp/lib/testing/testing.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";

export function TestExecutionEvidenceDialog({
  open,
  onOpenChange,
  execution,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  execution: TestExecution | null;
  busy?: boolean;
  onSubmit: (dto: AddExecutionEvidenceDto) => void | Promise<void>;
}) {
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [fileId, setFileId] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setTitle("");
    setUrl("");
    setFileId("");
  }, [open]);

  const canSubmit = Boolean(execution) && (url.trim() || fileId.trim());

  const submit = async () => {
    if (!execution) return;
    const dto: AddExecutionEvidenceDto = {
      title: title.trim() ? title.trim() : null,
      ...(url.trim() ? { url: url.trim() } : {}),
      ...(fileId.trim() ? { fileId: fileId.trim() } : {}),
    };
    await onSubmit(dto);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Add Evidence</DialogTitle>
          <DialogDescription>
            Attach a supporting link or select a previously uploaded file.
          </DialogDescription>
        </DialogHeader>

        {!execution ? (
          <div className="text-sm text-slate-500">No execution selected.</div>
        ) : (
          <div className="space-y-3">
            <Input
              label="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Screenshot of failure, video repro"
            />
            <Input
              label="URL (optional)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              hint="If you store evidence externally (Drive, S3, Loom, etc.)."
            />
            <Input
              label="File ID (optional)"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              placeholder="file_..."
              hint="If you upload to your file service first, paste fileId here."
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <div className="mb-1 font-medium">Payload preview</div>
              <pre className="overflow-x-auto">
                {JSON.stringify(
                  {
                    ...(title.trim() ? { title: title.trim() } : {}),
                    ...(url.trim() ? { url: url.trim() } : {}),
                    ...(fileId.trim() ? { fileId: fileId.trim() } : {}),
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            loading={busy}
            disabled={!canSubmit}
          >
            Add evidence
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
