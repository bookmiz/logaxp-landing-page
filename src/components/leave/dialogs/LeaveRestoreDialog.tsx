"use client";

// src/components/leave/dialogs/LeaveRestoreDialog.tsx
import * as React from "react";
import { RotateCcw, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Separator } from "@/logaxp/components/ui/separator";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { cn } from "@/logaxp/lib/cn";

import type { LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { formatIsoDate, leaveEmployeeLabel, shortId } from "@/logaxp/lib/leave/leave.types";
import { LeaveStatusBadge } from "../LeaveStatusBadge";

export function LeaveRestoreDialog({
  open,
  onOpenChange,
  row,
  busy,
  onRestore,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: LeaveRequest | null;
  busy?: boolean;
  onRestore: (id: string, reason?: string | null) => void | Promise<void>;
}) {
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open]);

  const handleRestore = async () => {
    setError(null);

    if (!row?.id) {
      setError("No leave request selected.");
      return;
    }

    try {
      await onRestore(String(row.id), reason.trim() || null);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to restore leave request.");
    }
  };

  const submitting = !!busy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Restore Leave Request
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Revert a CANCELED or REJECTED request back to REQUESTED status. Overlap rules will be re-applied.
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <RotateCcw className="h-3.5 w-3.5" />
              Restore
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {row ? (
            <>
              <div className="rounded-lg border bg-card p-4 text-sm shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">
                      {leaveEmployeeLabel(row.employee)} • {String(row.type ?? "Leave")}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatIsoDate(row.startDate)} → {formatIsoDate(row.endDate)}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      ID: {shortId(row.id)}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <LeaveStatusBadge status={row.status as any} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Admin Reason (optional)
                </label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this request being restored? (audit trail)"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This note will be logged for audit purposes.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No leave request selected.
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            disabled={submitting || !row?.id}
            className="min-w-32 bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Restoring…
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Restore Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}