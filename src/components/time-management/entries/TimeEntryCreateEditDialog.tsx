"use client";

import * as React from "react";
import { Save, Sparkles } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";

import type {
  TimeEntry,
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
  TimeEntrySource,
} from "@/logaxp/lib/time-management/timeManagement.types";
import { fetchEmployees } from "@/logaxp/components/time-management/pickers/employeePickers";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";
import {
  computeDurationMinutes,
  toIsoFromDateTimeLocal,
  toDateTimeLocalFromIso,
} from "./timeEntry.utils";
import { formatMinutes } from "@/logaxp/components/time-management/time.ui";

import { AsyncSelect } from "@/logaxp/components/time-management/pickers/AsyncSelect";
import { fetchProjects, fetchWorkItems } from "@/logaxp/components/time-management/pickers/projectPickers";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  entry?: TimeEntry | null;

  membershipId?: string | null;
  defaultEmployeeId?: string | null;

  busy?: boolean;
  onCreate: (dto: CreateTimeEntryDto) => void | Promise<void>;
  onUpdate: (id: string, dto: UpdateTimeEntryDto) => void | Promise<void>;
};

type FormState = {
  employeeId: string;
  projectId: string;
  workItemId: string;
  source: TimeEntrySource | "";
  billable: boolean;
  startAtLocal: string;
  endAtLocal: string;
  durationMinutes: string;
  notes: string;
};

function initState(entry?: TimeEntry | null, defaultEmployeeId?: string | null): FormState {
  return {
    employeeId: String(entry?.employeeId ?? defaultEmployeeId ?? ""),
    projectId: String(entry?.projectId ?? ""),
    workItemId: String(entry?.workItemId ?? ""),
    source: (entry?.source as any) ?? "",
    billable: Boolean(entry?.billable ?? false),
    startAtLocal: toDateTimeLocalFromIso(entry?.startAt ?? null),
    endAtLocal: toDateTimeLocalFromIso(entry?.endAt ?? null),
    durationMinutes: entry?.durationMinutes != null ? String(entry.durationMinutes) : "",
    notes: String(entry?.notes ?? ""),
  };
}

