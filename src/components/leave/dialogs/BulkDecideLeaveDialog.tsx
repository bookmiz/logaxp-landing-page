"use client";

// src/components/leave/dialogs/BulkDecideLeaveDialog.tsx
import * as React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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
import { Textarea } from "@/logaxp/components/ui/textarea";

type Mode = "approve" | "reject";

export function BulkDecideLeaveDialog({
  open,
  onOpenChange,
  mode,
  count,
  busy,
  onDecide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  count: number;
  busy?: boolean;
  onDecide: (decisionNote?: string) => void | Promise<void>;
}) {
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open]);

  const handleDecide = async () => {
    setError(null);

    if (count <= 0) {
      setError("No leave requests selected.");
      return;
    }

    try {
      await onDecide(reason.trim() || undefined);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || `Failed to bulk ${mode} leave requests.`);
    }
  };

  const submitting = !!busy;

  const title = mode === "approve" ? "Bulk Approve Leave Requests" : "Bulk Reject Leave Requests";
  const Icon = mode === "approve" ? CheckCircle2 : XCircle;
  const buttonText = mode === "approve" ? "Approve Selected" : "Reject Selected";
  const buttonColor = mode === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                This bulk action will be audited and applied to all {count} selected requests.
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Icon className="h-3.5 w-3.5" />
              {count} selected
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

          <div className="rounded-lg border bg-card p-4 text-sm shadow-sm">
            <div className="font-medium text-foreground">
              Bulk action summary
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              You are about to {mode === "approve" ? "approve" : "reject"} <strong>{count}</strong> leave request
              {count !== 1 ? "s" : ""}.
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              This cannot be undone automatically — individual adjustments may be needed afterward.
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              {mode === "approve" ? "Approval Notes" : "Rejection Reason"} (optional)
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                mode === "approve"
                  ? "Common reason or note for approving these requests (e.g., 'All approved per policy update')..."
                  : "Provide a reason for rejecting these requests (helps with audit trail and employee communication)..."
              }
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This note will be applied to all selected requests and visible in the audit log.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDecide}
            disabled={submitting || count <= 0}
            className={`min-w-40 gap-2 ${buttonColor}`}
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing…
              </>
            ) : (
              <>
                <Icon className="h-4 w-4" />
                {buttonText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}