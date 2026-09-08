"use client";

import * as React from "react";
import { 
  X, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertCircle,
  DollarSign,
  MessageSquare,
  ArrowRight
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card } from "@/logaxp/components/ui/card";
import { Input } from "@/logaxp/components/ui/input";
import { Label } from "@/logaxp/components/ui/label";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Badge } from "@/logaxp/components/ui/badge";
import { Separator } from "@/logaxp/components/ui/separator";

import type { DecideBudgetDto, ProjectBudget } from "@/logaxp/lib/project-finance/projectFinance.types";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function toInt(v: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function formatCurrency(value: string | number, currency: string = "USD") {
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return "$0.00";
  
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num / 100);
}

function formatDisplayAmount(cents: number, currency: string = "USD") {
  const dollars = cents / 100;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}

export function BudgetDecideDialog({
  open,
  onOpenChange,
  mode,
  budget,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "approve" | "reject";
  budget: ProjectBudget | null;
  busy?: boolean;
  onSubmit: (dto: DecideBudgetDto) => Promise<void> | void;
}) {
  const [note, setNote] = React.useState("");
  const [approvedAmount, setApprovedAmount] = React.useState("");
  const [approvedAmountCents, setApprovedAmountCents] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open || !budget) return;
    
    setNote("");
    
    // Initialize approved amount with planned amount
    const plannedCents = budget.plannedAmountCents ?? 0;
    setApprovedAmountCents(plannedCents);
    setApprovedAmount(formatDisplayAmount(plannedCents, budget.currency ?? "USD"));
    setErrors({});
  }, [open, budget]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove currency formatting and get just digits
    const digits = value.replace(/\D/g, '');
    const cents = toInt(digits);
    setApprovedAmountCents(cents);
    
    // Format for display if there are digits
    if (digits) {
      setApprovedAmount(formatCurrency(digits, budget?.currency ?? "USD"));
    } else {
      setApprovedAmount('');
    }

    // Clear amount error if any
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === "approve" && approvedAmountCents === 0) {
      newErrors.amount = "Approved amount is required";
    }
    
    if (mode === "approve" && budget && approvedAmountCents > (budget.plannedAmountCents ?? 0)) {
      newErrors.amount = "Approved amount cannot exceed planned amount";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const dto: DecideBudgetDto = {
      note: note.trim() || undefined,
      ...(mode === "approve" ? { approvedAmountCents } : {}),
    };
    
    await onSubmit(dto);
    onOpenChange(false);
  };

  if (!open || !budget) return null;

  const isApprove = mode === "approve";
  const plannedAmount = formatDisplayAmount(budget.plannedAmountCents ?? 0, budget.currency ?? "USD");
  const plannedVsApproved = isApprove && approvedAmountCents !== (budget.plannedAmountCents ?? 0);
  const difference = isApprove ? (budget.plannedAmountCents ?? 0) - approvedAmountCents : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <Card className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5 duration-200">
        {/* Header with gradient based on mode */}
        <div className={cn(
          "flex items-center justify-between rounded-t-lg px-4 py-3",
          isApprove 
            ? "bg-gradient-to-r from-emerald-600 to-emerald-500" 
            : "bg-gradient-to-r from-red-600 to-red-500"
        )}>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
              {isApprove ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            </div>
            <h3 className="text-sm font-semibold text-white">
              {isApprove ? "Approve Budget" : "Reject Budget"}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 w-7 rounded-full p-0 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Budget summary */}
        <div className="border-b border-slate-200 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/20">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
              <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {budget.name}
                </h4>
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  ID: {budget.id.slice(0, 8)}
                </Badge>
              </div>
              {budget.description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {budget.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Planned: <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{plannedAmount}</span>
                </span>
                {budget.periodStart && (
                  <span className="text-slate-600 dark:text-slate-400">
                    {budget.periodStart} → {budget.periodEnd || "∞"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 p-4">
          {/* Approved amount field - only for approve mode */}
          {isApprove && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Approved amount <span className="text-red-500">*</span>
                </Label>
                {plannedVsApproved && (
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    difference > 0 
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                      : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                  )}>
                    {difference > 0 ? `↓ $${(difference/100).toFixed(2)} less` : `↑ $${(Math.abs(difference)/100).toFixed(2)} more`}
                  </Badge>
                )}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="amount"
                  value={approvedAmount}
                  onChange={handleAmountChange}
                  placeholder="$0.00"
                  inputMode="numeric"
                  className={cn(
                    "h-10 pl-9 pr-4 text-sm font-mono",
                    errors.amount && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
              {errors.amount && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount}
                </p>
              )}
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Enter the amount you&apos;re approving for this budget
              </p>
            </div>
          )}

          {/* Decision note field */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Decision note <span className="text-slate-400">(optional)</span>
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isApprove 
                  ? "Add any conditions or comments about this approval..." 
                  : "Provide a reason for rejection..."
                }
                className="min-h-[80px] pl-9 text-sm resize-none"
              />
            </div>
          </div>

          {/* Warning for reject mode */}
          {!isApprove && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    This action cannot be undone
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Rejecting this budget will move it back to draft status. The requester will be notified.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Approval summary */}
          {isApprove && approvedAmountCents > 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-800 dark:text-emerald-300">Planned amount</span>
                <span className="font-mono font-medium text-emerald-800 dark:text-emerald-300">{plannedAmount}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-emerald-800 dark:text-emerald-300">Approved amount</span>
                <span className="font-mono font-medium text-emerald-800 dark:text-emerald-300">
                  {formatCurrency(String(approvedAmountCents), budget.currency ?? "USD")}
                </span>
              </div>
              {plannedVsApproved && (
                <>
                  <Separator className="my-2 bg-emerald-200 dark:bg-emerald-800" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-800 dark:text-emerald-300">Difference</span>
                    <span className={cn(
                      "font-mono font-medium",
                      difference > 0 ? "text-amber-600" : "text-blue-600",
                      "dark:text-amber-400 dark:text-blue-400"
                    )}>
                      {difference > 0 ? "-" : "+"}{formatCurrency(String(Math.abs(difference)), budget.currency ?? "USD")}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="h-9 px-3 text-xs"
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={busy || (isApprove && approvedAmountCents === 0)}
              className={cn(
                "h-9 gap-2 px-4 text-xs text-white",
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
                  {isApprove ? "Approve budget" : "Reject budget"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/20">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {isApprove 
              ? "Approving will make this budget active for the project" 
              : "Rejecting will return this budget to draft status"}
          </p>
        </div>
      </Card>
    </div>
  );
}