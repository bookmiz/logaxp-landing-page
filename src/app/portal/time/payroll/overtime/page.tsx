"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { PayrollNavCards } from "@/logaxp/components/time-management/payroll/PayrollNavCards";
import { OvertimePolicyForm } from "@/logaxp/components/time-management/payroll/OvertimePolicyForm";
import { OvertimeCalcPanel } from "@/logaxp/components/time-management/payroll/OvertimeCalcPanel";

import { useOvertimePolicy, useUpdateOvertimePolicy, useCalcOvertime } from "@/logaxp/hooks/time-management/useTimeAdmin";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function PayrollOvertimePage() {
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const policyQ = useOvertimePolicy();
  const saveM = useUpdateOvertimePolicy();
  const calcM = useCalcOvertime();

  const busy = policyQ.isFetching || saveM.isPending || calcM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["overtime-policy"] });
    await qc.invalidateQueries({ queryKey: ["timesheets"] });
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  const policy = policyQ.data?.data ?? null;
  const result = calcM.data?.data ?? null;

  return (
    <TimeShell
      title="Overtime"
      subtitle="Policy configuration + official calculator (server-side)."
      pill="Time • Payroll • Overtime"
      actions={
        <Button variant="outline" onClick={refresh} disabled={busy}>
          <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
          Refresh
        </Button>
      }
      requiredAnyCapabilities={["portal.time"]}
    >
      <div className="space-y-5">
        <TimeHeroCard
          title="Overtime & Double Time"
          description="Configured per tenant. Used by timesheets and payroll exports."
        />

        <PayrollNavCards />

        {policyQ.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading overtime policy…</CardContent>
          </Card>
        ) : policyQ.isError || !policy ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load overtime policy.</CardContent>
          </Card>
        ) : (
          <OvertimePolicyForm
            value={policy}
            busy={busy}
            onSave={async (dto) => {
              await saveM.mutateAsync(dto);
              toast({ tone: "success", title: "Overtime policy saved" });
              await refresh();
            }}
          />
        )}

        <OvertimeCalcPanel
          busy={busy}
          result={result}
          onCalc={async (dto) => {
            await calcM.mutateAsync(dto as any);
            toast({ tone: "success", title: "Overtime calculated" });
          }}
        />
      </div>
    </TimeShell>
  );
}