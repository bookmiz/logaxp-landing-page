"use client";

import * as React from "react";
import { GitBranchPlus, Pencil, Plus, Trash2 } from "lucide-react";

import type { EmployeeDetail } from "@/logaxp/lib/employee-management/employee-management.types";
import type {
  CreateEmployeePaymentSplitDto,
  EmployeePaymentMethod,
  EmployeePaymentSplit,
  PaymentSplitType,
  UpdateEmployeePaymentSplitDto,
} from "@/logaxp/lib/employee-management/employee-payroll.types";
import {
  PAYMENT_SPLIT_TYPE_VALUES,
} from "@/logaxp/lib/employee-management/employee-payroll.types";
import { useEmployeePayrollManagement } from "@/logaxp/hooks/useEmployeePayrollManagement";

import { Card, CardContent } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { Input } from "@/logaxp/components/ui/input";
import { toast } from "@/logaxp/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";

function unwrapApi<T>(res: { data?: T } | T): T {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as { data: T }).data;
  }
  return res as T;
}

function humanize(value?: string | null) {
  if (!value) return "—";
  return String(value).replaceAll("_", " ");
}

function safeDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

function formatMethodLabel(method?: EmployeePaymentMethod | EmployeePaymentSplit["paymentMethod"] | null) {
  if (!method) return "—";
  if (method.type === "BANK_ACCOUNT") {
    return `${method.label || method.bankName || "Bank"} • ****${method.accountNumberLast4 || "—"}`;
  }
  if (method.type === "MOBILE_MONEY") {
    return `${method.label || method.providerName || "Wallet"} • ${method.walletNumber || "—"}`;
  }
  return method.label || humanize(method.type);
}

type Draft = {
  paymentMethodId: string;
  splitType: PaymentSplitType;
  fixedAmountCents: string;
  percentage: string;
  priority: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  notes: string;
};

function toDraft(item?: EmployeePaymentSplit | null): Draft {
  return {
    paymentMethodId: item?.paymentMethodId ?? "",
    splitType: item?.splitType ?? "PERCENTAGE",
    fixedAmountCents:
      item?.fixedAmountCents === null || item?.fixedAmountCents === undefined
        ? ""
        : String(item.fixedAmountCents),
    percentage:
      item?.percentage === null || item?.percentage === undefined ? "" : String(item.percentage),
    priority: item?.priority === null || item?.priority === undefined ? "0" : String(item.priority),
    isActive: item?.isActive ?? true,
    effectiveFrom: item?.effectiveFrom ? String(item.effectiveFrom).slice(0, 10) : "",
    effectiveTo: item?.effectiveTo ? String(item.effectiveTo).slice(0, 10) : "",
    notes: item?.notes ?? "",
  };
}

