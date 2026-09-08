"use client";

import * as React from "react";
import { Save, ShieldCheck } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";
import {
  useOvertimePolicy,
  useUpdateOvertimePolicy,
} from "@/logaxp/hooks/time-management/useTimePayroll";

import type {
  ApiResponse,
  OvertimePolicy,
  UpdateOvertimePolicyDto,
  OvertimeSource,
} from "@/logaxp/lib/time-management/timePayroll.types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  /** Optional: pass already-fetched response to avoid refetch */
  policy?: ApiResponse<OvertimePolicy> | null;

  busy?: boolean;
  onSaved?: () => void | Promise<void>;
};

type FormState = {
  source: OvertimeSource;
  weeklyThresholdHours: string;
  dailyThresholdHours: string; // empty => null
  doubleTimeDailyThresholdHours: string; // empty => null
  roundingMinutes: string;
  subtractBreaks: boolean;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function clampNum(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function parseNum(v: string, def: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function minutesToHoursString(fallback: number, min?: number | null) {
  const m =
    typeof min === "number" && Number.isFinite(min) ? min : fallback * 60;
  const h = m / 60;
  // keep clean (40, 7.5, etc)
  return String(Number.isInteger(h) ? h : Number(h.toFixed(2)));
}

function initFromPolicy(p?: OvertimePolicy | null): FormState {
  return {
    source: (p?.source ?? "CLOCKS") as OvertimeSource,
    weeklyThresholdHours: minutesToHoursString(40, p?.weeklyThresholdMinutes),
    dailyThresholdHours:
      p?.dailyThresholdMinutes == null
        ? ""
        : minutesToHoursString(8, p.dailyThresholdMinutes),
    doubleTimeDailyThresholdHours:
      p?.doubleTimeDailyThresholdMinutes == null
        ? ""
        : minutesToHoursString(12, p.doubleTimeDailyThresholdMinutes),
    roundingMinutes: String(p?.roundingMinutes ?? 1),
    subtractBreaks: Boolean(p?.subtractBreaks ?? true),
  };
}

export function OvertimePolicyDialog({
  open,
  onOpenChange,
  policy,
  busy,
  onSaved,
}: Props) {
  const { toast } = useTimeToast();

  // ✅ fetch only when open AND caller didn't pass policy
  const fetched = useOvertimePolicy(open && !policy);
  const effective = (policy ?? fetched.data) as
    | ApiResponse<OvertimePolicy>
    | undefined;
  const policyData = effective?.data ?? null;

  const updateM = useUpdateOvertimePolicy();

  const [state, setState] = React.useState<FormState>(() =>
    initFromPolicy(policyData),
  );
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    setError("");
    setState(initFromPolicy(policyData));
    // only re-init when dialog opens or policy actually changes
  }, [open, policyData?.id, policyData?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitting = Boolean(busy || fetched.isFetching || updateM.isPending);

  const submit = async () => {
    setError("");

    // hours -> minutes
    const weeklyH = clampNum(parseNum(state.weeklyThresholdHours, 40), 0, 168);
    const dailyH =
      state.dailyThresholdHours.trim() === ""
        ? null
        : clampNum(parseNum(state.dailyThresholdHours, 8), 0, 24);
    const dtDailyH =
      state.doubleTimeDailyThresholdHours.trim() === ""
        ? null
        : clampNum(parseNum(state.doubleTimeDailyThresholdHours, 12), 0, 24);

    const rounding = clampNum(parseNum(state.roundingMinutes, 1), 1, 60);

    if (
      !Number.isFinite(weeklyH) ||
      (dailyH !== null && !Number.isFinite(dailyH)) ||
      (dtDailyH !== null && !Number.isFinite(dtDailyH))
    ) {
      setError("Please enter valid numeric values.");
      return;
    }

    // Convert to minutes (support decimals like 7.5h)
    const dto: UpdateOvertimePolicyDto = {
      source: state.source,
      weeklyThresholdMinutes: Math.round(weeklyH * 60),
      dailyThresholdMinutes: dailyH === null ? null : Math.round(dailyH * 60),
      doubleTimeDailyThresholdMinutes:
        dtDailyH === null ? null : Math.round(dtDailyH * 60),
      roundingMinutes: rounding,
      subtractBreaks: state.subtractBreaks,
    };

    try {
      await updateM.mutateAsync(dto);

      toast({ tone: "success", title: "Overtime policy updated" });
      onOpenChange(false);
      await onSaved?.();
    } catch (e: any) {
      const msg = String(e?.message ?? "Failed to update overtime policy");
      setError(msg);
      toast({
        tone: "error",
        title: "Failed to update policy",
        description: msg,
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Overtime Policy"
      subtitle="Configure thresholds, rounding, and calculation source."
      widthClassName="max-w-3xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            <Save className="h-4 w-4" />
            Save policy
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" />
            Tenant-scoped
          </Badge>

          {policyData?.updatedAt ? (
            <Badge variant="muted" className="rounded-full">
              Updated: {String(policyData.updatedAt)}
            </Badge>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {/* Source + Subtract breaks */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
              Overtime source
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Choose whether overtime is computed from clocks, entries, or both.
            </div>

            <select
              value={state.source}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  source: e.target.value as OvertimeSource,
                }))
              }
              className={cx(
                "mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
                "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
                "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40",
              )}
            >
              <option value="CLOCKS">CLOCKS</option>
              <option value="ENTRIES">ENTRIES</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Subtract breaks
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  If enabled, break minutes reduce overtime-eligible time.
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.subtractBreaks}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      subtractBreaks: e.target.checked,
                    }))
                  }
                />
                <span className="text-slate-700 dark:text-slate-200">
                  {state.subtractBreaks ? "On" : "Off"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Thresholds */}
        <div className="grid gap-3 md:grid-cols-3">
          <Field
            label="Weekly threshold (hours)"
            hint="Overtime starts after this many hours in a week."
            value={state.weeklyThresholdHours}
            onChange={(v) =>
              setState((s) => ({ ...s, weeklyThresholdHours: v }))
            }
          />

          <Field
            label="Daily threshold (hours)"
            hint="Optional. Leave blank to disable daily overtime."
            value={state.dailyThresholdHours}
            onChange={(v) =>
              setState((s) => ({ ...s, dailyThresholdHours: v }))
            }
            placeholder="e.g. 8"
          />

          <Field
            label="Double-time daily (hours)"
            hint="Optional. Leave blank if you don't use double time."
            value={state.doubleTimeDailyThresholdHours}
            onChange={(v) =>
              setState((s) => ({ ...s, doubleTimeDailyThresholdHours: v }))
            }
            placeholder="e.g. 12"
          />
        </div>

        {/* Rounding */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Rounding (minutes)
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Round calculated overtime to nearest N minutes (commonly 1, 5, 15).
          </div>
          <input
            type="number"
            min={1}
            max={60}
            value={state.roundingMinutes}
            onChange={(e) =>
              setState((s) => ({ ...s, roundingMinutes: e.target.value }))
            }
            className={cx(
              "mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none",
              "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100",
              "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40",
            )}
          />
        </div>

        {fetched.isError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            Could not fetch current policy. You can still save your changes.
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
        {label}
      </div>
      {hint ? (
        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {hint}
        </div>
      ) : null}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
      />
    </div>
  );
}