export function TimeEntryCreateEditDialog({
  open,
  onOpenChange,
  mode,
  entry,
  membershipId,
  defaultEmployeeId,
  busy,
  onCreate,
  onUpdate,
}: Props) {
  const [state, setState] = React.useState<FormState>(() => initState(entry, defaultEmployeeId));
  const [error, setError] = React.useState<string>("");

  const { toast } = useTimeToast();
  const [manualIds, setManualIds] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setState(initState(entry, defaultEmployeeId));
    setError("");
    // keep manualIds as user's preference; don’t reset
  }, [open, entry, defaultEmployeeId]);

  const computedDuration = React.useMemo(() => {
    const startIso = toIsoFromDateTimeLocal(state.startAtLocal);
    const endIso = toIsoFromDateTimeLocal(state.endAtLocal);
    return computeDurationMinutes(startIso, endIso);
  }, [state.startAtLocal, state.endAtLocal]);

  const effectiveDuration = React.useMemo(() => {
    const v = state.durationMinutes ? Number(state.durationMinutes) : null;
    if (v && Number.isFinite(v) && v > 0) return v;
    return computedDuration;
  }, [state.durationMinutes, computedDuration]);

  const submit = async () => {
    setError("");

    const startAt = toIsoFromDateTimeLocal(state.startAtLocal);
    const endAt = toIsoFromDateTimeLocal(state.endAtLocal);

    const duration = effectiveDuration ?? null;
    if (!duration || duration <= 0) {
      setError("Provide a duration (minutes) OR provide both start and end times.");
      toast({
        tone: "warning",
        title: "Validation",
        description: "Duration is required (minutes or start/end).",
      });
      return;
    }

    const base = {
      employeeId: state.employeeId || undefined,
      membershipId: membershipId || undefined,

      projectId: state.projectId || undefined,
      workItemId: state.workItemId || undefined,

      source: (state.source || undefined) as any,
      billable: state.billable,

      startAt: startAt ?? undefined,
      endAt: endAt ?? undefined,
      durationMinutes: duration ?? undefined,

      notes: state.notes || undefined,
    };

    try {
      if (mode === "create") {
        await onCreate(base as CreateTimeEntryDto);
        toast({ tone: "success", title: "Entry created" });
        onOpenChange(false);
        return;
      }

      if (!entry?.id) {
        setError("Missing entry id.");
        toast({ tone: "error", title: "Failed", description: "Missing entry id." });
        return;
      }

      // Update DTO excludes source (per your FE types)
      const updateDto: UpdateTimeEntryDto = {
        employeeId: base.employeeId ?? null,
        membershipId: base.membershipId ?? null,

        projectId: base.projectId ?? null,
        workItemId: base.workItemId ?? null,

        startAt: base.startAt ?? null,
        endAt: base.endAt ?? null,
        durationMinutes: base.durationMinutes,

        billable: base.billable,
        notes: base.notes ?? null,
      };

      await onUpdate(entry.id, updateDto);
      toast({ tone: "success", title: "Entry updated" });
      onOpenChange(false);
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "Please retry.";
      setError("Request failed. " + msg);
      toast({ tone: "error", title: "Action failed", description: msg });
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={mode === "create" ? "New Time Entry" : "Edit Time Entry"}
      subtitle="Professional-grade manual entry with validation and duration intelligence."
      widthClassName="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <Save className="h-4 w-4" />
            {mode === "create" ? "Create entry" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            {mode === "create" ? "Create" : "Edit"}
          </Badge>
          <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            Effective: {formatMinutes(effectiveDuration ?? 0)}
          </Badge>
          {computedDuration != null && !state.durationMinutes ? (
            <Badge variant="muted" className="rounded-full">
              Computed: {computedDuration}m
            </Badge>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          {/* Employee */}
          {/* Employee (Picker + Manual toggle) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Employee</div>
              <button
                type="button"
                onClick={() => setManualIds((v) => !v)}
                className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                {manualIds ? "Use picker" : "Manual ID"}
              </button>
            </div>

            {manualIds ? (
              <input
                value={state.employeeId}
                onChange={(e) => setState((s) => ({ ...s, employeeId: e.target.value }))}
                placeholder="employeeId…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              />
            ) : (
              <AsyncSelect
                valueId={state.employeeId || null}
                valueLabel={state.employeeId ? `Employee ${state.employeeId}` : null}
                placeholder="Select an employee…"
                fetcher={fetchEmployees}
                onSelect={(it) => setState((s) => ({ ...s, employeeId: it?.id ?? "" }))}
                allowClear
              />
            )}
          </div>

          {/* Source */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Source</div>
            <select
              value={state.source}
              onChange={(e) => setState((s) => ({ ...s, source: e.target.value as any }))}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            >
              <option value="">(default)</option>
              <option value="MANUAL">MANUAL</option>
              <option value="TIMER">TIMER</option>
              <option value="CLOCK">CLOCK</option>
              <option value="IMPORT">IMPORT</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>

          {/* Project (Picker + Manual toggle) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Project</div>
              <button
                type="button"
                onClick={() => setManualIds((v) => !v)}
                className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                {manualIds ? "Use picker" : "Manual ID"}
              </button>
            </div>

            {manualIds ? (
              <input
                value={state.projectId}
                onChange={(e) => setState((s) => ({ ...s, projectId: e.target.value }))}
                placeholder="projectId…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              />
            ) : (
              <AsyncSelect
                valueId={state.projectId || null}
                valueLabel={state.projectId ? `Project ${state.projectId}` : null}
                placeholder="Select a project…"
                fetcher={fetchProjects}
                onSelect={(it) => {
                  setState((s) => ({
                    ...s,
                    projectId: it?.id ?? "",
                    // if project changes, clear work item for safety
                    workItemId: "",
                  }));
                }}
                allowClear
              />
            )}
          </div>

          {/* Work Item */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Work Item</div>

            {manualIds ? (
              <input
                value={state.workItemId}
                onChange={(e) => setState((s) => ({ ...s, workItemId: e.target.value }))}
                placeholder="workItemId…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              />
            ) : (
              <AsyncSelect
                valueId={state.workItemId || null}
                valueLabel={state.workItemId ? `WorkItem ${state.workItemId}` : null}
                placeholder={state.projectId ? "Select a work item…" : "Select a project first (optional)"}
                fetcher={(q) => fetchWorkItems({ q, projectId: state.projectId || null })}
                onSelect={(it) => setState((s) => ({ ...s, workItemId: it?.id ?? "" }))}
                allowClear
              />
            )}
          </div>

          {/* Start */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Start time (optional)</div>
            <input
              type="datetime-local"
              value={state.startAtLocal}
              onChange={(e) => setState((s) => ({ ...s, startAtLocal: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          {/* End */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">End time (optional)</div>
            <input
              type="datetime-local"
              value={state.endAtLocal}
              onChange={(e) => setState((s) => ({ ...s, endAtLocal: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Duration (minutes)</div>
            <input
              type="number"
              min={0}
              value={state.durationMinutes}
              onChange={(e) => setState((s) => ({ ...s, durationMinutes: e.target.value }))}
              placeholder={computedDuration != null ? `Auto: ${computedDuration}` : "e.g. 90"}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
            />
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              If you provide start/end, duration is auto-computed unless you override it.
            </div>
          </div>

          {/* Billable */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Billable</div>
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                checked={state.billable}
                onChange={(e) => setState((s) => ({ ...s, billable: e.target.checked }))}
              />
              Bill this time
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Notes</div>
          <textarea
            value={state.notes}
            onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Add context…"
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
          />
        </div>
      </div>
    </Modal>
  );
}