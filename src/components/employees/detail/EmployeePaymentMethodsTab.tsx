"use client";

import * as React from "react";
import { CreditCard, Landmark, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";

import type { EmployeeDetail } from "@/logaxp/lib/employee-management/employee-management.types";
import type {
  BankAccountType,
  CreateEmployeePaymentMethodDto,
  EmployeePaymentMethod,
  PaymentMethodType,
  UpdateEmployeePaymentMethodDto,
} from "@/logaxp/lib/employee-management/employee-payroll.types";
import {
  BANK_ACCOUNT_TYPE_VALUES,
  PAYMENT_METHOD_TYPE_VALUES,
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

type Draft = {
  type: PaymentMethodType;
  label: string;
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  accountType: BankAccountType | "";
  routingNumber: string;
  swiftCode: string;
  iban: string;
  providerName: string;
  walletNumber: string;
  isPrimary: boolean;
  isActive: boolean;
  verificationStatus: string;
  notes: string;
};

function toDraft(item?: EmployeePaymentMethod | null): Draft {
  return {
    type: item?.type ?? "BANK_ACCOUNT",
    label: item?.label ?? "",
    bankName: item?.bankName ?? "",
    bankCode: item?.bankCode ?? "",
    accountName: item?.accountName ?? "",
    accountNumber: item?.accountNumber ?? "",
    accountType: (item?.accountType ?? "") as BankAccountType | "",
    routingNumber: item?.routingNumber ?? "",
    swiftCode: item?.swiftCode ?? "",
    iban: item?.iban ?? "",
    providerName: item?.providerName ?? "",
    walletNumber: item?.walletNumber ?? "",
    isPrimary: item?.isPrimary ?? false,
    isActive: item?.isActive ?? true,
    verificationStatus: item?.verificationStatus ?? "",
    notes: item?.notes ?? "",
  };
}

export function EmployeePaymentMethodsTab({
  employee,
}: {
  employee: EmployeeDetail;
}) {
  const payrollApi = useEmployeePayrollManagement();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [items, setItems] = React.useState<EmployeePaymentMethod[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeePaymentMethod | null>(null);
  const [draft, setDraft] = React.useState<Draft>(toDraft(null));

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await payrollApi.paymentMethods.list(employee.id, { includeInactive: true });
      const rows = unwrapApi(res) as EmployeePaymentMethod[];
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setItems([]);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, [employee.id, payrollApi.paymentMethods]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setDraft(toDraft(null));
    setOpen(true);
  };

  const openEdit = (item: EmployeePaymentMethod) => {
    setEditing(item);
    setDraft(toDraft(item));
    setOpen(true);
  };

  const isBank = draft.type === "BANK_ACCOUNT";
  const isWallet = draft.type === "MOBILE_MONEY";

  const submit = async () => {
    try {
      setSaving(true);

      const basePayload = {
        type: draft.type,
        ...(draft.label.trim() ? { label: draft.label.trim() } : {}),
        ...(draft.bankName.trim() ? { bankName: draft.bankName.trim() } : {}),
        ...(draft.bankCode.trim() ? { bankCode: draft.bankCode.trim() } : {}),
        ...(draft.accountName.trim() ? { accountName: draft.accountName.trim() } : {}),
        ...(draft.accountNumber.trim() ? { accountNumber: draft.accountNumber.trim() } : {}),
        ...(draft.accountType ? { accountType: draft.accountType } : {}),
        ...(draft.routingNumber.trim() ? { routingNumber: draft.routingNumber.trim() } : {}),
        ...(draft.swiftCode.trim() ? { swiftCode: draft.swiftCode.trim() } : {}),
        ...(draft.iban.trim() ? { iban: draft.iban.trim() } : {}),
        ...(draft.providerName.trim() ? { providerName: draft.providerName.trim() } : {}),
        ...(draft.walletNumber.trim() ? { walletNumber: draft.walletNumber.trim() } : {}),
        isPrimary: draft.isPrimary,
        isActive: draft.isActive,
        ...(draft.verificationStatus.trim()
          ? { verificationStatus: draft.verificationStatus.trim() }
          : {}),
        ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
      };

      if (editing) {
        const payload: UpdateEmployeePaymentMethodDto = basePayload;
        await payrollApi.paymentMethods.update(editing.id, payload);
        toast.success("Payment method updated");
      } else {
        const payload: CreateEmployeePaymentMethodDto = basePayload;
        await payrollApi.paymentMethods.create(employee.id, payload);
        toast.success("Payment method created");
      }

      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save payment method");
    } finally {
      setSaving(false);
    }
  };

  const setPrimary = async (item: EmployeePaymentMethod) => {
    try {
      await payrollApi.paymentMethods.setPrimary(item.id);
      toast.success("Primary payment method updated");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to set primary payment method");
    }
  };

  const remove = async (item: EmployeePaymentMethod) => {
    const ok = window.confirm("Delete this payment method?");
    if (!ok) return;

    try {
      await payrollApi.paymentMethods.remove(item.id);
      toast.success("Payment method removed");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove payment method");
    }
  };

  if (loading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add payment method
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <EmptyState
              title="No payment methods"
              description="Add bank accounts, mobile money, or other payout destinations for this employee."
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
                      <Badge variant="outline">{humanize(item.type)}</Badge>
                      {item.isPrimary ? <Badge variant="secondary">Primary</Badge> : null}
                      {!item.isActive ? <Badge variant="outline">Inactive</Badge> : null}
                    </div>

                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {item.label || item.bankName || item.providerName || "Payment Method"}
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {item.type === "BANK_ACCOUNT"
                        ? `${item.accountName || "—"} • ****${item.accountNumberLast4 || "—"}`
                        : item.type === "MOBILE_MONEY"
                        ? `${item.providerName || "—"} • ${item.walletNumber || "—"}`
                        : item.notes || "—"}
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Verification: {item.verificationStatus || "—"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!item.isPrimary && item.isActive ? (
                      <Button variant="outline" onClick={() => void setPrimary(item)} className="gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Make primary
                      </Button>
                    ) : null}

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
              <CreditCard className="h-4 w-4" />
              {editing ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              Configure how the employee receives payroll payouts.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Method Type">
                <select
                  value={draft.type}
                  onChange={(e) => setDraft((s) => ({ ...s, type: e.target.value as PaymentMethodType }))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  {PAYMENT_METHOD_TYPE_VALUES.map((x) => (
                    <option key={x} value={x}>
                      {humanize(x)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Label">
                <Input
                  value={draft.label}
                  onChange={(e) => setDraft((s) => ({ ...s, label: e.target.value }))}
                  placeholder="Primary Salary Account"
                />
              </Field>
            </div>

            {isBank ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Bank Name">
                  <Input value={draft.bankName} onChange={(e) => setDraft((s) => ({ ...s, bankName: e.target.value }))} />
                </Field>
                <Field label="Bank Code">
                  <Input value={draft.bankCode} onChange={(e) => setDraft((s) => ({ ...s, bankCode: e.target.value }))} />
                </Field>
                <Field label="Account Name">
                  <Input value={draft.accountName} onChange={(e) => setDraft((s) => ({ ...s, accountName: e.target.value }))} />
                </Field>
                <Field label="Account Number">
                  <Input value={draft.accountNumber} onChange={(e) => setDraft((s) => ({ ...s, accountNumber: e.target.value }))} />
                </Field>
                <Field label="Account Type">
                  <select
                    value={draft.accountType}
                    onChange={(e) => setDraft((s) => ({ ...s, accountType: e.target.value as BankAccountType | "" }))}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="">Select account type</option>
                    {BANK_ACCOUNT_TYPE_VALUES.map((x) => (
                      <option key={x} value={x}>
                        {humanize(x)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Routing Number">
                  <Input value={draft.routingNumber} onChange={(e) => setDraft((s) => ({ ...s, routingNumber: e.target.value }))} />
                </Field>
                <Field label="SWIFT Code">
                  <Input value={draft.swiftCode} onChange={(e) => setDraft((s) => ({ ...s, swiftCode: e.target.value }))} />
                </Field>
                <Field label="IBAN">
                  <Input value={draft.iban} onChange={(e) => setDraft((s) => ({ ...s, iban: e.target.value }))} />
                </Field>
              </div>
            ) : null}

            {isWallet ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Provider Name">
                  <Input value={draft.providerName} onChange={(e) => setDraft((s) => ({ ...s, providerName: e.target.value }))} />
                </Field>
                <Field label="Wallet Number">
                  <Input value={draft.walletNumber} onChange={(e) => setDraft((s) => ({ ...s, walletNumber: e.target.value }))} />
                </Field>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Verification Status">
                <Input
                  value={draft.verificationStatus}
                  onChange={(e) => setDraft((s) => ({ ...s, verificationStatus: e.target.value }))}
                  placeholder="VERIFIED / PENDING / MANUAL"
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={draft.isPrimary}
                  onChange={(e) => setDraft((s) => ({ ...s, isPrimary: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                Primary payout method
              </label>

              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft((s) => ({ ...s, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                Active
              </label>
            </div>

            <Field label="Notes">
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft((s) => ({ ...s, notes: e.target.value }))}
                placeholder="Optional payout notes"
                className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={saving} className="gap-2">
              {saving ? "Saving..." : editing ? "Save changes" : "Create payment method"}
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