"use client";

import * as React from "react";
import { 
  X, 
  Calendar, 
  DollarSign, 
  FileText, 
  Tag,
  AlertCircle
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card } from "@/logaxp/components/ui/card";
import { Input } from "@/logaxp/components/ui/input";
import { Label } from "@/logaxp/components/ui/label";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Badge } from "@/logaxp/components/ui/badge";

import type { CreateProjectBudgetDto, ProjectBudget, UpdateProjectBudgetDto } from "@/logaxp/lib/project-finance/projectFinance.types";

function toInt(v: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function formatCurrency(value: string) {
  // Remove non-digits
  const digits = value.replace(/\D/g, '');
  // Convert to dollars (cents to dollars)
  const dollars = Number(digits) / 100;
  if (isNaN(dollars)) return '';
  
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars).replace(/^(\D+)/, '$1 ');
}

export function BudgetCreateEditDialog({
  open,
  onOpenChange,
  mode,
  budget,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  budget?: ProjectBudget | null;
  busy?: boolean;
  onSubmit: (dto: CreateProjectBudgetDto | UpdateProjectBudgetDto) => Promise<void> | void;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [planned, setPlanned] = React.useState("");
  const [plannedCents, setPlannedCents] = React.useState(0);
  const [periodStart, setPeriodStart] = React.useState("");
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Handle planned amount input
  const handlePlannedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove currency formatting and get just digits
    const digits = value.replace(/\D/g, '');
    const cents = toInt(digits);
    setPlannedCents(cents);
    
    // Format for display if there are digits
    if (digits) {
      setPlanned(formatCurrency(digits));
    } else {
      setPlanned('');
    }
  };

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && budget) {
      setName(String(budget.name ?? ""));
      setDescription(String(budget.description ?? ""));
      setCurrency(String(budget.currency ?? "USD"));
      
      // Set planned amount in cents and formatted
      const cents = budget.plannedAmountCents ?? 0;
      setPlannedCents(cents);
      setPlanned(cents > 0 ? formatCurrency(String(cents)) : "");
      
      setPeriodStart(budget.periodStart ? String(budget.periodStart).slice(0, 10) : "");
      setPeriodEnd(budget.periodEnd ? String(budget.periodEnd).slice(0, 10) : "");
    } else {
      setName("");
      setDescription("");
      setCurrency("USD");
      setPlanned("");
      setPlannedCents(0);
      setPeriodStart("");
      setPeriodEnd("");
    }
    setErrors({});
  }, [open, mode, budget]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Budget name is required";
    }
    
    if (!currency.trim()) {
      newErrors.currency = "Currency is required";
    } else if (!/^[A-Z]{3}$/.test(currency)) {
      newErrors.currency = "Must be a 3-letter currency code (e.g., USD)";
    }
    
    if (plannedCents === 0) {
      newErrors.planned = "Planned amount is required";
    }
    
    if (periodStart && periodEnd && periodStart > periodEnd) {
      newErrors.period = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (mode === "create") {
      const dto: CreateProjectBudgetDto = {
        name: name.trim(),
        description: description.trim() || undefined,
        currency: currency.trim().toUpperCase(),
        plannedAmountCents: plannedCents,
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
      };
      await onSubmit(dto);
    } else {
      const dto: UpdateProjectBudgetDto = {
        name: name.trim(),
        description: description.trim() || undefined,
        plannedAmountCents: plannedCents,
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
      };
      await onSubmit(dto);
    }

    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <Card className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Tag className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {mode === "create" ? "Create Budget" : "Edit Budget"}
            </h3>
            {mode === "edit" && (
              <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px]">
                ID: {budget?.id.slice(0, 8)}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 w-7 rounded-full p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Name field */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Budget name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q2 Marketing Budget"
                className={cn(
                  "h-9 pl-8 text-sm",
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </div>
            {errors.name && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description field */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Description <span className="text-slate-400">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this budget covers..."
              className="min-h-[60px] resize-none text-sm"
            />
          </div>

          {/* Currency and Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Currency <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="USD"
                  maxLength={3}
                  className={cn(
                    "h-9 pl-8 text-sm font-mono uppercase",
                    errors.currency && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
              {errors.currency && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currency}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="planned" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Planned amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="planned"
                value={planned}
                onChange={handlePlannedChange}
                placeholder="$0.00"
                inputMode="numeric"
                className={cn(
                  "h-9 text-sm font-mono",
                  errors.planned && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.planned && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.planned}
                </p>
              )}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="periodStart" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Start date <span className="text-slate-400">(opt)</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="periodStart"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="periodEnd" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                End date <span className="text-slate-400">(opt)</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="periodEnd"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Period validation error */}
          {errors.period && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {errors.period}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="h-8 px-3 text-xs"
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={busy}
              className="h-8 gap-1 bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 text-xs text-white hover:from-emerald-500 hover:to-emerald-400"
            >
              {busy ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                mode === "create" ? "Create budget" : "Save changes"
              )}
            </Button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/20">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
      </Card>
    </div>
  );
}

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}