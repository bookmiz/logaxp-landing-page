"use client";

import * as React from "react";
import { Landmark, Save } from "lucide-react";

import type { EmployeeDetail } from "@/logaxp/lib/employee-management/employee-management.types";
import type {
  CompensationType,
  EmployeePayrollProfile,
  PayrollProfileStatus,
  PayFrequency,
  UpsertEmployeePayrollProfileDto,
} from "@/logaxp/lib/employee-management/employee-payroll.types";
import {
  COMPENSATION_TYPE_VALUES,
  PAYROLL_PROFILE_STATUS_VALUES,
  PAY_FREQUENCY_VALUES,
} from "@/logaxp/lib/employee-management/employee-payroll.types";

import { useEmployeePayrollManagement } from "@/logaxp/hooks/useEmployeePayrollManagement";
import { Card, CardContent } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { LoadingSkeleton } from "@/logaxp/components/ui/loading-skeleton";
import { Input } from "@/logaxp/components/ui/input";
import { toast } from "@/logaxp/components/ui/toast";

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
  status: PayrollProfileStatus;
  compensationType: CompensationType;
  payFrequency: PayFrequency | "";
  currency: string;
  defaultHoursPerWeek: string;
  overtimeEligible: boolean;
  payrollGroup: string;
  workerCategory: string;
  standardRateCents: string;
  costRateCents: string;
  notes: string;
};

function toDraft(profile: EmployeePayrollProfile | null): Draft {
  return {
    status: profile?.status ?? "ACTIVE",
    compensationType: profile?.compensationType ?? "SALARIED",
    payFrequency: (profile?.payFrequency ?? "") as PayFrequency | "",
    currency: profile?.currency ?? "USD",
    defaultHoursPerWeek:
      profile?.defaultHoursPerWeek === null || profile?.defaultHoursPerWeek === undefined
        ? ""
        : String(profile.defaultHoursPerWeek),
    overtimeEligible: profile?.overtimeEligible ?? false,
    payrollGroup: profile?.payrollGroup ?? "",
    workerCategory: profile?.workerCategory ?? "",
    standardRateCents:
      profile?.standardRateCents === null || profile?.standardRateCents === undefined
        ? ""
        : String(profile.standardRateCents),
    costRateCents:
      profile?.costRateCents === null || profile?.costRateCents === undefined
        ? ""
        : String(profile.costRateCents),
    notes: profile?.notes ?? "",
  };
}

