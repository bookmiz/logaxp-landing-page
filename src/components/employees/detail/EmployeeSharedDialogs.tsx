"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";

export function StatusBadge({ status, deleted }: { status?: string; deleted?: boolean }) {
  if (deleted) return <Badge variant="warning">DELETED</Badge>;

  const s = String(status ?? "—").toUpperCase();

  if (s === "ACTIVE") return <Badge variant="success">ACTIVE</Badge>;
  if (s === "ONBOARDING") return <Badge variant="muted">ONBOARDING</Badge>;
  if (s === "ON_LEAVE") return <Badge variant="default">ON LEAVE</Badge>;
  if (s === "SUSPENDED") return <Badge variant="warning">SUSPENDED</Badge>;
  if (s === "TERMINATED") return <Badge variant="destructive">TERMINATED</Badge>;
  if (s === "INACTIVE") return <Badge variant="muted">INACTIVE</Badge>;

  return <Badge variant="muted">{s}</Badge>;
}

export function PanelShell({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white dark:bg-slate-950">
      <div className="border-b bg-gradient-to-b from-slate-50 to-white px-4 py-3 dark:from-slate-950 dark:to-slate-950">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</div>
            {description ? (
              <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{description}</div>
            ) : null}
          </div>
          {right ? <div className="flex items-center gap-2">{right}</div> : null}
        </div>
      </div>

      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

export function RowKV({
  k,
  v,
}: {
  k: string;
  v: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0 dark:border-slate-900">
      <div className="text-xs font-medium text-slate-500">{k}</div>
      <div className="text-right text-sm text-slate-900 dark:text-slate-50">{v}</div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  destructive,
  busyAny,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  destructive?: boolean;
  busyAny: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => void onConfirm()}
            disabled={busyAny}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}