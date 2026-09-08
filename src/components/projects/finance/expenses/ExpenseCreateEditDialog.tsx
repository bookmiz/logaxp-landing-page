"use client";

import * as React from "react";
import { 
  X, 
  Receipt, 
  DollarSign, 
  Calendar, 
  FileText, 
  AlertCircle,
  Save,
  Plus,
  Upload,
  CreditCard,
  Tag
} from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Card } from "@/logaxp/components/ui/card";
import { Input } from "@/logaxp/components/ui/input";
import { Label } from "@/logaxp/components/ui/label";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Badge } from "@/logaxp/components/ui/badge";
import { Separator } from "@/logaxp/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/logaxp/components/ui/tabs";

import type {
  CreateProjectExpenseDto,
  ProjectExpense,
  UpdateProjectExpenseDto,
} from "@/logaxp/lib/project-finance/projectFinance.types";
import { ExpenseAttachments } from "./ExpenseAttachments";

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
  if (isNaN(num) || num === 0) return "";
  
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

export function ExpenseCreateEditDialog({
  open,
  onOpenChange,
  mode,
  expense,
  busy,
  onSubmit,
  onAddFileId,
  onRemoveAttachment,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  expense?: ProjectExpense | null;
  busy?: boolean;
  onSubmit: (dto: CreateProjectExpenseDto | UpdateProjectExpenseDto) => Promise<void> | void;
  onAddFileId?: (fileId: string) => Promise<void> | void;
  onRemoveAttachment?: (attachmentId: string) => Promise<void> | void;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [amount, setAmount] = React.useState("");
  const [amountCents, setAmountCents] = React.useState(0);
  const [spentAt, setSpentAt] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = React.useState<"details" | "attachments">("details");

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && expense) {
      setTitle(String(expense.title ?? ""));
      setDescription(String(expense.description ?? ""));
      setCurrency(String(expense.currency ?? "USD"));
      
      const cents = expense.amountCents ?? 0;
      setAmountCents(cents);
      setAmount(cents > 0 ? formatDisplayAmount(cents, expense?.currency ?? "USD") : "");
      
      setSpentAt(expense.spentAt ? String(expense.spentAt).slice(0, 10) : "");
      setActiveTab("details");
    } else {
      setTitle("");
      setDescription("");
      setCurrency("USD");
      setAmount("");
      setAmountCents(0);
      setSpentAt("");
      setActiveTab("details");
    }
    setErrors({});
  }, [open, mode, expense]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove currency formatting and get just digits
    const digits = value.replace(/\D/g, '');
    const cents = toInt(digits);
    setAmountCents(cents);
    
    // Format for display if there are digits
    if (digits) {
      setAmount(formatCurrency(digits, currency));
    } else {
      setAmount('');
    }

    // Clear amount error if any
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!currency.trim()) {
      newErrors.currency = "Currency is required";
    } else if (!/^[A-Z]{3}$/.test(currency)) {
      newErrors.currency = "Must be a 3-letter currency code (e.g., USD)";
    }
    
    if (amountCents === 0) {
      newErrors.amount = "Amount is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (mode === "create") {
      const dto: CreateProjectExpenseDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        currency: currency.trim().toUpperCase(),
        amountCents,
        spentAt: spentAt || undefined,
      };
      await onSubmit(dto);
    } else {
      const dto: UpdateProjectExpenseDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        currency: currency.trim().toUpperCase(),
        amountCents,
        spentAt: spentAt || undefined,
      };
      await onSubmit(dto);
    }

    onOpenChange(false);
  };

  if (!open) return null;

  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <Card className="relative w-full max-w-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 dark:border-slate-800 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
              {isEdit ? <Receipt className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isEdit ? "Edit Expense" : "Create New Expense"}
              </h3>
              <p className="text-xs text-white/70">
                {isEdit ? "Update expense details and attachments" : "Track a new project expense"}
              </p>
            </div>
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

        {/* Content */}
        <div className="p-5">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="gap-2">
                <Tag className="h-4 w-4" />
                <span>Expense Details</span>
              </TabsTrigger>
              {isEdit && (
                <TabsTrigger value="attachments" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Attachments</span>
                  {expense?.attachments?.length ? (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                      {expense.attachments.length}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="space-y-5 mt-4">
              {/* Title and Currency */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Expense title <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., AWS Hosting - March"
                      className={cn(
                        "h-10 pl-9 pr-4 text-sm",
                        errors.title && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                  {errors.title && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Currency <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      placeholder="USD"
                      maxLength={3}
                      className={cn(
                        "h-10 pl-9 pr-4 text-sm font-mono uppercase",
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
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Description <span className="text-slate-400">(optional)</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this expense for? Include any relevant details..."
                    className="min-h-[80px] pl-9 text-sm resize-none"
                  />
                </div>
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="amount"
                      value={amount}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spentAt" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Date spent <span className="text-slate-400">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="spentAt"
                      type="date"
                      value={spentAt}
                      onChange={(e) => setSpentAt(e.target.value)}
                      className="h-10 pl-9 pr-4 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {amountCents > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Formatted amount</span>
                    <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatDisplayAmount(amountCents, currency)}
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            {isEdit && expense && onAddFileId && onRemoveAttachment && (
              <TabsContent value="attachments" className="mt-4">
                <ExpenseAttachments
                  expense={expense}
                  busy={busy}
                  onAddFileId={onAddFileId}
                  onRemoveAttachment={onRemoveAttachment}
                />
              </TabsContent>
            )}
          </Tabs>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="h-9 px-4 text-xs"
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={busy}
              className="h-9 gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 text-xs text-white hover:from-emerald-500 hover:to-emerald-400"
            >
              {busy ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {isEdit ? "Save changes" : "Create expense"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2 dark:border-slate-800 dark:bg-slate-900/20">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            <span className="text-red-500">*</span> Required fields
            {!isEdit && " • After creating, you can add receipts in the edit view"}
          </p>
        </div>
      </Card>
    </div>
  );
}