export function EmployeePayrollProfileTab({
  employee,
  onRefresh,
}: {
  employee: EmployeeDetail;
  onRefresh?: () => void | Promise<void>;
}) {
  const payrollApi = useEmployeePayrollManagement();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [profile, setProfile] = React.useState<EmployeePayrollProfile | null>(null);
  const [draft, setDraft] = React.useState<Draft>(toDraft(null));

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await payrollApi.payrollProfile.get(employee.id);
      const data = unwrapApi(res) as EmployeePayrollProfile | null;
      setProfile(data);
      setDraft(toDraft(data));
    } catch (e) {
      console.error(e);
      setProfile(null);
      setDraft(toDraft(null));
      toast.error("Failed to load payroll profile");
    } finally {
      setLoading(false);
    }
  }, [employee.id, payrollApi.payrollProfile]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    try {
      setSaving(true);

      const payload: UpsertEmployeePayrollProfileDto = {
        status: draft.status,
        compensationType: draft.compensationType,
        ...(draft.payFrequency ? { payFrequency: draft.payFrequency } : {}),
        currency: draft.currency.trim() || "USD",
        ...(draft.defaultHoursPerWeek.trim()
          ? { defaultHoursPerWeek: Number(draft.defaultHoursPerWeek) }
          : {}),
        overtimeEligible: draft.overtimeEligible,
        ...(draft.payrollGroup.trim() ? { payrollGroup: draft.payrollGroup.trim() } : {}),
        ...(draft.workerCategory.trim() ? { workerCategory: draft.workerCategory.trim() } : {}),
        ...(draft.standardRateCents.trim()
          ? { standardRateCents: Number(draft.standardRateCents) }
          : {}),
        ...(draft.costRateCents.trim() ? { costRateCents: Number(draft.costRateCents) } : {}),
        ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
      };

      const res = await payrollApi.payrollProfile.upsert(employee.id, payload);
      const saved = unwrapApi(res) as EmployeePayrollProfile;

      setProfile(saved);
      setDraft(toDraft(saved));
      toast.success("Payroll profile saved");
      await onRefresh?.();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save payroll profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-4">
      {!profile ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-5">
            <EmptyState
              title="No payroll profile yet"
              description="Configure this employee’s payroll basis, pay frequency, and rate defaults."
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Profile Status">
                <select
                  value={draft.status}
                  onChange={(e) => setDraft((s) => ({ ...s, status: e.target.value as PayrollProfileStatus }))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  {PAYROLL_PROFILE_STATUS_VALUES.map((x) => (
                    <option key={x} value={x}>
                      {humanize(x)}
                    </option>
                  ))}
                </select>
              </Field>

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

              <Field label="Pay Frequency">
                <select
                  value={draft.payFrequency}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, payFrequency: e.target.value as PayFrequency | "" }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="">Inherited / None</option>
                  {PAY_FREQUENCY_VALUES.map((x) => (
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

              <Field label="Default Hours / Week">
                <Input
                  type="number"
                  value={draft.defaultHoursPerWeek}
                  onChange={(e) => setDraft((s) => ({ ...s, defaultHoursPerWeek: e.target.value }))}
                  placeholder="40"
                />
              </Field>

              <Field label="Payroll Group">
                <Input
                  value={draft.payrollGroup}
                  onChange={(e) => setDraft((s) => ({ ...s, payrollGroup: e.target.value }))}
                  placeholder="Monthly Staff"
                />
              </Field>

              <Field label="Worker Category">
                <Input
                  value={draft.workerCategory}
                  onChange={(e) => setDraft((s) => ({ ...s, workerCategory: e.target.value }))}
                  placeholder="Permanent"
                />
              </Field>

              <Field label="Standard Rate (cents)">
                <Input
                  type="number"
                  value={draft.standardRateCents}
                  onChange={(e) => setDraft((s) => ({ ...s, standardRateCents: e.target.value }))}
                  placeholder="500000"
                />
              </Field>

              <Field label="Cost Rate (cents)">
                <Input
                  type="number"
                  value={draft.costRateCents}
                  onChange={(e) => setDraft((s) => ({ ...s, costRateCents: e.target.value }))}
                  placeholder="450000"
                />
              </Field>
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <input
                type="checkbox"
                checked={draft.overtimeEligible}
                onChange={(e) => setDraft((s) => ({ ...s, overtimeEligible: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              Overtime eligible
            </label>

            <Field label="Notes">
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft((s) => ({ ...s, notes: e.target.value }))}
                placeholder="Optional payroll notes"
                className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </Field>

            <div className="flex justify-end">
              <Button onClick={() => void submit()} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save payroll profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Landmark className="h-4 w-4" />
              Current Snapshot
            </div>

            <KeyValue label="Employee" value={`${employee.firstName} ${employee.lastName}`} />
            <KeyValue label="Status" value={humanize(draft.status)} />
            <KeyValue label="Compensation Type" value={humanize(draft.compensationType)} />
            <KeyValue label="Pay Frequency" value={humanize(draft.payFrequency || "INHERITED")} />
            <KeyValue label="Currency" value={draft.currency || "USD"} />
            <KeyValue
              label="Overtime Eligible"
              value={draft.overtimeEligible ? "Yes" : "No"}
            />
            <KeyValue
              label="Default Hours / Week"
              value={draft.defaultHoursPerWeek || "—"}
            />
            <KeyValue label="Payroll Group" value={draft.payrollGroup || "—"} />
            <KeyValue label="Worker Category" value={draft.workerCategory || "—"} />
            <KeyValue label="Standard Rate (cents)" value={draft.standardRateCents || "—"} />
            <KeyValue label="Cost Rate (cents)" value={draft.costRateCents || "—"} />
          </CardContent>
        </Card>
      </div>
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

function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-b-0 dark:border-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}