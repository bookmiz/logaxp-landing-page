"use client";

import * as React from "react";
import { Save, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";

export function GeneratePayPeriodsDialog({
  open,
  onOpenChange,
  busy,
  onGenerate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  busy?: boolean;
  onGenerate: (dto: { startAt: string; monthsAhead: number }) => void | Promise<void>;
}) {
  const [startDateLocal, setStartDateLocal] = React.useState(""); // "YYYY-MM-DD"
  const [monthsAhead, setMonthsAhead] = React.useState("6");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    // Optional: default to first of current month
    const today = new Date();
    const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10); // "YYYY-MM-DD"
    setStartDateLocal(defaultStart);
    setMonthsAhead("6");
    setError("");
  }, [open]);

  const submit = async () => {
    setError("");

    if (!startDateLocal) {
      return setError("Please select a start date.");
    }

    const m = Number(monthsAhead);
    if (!Number.isInteger(m) || m <= 0 || m > 36) { // reasonable cap
      return setError("Months ahead must be a positive number (1–36).");
    }

    // Convert local YYYY-MM-DD to UTC midnight ISO
    const startAtIso = `${startDateLocal}T00:00:00.000Z`;

    await onGenerate({ startAt: startAtIso, monthsAhead: m });
    onOpenChange(false);
  };

  // Optional preview of what the ISO will be
  const previewStart = startDateLocal
    ? new Date(`${startDateLocal}T00:00:00Z`).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Generate pay periods"
      subtitle="Create future pay periods starting from a chosen date. Used for payroll processing and lock enforcement."
      widthClassName="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !startDateLocal}>
            <Save className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Payroll • Pay Periods
          </Badge>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* Start Date – native date picker */}
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Start date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDateLocal}
              onChange={(e) => setStartDateLocal(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500/70 dark:focus:ring-emerald-950/30"
            />
            {previewStart && (
              <p className="text-xs text-muted-foreground mt-1">
                Starts on: <span className="font-medium">{previewStart}</span>
              </p>
            )}
          </div>

          {/* Months Ahead */}
          <div className="space-y-2">
            <label htmlFor="monthsAhead" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Generate months ahead
            </label>
            <input
              id="monthsAhead"
              type="number"
              min={1}
              max={36}
              step={1}
              value={monthsAhead}
              onChange={(e) => setMonthsAhead(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500/70 dark:focus:ring-emerald-950/30"
              placeholder="e.g. 6"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Common: 6, 12, or 24 months
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground italic">
          Pay periods will start at midnight UTC on the selected date and generate forward.
        </div>
      </div>
    </Modal>
  );
}