export function EmployeePaymentSplitsTab({
  employee,
}: {
  employee: EmployeeDetail;
}) {
  const payrollApi = useEmployeePayrollManagement();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [items, setItems] = React.useState<EmployeePaymentSplit[]>([]);
  const [methods, setMethods] = React.useState<EmployeePaymentMethod[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeePaymentSplit | null>(null);
  const [draft, setDraft] = React.useState<Draft>(toDraft(null));

  const load = React.useCallback(async () => {
    try {
      setLoading(true);

      const [splitsRes, methodsRes] = await Promise.all([
        payrollApi.paymentSplits.list(employee.id, { includeInactive: true }),
        payrollApi.paymentMethods.list(employee.id, { includeInactive: true }),
      ]);

      setItems(unwrapApi(splitsRes) as EmployeePaymentSplit[]);
      setMethods(unwrapApi(methodsRes) as EmployeePaymentMethod[]);
    } catch (e) {
      console.error(e);
      setItems([]);
      setMethods([]);
      toast.error("Failed to load payment splits");
    } finally {
      setLoading(false);
    }
  }, [employee.id, payrollApi.paymentMethods, payrollApi.paymentSplits]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setDraft({
      ...toDraft(null),
      paymentMethodId: methods[0]?.id ?? "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openEdit = (item: EmployeePaymentSplit) => {
    setEditing(item);
    setDraft(toDraft(item));
    setOpen(true);
  };

  const submit = async () => {
    try {
      setSaving(true);

      if (!draft.paymentMethodId) {
        toast.error("Select a payment method");
        return;
      }

      const basePayload = {
        paymentMethodId: draft.paymentMethodId,
        splitType: draft.splitType,
        ...(draft.fixedAmountCents.trim()
          ? { fixedAmountCents: Number(draft.fixedAmountCents) }
          : {}),
        ...(draft.percentage.trim() ? { percentage: Number(draft.percentage) } : {}),
        ...(draft.priority.trim() ? { priority: Number(draft.priority) } : {}),
        isActive: draft.isActive,
        ...(draft.effectiveFrom.trim() ? { effectiveFrom: draft.effectiveFrom } : {}),
        ...(draft.effectiveTo.trim() ? { effectiveTo: draft.effectiveTo } : {}),
        ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
      };

      if (editing) {
        const payload: UpdateEmployeePaymentSplitDto = basePayload;
        await payrollApi.paymentSplits.update(editing.id, payload);
        toast.success("Payment split updated");
      } else {
        const payload: CreateEmployeePaymentSplitDto = basePayload;
        await payrollApi.paymentSplits.create(employee.id, payload);
        toast.success("Payment split created");
      }

      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save payment split");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: EmployeePaymentSplit) => {
    const ok = window.confirm("Delete this payment split?");
    if (!ok) return;

    try {
      await payrollApi.paymentSplits.remove(item.id);
      toast.success("Payment split removed");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove payment split");
    }
  };

  if (loading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate} className="gap-2" disabled={methods.length === 0}>
          <Plus className="h-4 w-4" />
          Add payment split
        </Button>
      </div>

      {methods.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <EmptyState
              title="No payment methods available"
              description="Create at least one payment method before configuring split payouts."
            />
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <EmptyState
              title="No payment splits"
              description="Create fixed amount, percentage, or remainder-based payout splits."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="rounded-2xl">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{humanize(item.splitType)}</Badge>
                      {!item.isActive ? <Badge variant="outline">Inactive</Badge> : null}
                    </div>

                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {item.splitType === "FIXED_AMOUNT"
                        ? `${item.fixedAmountCents ?? "—"} cents`
                        : item.splitType === "PERCENTAGE"
                        ? `${item.percentage ?? "—"}%`
                        : "Remainder"}
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Method: {formatMethodLabel(item.paymentMethod)}
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Priority: {item.priority} • Effective: {safeDate(item.effectiveFrom)} → {safeDate(item.effectiveTo)}
                    </div>

                    {item.notes ? (
                      <div className="text-sm text-slate-600 dark:text-slate-300">{item.notes}</div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => openEdit(item)} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => void remove(item)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranchPlus className="h-4 w-4" />
              {editing ? "Edit Payment Split" : "Add Payment Split"}
            </DialogTitle>
            <DialogDescription>
              Configure how payroll should be split across payment methods.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Payment Method">
                <select
                  value={draft.paymentMethodId}
                  onChange={(e) => setDraft((s) => ({ ...s, paymentMethodId: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="">Select payment method</option>
                  {methods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {formatMethodLabel(method)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Split Type">
                <select
                  value={draft.splitType}
                  onChange={(e) => setDraft((s) => ({ ...s, splitType: e.target.value as PaymentSplitType }))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  {PAYMENT_SPLIT_TYPE_VALUES.map((x) => (
                    <option key={x} value={x}>
                      {humanize(x)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fixed Amount (cents)">
                <Input
                  type="number"
                  value={draft.fixedAmountCents}
                  onChange={(e) => setDraft((s) => ({ ...s, fixedAmountCents: e.target.value }))}
                  placeholder="Only for FIXED_AMOUNT"
                />
              </Field>

              <Field label="Percentage">
                <Input
                  type="number"
                  value={draft.percentage}
                  onChange={(e) => setDraft((s) => ({ ...s, percentage: e.target.value }))}
                  placeholder="Only for PERCENTAGE"
                />
              </Field>

              <Field label="Priority">
                <Input
                  type="number"
                  value={draft.priority}
                  onChange={(e) => setDraft((s) => ({ ...s, priority: e.target.value }))}
                  placeholder="0"
                />
              </Field>

              <Field label="Effective From">
                <Input
                  type="date"
                  value={draft.effectiveFrom}
                  onChange={(e) => setDraft((s) => ({ ...s, effectiveFrom: e.target.value }))}
                />
              </Field>

              <Field label="Effective To">
                <Input
                  type="date"
                  value={draft.effectiveTo}
                  onChange={(e) => setDraft((s) => ({ ...s, effectiveTo: e.target.value }))}
                />
              </Field>
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => setDraft((s) => ({ ...s, isActive: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              Active split
            </label>

            <Field label="Notes">
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft((s) => ({ ...s, notes: e.target.value }))}
                placeholder="Optional split notes"
                className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={saving} className="gap-2">
              {saving ? "Saving..." : editing ? "Save changes" : "Create split"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}