"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";

import type { EmployeeDetail } from "@/logaxp/lib/employee-management/employee-management.types";
import type {
  CompensationType,
  CreateEmployeeCompensationDto,
  EmployeeCompensation,
  UpdateEmployeeCompensationDto,
} from "@/logaxp/lib/employee-management/employee-payroll.types";
import { COMPENSATION_TYPE_VALUES } from "@/logaxp/lib/employee-management/employee-payroll.types";
import { useEmployeePayrollManagement } from "@/logaxp/hooks/useEmployeePayrollManagement";

import { Card, CardContent } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { Input } from "@/logaxp/components/ui/input";
import { Badge } from "@/logaxp/components/ui/badge";
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

function formatMoneyCents(cents?: number | null, currency = "USD") {
  if (cents === null || cents === undefined) return "—";
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

type Draft = {
  compensationType: CompensationType;
  currency: string;
  baseSalaryCents: string;
  hourlyRateCents: string;
  dailyRateCents: string;
  commissionPercent: string;
  bonusEligible: boolean;
  grade: string;
  band: string;
  step: string;
  effectiveFrom: string;
  effectiveTo: string;
  reason: string;
};

function toDraft(item?: EmployeeCompensation | null): Draft {
  return {
    compensationType: item?.compensationType ?? "SALARIED",
    currency: item?.currency ?? "USD",
    baseSalaryCents:
      item?.baseSalaryCents === null || item?.baseSalaryCents === undefined
        ? ""
        : String(item.baseSalaryCents),
    hourlyRateCents:
      item?.hourlyRateCents === null || item?.hourlyRateCents === undefined
        ? ""
        : String(item.hourlyRateCents),
    dailyRateCents:
      item?.dailyRateCents === null || item?.dailyRateCents === undefined
        ? ""
        : String(item.dailyRateCents),
    commissionPercent:
      item?.commissionPercent === null || item?.commissionPercent === undefined
        ? ""
        : String(item.commissionPercent),
    bonusEligible: item?.bonusEligible ?? false,
    grade: item?.grade ?? "",
    band: item?.band ?? "",
    step: item?.step ?? "",
    effectiveFrom: item?.effectiveFrom ? String(item.effectiveFrom).slice(0, 10) : "",
    effectiveTo: item?.effectiveTo ? String(item.effectiveTo).slice(0, 10) : "",
    reason: item?.reason ?? "",
  };
}

export function EmployeeCompensationsTab({
  employee,
}: {
  employee: EmployeeDetail;
}) {
  const payrollApi = useEmployeePayrollManagement();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [items, setItems] = React.useState<EmployeeCompensation[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeeCompensation | null>(null);
  const [draft, setDraft] = React.useState<Draft>(toDraft(null));

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await payrollApi.compensations.list(employee.id);
      const rows = unwrapApi(res) as EmployeeCompensation[];
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setItems([]);
      toast.error("Failed to load compensations");
    } finally {
      setLoading(false);
    }
  }, [employee.id, payrollApi.compensations]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setDraft(toDraft(null));
    setOpen(true);
  };

  const openEdit = (item: EmployeeCompensation) => {
    setEditing(item);
    setDraft(toDraft(item));
    setOpen(true);
  };

  const submit = async () => {
    try {
      setSaving(true);

      if (!draft.effectiveFrom.trim()) {
        toast.error("Effective from date is required");
        return;
      }

      if (!draft.baseSalaryCents && !draft.hourlyRateCents && !draft.dailyRateCents && !draft.commissionPercent) {
        toast.error("Enter at least one compensation amount or commission");
        return;
      }

      const basePayload = {
        compensationType: draft.compensationType,
        currency: draft.currency.trim() || "USD",
        ...(draft.baseSalaryCents.trim() ? { baseSalaryCents: Number(draft.baseSalaryCents) } : {}),
        ...(draft.hourlyRateCents.trim() ? { hourlyRateCents: Number(draft.hourlyRateCents) } : {}),
        ...(draft.dailyRateCents.trim() ? { dailyRateCents: Number(draft.dailyRateCents) } : {}),
        ...(draft.commissionPercent.trim() ? { commissionPercent: Number(draft.commissionPercent) } : {}),
        bonusEligible: draft.bonusEligible,
        ...(draft.grade.trim() ? { grade: draft.grade.trim() } : {}),
        ...(draft.band.trim() ? { band: draft.band.trim() } : {}),
        ...(draft.step.trim() ? { step: draft.step.trim() } : {}),
        effectiveFrom: draft.effectiveFrom,
        ...(draft.effectiveTo.trim() ? { effectiveTo: draft.effectiveTo } : {}),
        ...(draft.reason.trim() ? { reason: draft.reason.trim() } : {}),
      };

      if (editing) {
        const payload: UpdateEmployeeCompensationDto = basePayload;
        await payrollApi.compensations.update(editing.id, payload);
        toast.success("Compensation updated");
      } else {
        const payload: CreateEmployeeCompensationDto = {
          ...basePayload,
          effectiveFrom: draft.effectiveFrom,
        };
        await payrollApi.compensations.create(employee.id, payload);
        toast.success("Compensation created");
      }

      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save compensation");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: EmployeeCompensation) => {
    const ok = window.confirm("Delete this compensation record?");
    if (!ok) return;

    try {
      await payrollApi.compensations.remove(item.id);
      toast.success("Compensation removed");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove compensation");
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
          Add compensation
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <EmptyState
              title="No compensation records"
              description="Create effective-dated compensation records for salary, hourly rate, or commission."
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
                      <Badge variant="outline">{humanize(item.compensationType)}</Badge>
                      {item.bonusEligible ? <Badge variant="secondary">Bonus Eligible</Badge> : null}
                    </div>

                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatMoneyCents(item.baseSalaryCents, item.currency)}
                      {item.hourlyRateCents ? ` • Hourly ${formatMoneyCents(item.hourlyRateCents, item.currency)}` : ""}
                      {item.dailyRateCents ? ` • Daily ${formatMoneyCents(item.dailyRateCents, item.currency)}` : ""}
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Effective: {safeDate(item.effectiveFrom)} → {safeDate(item.effectiveTo)}
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Grade: {item.grade || "—"} • Band: {item.band || "—"} • Step: {item.step || "—"}
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Commission: {item.commissionPercent ?? "—"}
                    </div>

                    {item.reason ? (
                      <div className="text-sm text-slate-600 dark:text-slate-300">{item.reason}</div>
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
              <Wallet className="h-4 w-4" />
              {editing ? "Edit Compensation" : "Add Compensation"}
            </DialogTitle>
            <DialogDescription>
              Manage effective-dated compensation records for this employee.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Compensation Type">
                <select
                  value={draft.compensationType}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, compensationType: e.target.value as CompensationType }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  {COMPENSATION_TYPE_VALUES.map((x) => (
                    <option key={x} value={x}>
                      {humanize(x)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Currency">
                <Input
                  value={draft.currency}
                  onChange={(e) => setDraft((s) => ({ ...s, currency: e.target.value.toUpperCase() }))}
                  placeholder="USD"
                />
              </Field>

              <Field label="Base Salary (cents)">
                <Input
                  type="number"
                  value={draft.baseSalaryCents}
                  onChange={(e) => setDraft((s) => ({ ...s, baseSalaryCents: e.target.value }))}
                  placeholder="5000000"
                />
              </Field>

              <Field label="Hourly Rate (cents)">
                <Input
                  type="number"
                  value={draft.hourlyRateCents}
                  onChange={(e) => setDraft((s) => ({ ...s, hourlyRateCents: e.target.value }))}
                  placeholder="2500"
                />
              </Field>

              <Field label="Daily Rate (cents)">
                <Input
                  type="number"
                  value={draft.dailyRateCents}
                  onChange={(e) => setDraft((s) => ({ ...s, dailyRateCents: e.target.value }))}
                  placeholder="15000"
                />
              </Field>

              <Field label="Commission %">
                <Input
                  type="number"
                  value={draft.commissionPercent}
                  onChange={(e) => setDraft((s) => ({ ...s, commissionPercent: e.target.value }))}
                  placeholder="10"
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

              <Field label="Grade">
                <Input
                  value={draft.grade}
                  onChange={(e) => setDraft((s) => ({ ...s, grade: e.target.value }))}
                  placeholder="G7"
                />
              </Field>

              <Field label="Band">
                <Input
                  value={draft.band}
                  onChange={(e) => setDraft((s) => ({ ...s, band: e.target.value }))}
                  placeholder="Senior"
                />
              </Field>

              <Field label="Step">
                <Input
                  value={draft.step}
                  onChange={(e) => setDraft((s) => ({ ...s, step: e.target.value }))}
                  placeholder="Step 2"
                />
              </Field>
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <input
                type="checkbox"
                checked={draft.bonusEligible}
                onChange={(e) => setDraft((s) => ({ ...s, bonusEligible: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              Bonus eligible
            </label>

            <Field label="Reason">
              <textarea
                value={draft.reason}
                onChange={(e) => setDraft((s) => ({ ...s, reason: e.target.value }))}
                placeholder="Reason for this compensation setup/change"
                className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={saving} className="gap-2">
              {saving ? "Saving..." : editing ? "Save changes" : "Create compensation"}
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