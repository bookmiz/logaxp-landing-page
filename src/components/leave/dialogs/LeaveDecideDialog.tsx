"use client";

// src/components/leave/dialogs/LeaveDecideDialog.tsx
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
import { Separator } from "@/logaxp/components/ui/separator";
import { Textarea } from "@/logaxp/components/ui/textarea";

import type { LeaveRequest } from "@/logaxp/lib/leave/leave.types";
import { formatIsoDate, leaveEmployeeLabel, shortId } from "@/logaxp/lib/leave/leave.types";
import { LeaveStatusBadge } from "../LeaveStatusBadge";

type Mode = "approve" | "reject";

export function LeaveDecideDialog({
  open,
  onOpenChange,
  mode,
  row,
  busy,
  onDecide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  row: LeaveRequest | null;
  busy?: boolean;
  onDecide: (id: string, dto: { approved: boolean; reason?: string | null }) => void | Promise<void>;
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

    if (!row?.id) {
      setError("No leave request selected.");
      return;
    }

    try {
      await onDecide(String(row.id), {
        approved: mode === "approve",
        reason: reason.trim() || null,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || `Failed to ${mode} leave request.`);
    }
  };

  const submitting = !!busy;

  const title = mode === "approve" ? "Approve Leave Request" : "Reject Leave Request";
  const Icon = mode === "approve" ? CheckCircle2 : XCircle;
  const buttonText = mode === "approve" ? "Approve" : "Reject";
  const buttonColor = mode === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                This decision will update the request status and be logged for audit purposes.
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Icon className="h-3.5 w-3.5" />
              {mode === "approve" ? "Approve" : "Reject"}
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
                  {mode === "approve" ? "Approval Notes" : "Rejection Reason"} (optional)
                </label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    mode === "approve"
                      ? "Any additional comments or conditions for approval..."
                      : "Please provide a clear reason for rejection (required for audit trail)..."
                  }
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This note will be visible to the employee and logged in the audit trail.
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
            onClick={handleDecide}
            disabled={submitting || !row?.id}
            className={`min-w-32 gap-2 ${buttonColor}`}
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