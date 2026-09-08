"use client";

import * as React from "react";
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Receipt, 
  Calendar,
  DollarSign,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  FileText,
  Clock
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card } from "@/logaxp/components/ui/card";
import { Label } from "@/logaxp/components/ui/label";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Badge } from "@/logaxp/components/ui/badge";
import { Separator } from "@/logaxp/components/ui/separator";

import type { DecideExpenseDto, ProjectExpense } from "@/logaxp/lib/project-finance/projectFinance.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function formatCurrency(cents: number, currency: string = "USD") {
  const dollars = cents / 100;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function ExpenseDecideDialog({
  open,
  onOpenChange,
  mode,
  expense,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "approve" | "reject";
  expense: ProjectExpense | null;
  busy?: boolean;
  onSubmit: (dto: DecideExpenseDto) => Promise<void> | void;
}) {
  const [note, setNote] = React.useState("");
  const [charCount, setCharCount] = React.useState(0);
  const MAX_CHARS = 500;

  React.useEffect(() => {
    if (!open) return;
    setNote("");
    setCharCount(0);
  }, [open, expense]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setNote(value);
      setCharCount(value.length);
    }
  };

  if (!open || !expense) return null;

  const isApprove = mode === "approve";
  const amount = formatCurrency(expense.amountCents ?? 0, expense.currency ?? "USD");
  const spentDate = formatDate(expense.spentAt);
  const hasAttachments = (expense.attachments?.length ?? 0) > 0;
  const attachmentCount = expense.attachments?.length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <Card className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5 duration-200 overflow-hidden">
        {/* Header with gradient based on mode */}
        <div className={cn(
          "px-5 py-4",
          isApprove 
            ? "bg-gradient-to-r from-emerald-600 to-emerald-500" 
            : "bg-gradient-to-r from-red-600 to-red-500"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                {isApprove ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {isApprove ? "Approve Expense" : "Reject Expense"}
                </h3>
                <p className="text-xs text-white/80">
                  {isApprove ? "Confirm and approve this expense" : "Provide reason for rejection"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full p-0 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expense Summary Card */}
        <div className="mx-5 mt-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
              <Receipt className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {expense.title}
                </h4>
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {expense.id.slice(0, 8)}
                </Badge>
              </div>
              
              {expense.description && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {expense.description}
                </p>
              )}
              
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-mono font-medium text-slate-900 dark:text-slate-100">
                    {amount}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {spentDate}
                  </span>
                </div>

                {hasAttachments && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {attachmentCount} attachment{attachmentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px]",
                    expense.status === 'SUBMITTED' && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                  )}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {expense.status}
                </Badge>
                <span className="text-[10px] text-slate-400">
                  Submitted for approval
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decision Note Field */}
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="note" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Decision note <span className="text-slate-400">(optional)</span>
              </Label>
              <span className={cn(
                "text-[10px]",
                charCount > MAX_CHARS * 0.8 ? "text-amber-500" : "text-slate-400"
              )}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                id="note"
                value={note}
                onChange={handleNoteChange}
                placeholder={isApprove 
                  ? "Add any notes or conditions for this approval..." 
                  : "Provide a clear reason for rejection..."
                }
                className="min-h-[100px] pl-9 text-sm resize-none"
              />
            </div>
          </div>

          {/* Context-specific guidance */}
          {!isApprove && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    This action cannot be undone
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Rejecting will return this expense to draft status. The submitter will be notified with your feedback.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isApprove && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    Approval confirmation
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    This expense will be marked as approved and will count toward the project budget.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick action suggestions */}
          {!isApprove && note.length === 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNote("Insufficient documentation provided")}
                className="h-7 text-[10px] border-slate-200"
              >
                Insufficient documentation
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNote("Amount exceeds budget allocation")}
                className="h-7 text-[10px] border-slate-200"
              >
                Exceeds budget
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNote("Missing required approvals")}
                className="h-7 text-[10px] border-slate-200"
              >
                Missing approvals
              </Button>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="h-9 px-4 text-xs"
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={async () => {
                await onSubmit({ note: note.trim() || undefined });
                onOpenChange(false);
              }}
              disabled={busy}
              className={cn(
                "h-9 gap-2 px-5 text-xs text-white min-w-[100px]",
                isApprove 
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400" 
                  : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
              )}
            >
              {busy ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isApprove ? "Approving..." : "Rejecting..."}
                </>
              ) : (
                <>
                  {isApprove ? "Approve" : "Reject"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2 dark:border-slate-800 dark:bg-slate-900/20">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {isApprove 
              ? "Approved expenses will be reflected in project financials" 
              : "Rejected expenses can be edited and resubmitted"}
          </p>
        </div>
      </Card>
    </div>
  );
}