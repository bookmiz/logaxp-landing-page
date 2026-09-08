"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Modal } from "./Modal";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (v: boolean) => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  destructive,
  busy,
  onConfirm,
  onOpenChange,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={title}
      subtitle={description}
      widthClassName="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
            disabled={busy}
            className={destructive ? "bg-red-600 hover:bg-red-700 text-white" : undefined}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
        </div>
        <div className="space-y-1">
          <div className="font-medium">{title}</div>
          {description ? <div className="text-slate-600 dark:text-slate-300">{description}</div> : null}
        </div>
      </div>
    </Modal>
  );
}