"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";

import { TimeShell } from "@/logaxp/components/time-management/TimeShell";
import { TimeHeroCard } from "@/logaxp/components/time-management/TimeHeroCard";
import { PayrollNavCards } from "@/logaxp/components/time-management/payroll/PayrollNavCards";
import { TimeSettingsForm } from "@/logaxp/components/time-management/payroll/TimeSettingsForm";

import { useTimeSettings, useUpdateTimeSettings } from "@/logaxp/hooks/time-management/useTimeAdmin";
import { useTimeToast } from "@/logaxp/components/time-management/feedback/useTimeToast";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function PayrollSettingsPage() {
  const qc = useQueryClient();
  const { toast } = useTimeToast();

  const q = useTimeSettings();
  const saveM = useUpdateTimeSettings();

  const busy = q.isFetching || saveM.isPending;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["time-settings"] });
    await qc.invalidateQueries({ queryKey: ["time"] as any });
  };

  const value = q.data?.data ?? null;

  return (
    <TimeShell
      title="Time Settings"
      subtitle="Tenant-scoped rules that govern attendance UX and payroll boundaries."
      pill="Time • Payroll • Settings"
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
          title="Payroll Admin"
          description="Use these controls to standardize time capture and payroll calculations."
        />

        <PayrollNavCards />

        {q.isLoading ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">Loading settings…</CardContent>
          </Card>
        ) : q.isError || !value ? (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">Failed to load time settings.</CardContent>
          </Card>
        ) : (
          <TimeSettingsForm
            value={value}
            busy={busy}
            onSave={async (dto) => {
              await saveM.mutateAsync(dto);
              toast({ tone: "success", title: "Settings saved" });
              await refresh();
            }}
          />
        )}
      </div>
    </TimeShell>
  );
}