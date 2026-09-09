"use client";

import * as React from "react";
import { RefreshCcw, CalendarDays, Wand2, ShieldAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";

import { ScheduleShell } from "@/logaxp/components/scheduling/ScheduleShell";

import { ScheduleBanner } from "@/logaxp/components/scheduling/feedback/ScheduleBanner";

import { useScheduleSettings } from "@/logaxp/hooks/scheduling/useScheduleSettings";
import { useScheduleTemplates } from "@/logaxp/hooks/scheduling/useScheduleTemplates";
import { useScheduleAssignments } from "@/logaxp/hooks/scheduling/useScheduleAssignments";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function PortalScheduleHomePage() {
  const qc = useQueryClient();
  const settingsQ = useScheduleSettings(true);
  const templatesQ = useScheduleTemplates(true);
  const assignmentsQ = useScheduleAssignments(undefined, true);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["schedule"] as any });
  };

  const settings = settingsQ.data?.data ?? null;
  const templates = (templatesQ.data?.data as any)?.items ?? (Array.isArray(templatesQ.data?.data) ? templatesQ.data?.data : []);
  const assignments = (assignmentsQ.data?.data as any)?.items ?? (Array.isArray(assignmentsQ.data?.data) ? assignmentsQ.data?.data : []);

  const loading = settingsQ.isLoading || templatesQ.isLoading || assignmentsQ.isLoading;

  return (
    <ScheduleShell
      title="Scheduling"
      subtitle="Plan shifts, assign teams and check scheduling conflicts."
      pill="People • Scheduling"
      actions={
        <Button variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      }
      requiredAnyCapabilities={["portal.schedule"]}
    >
      <div className="space-y-5">


        {!settings ? (
          <ScheduleBanner tone="warning" title="Schedule settings not found">
            We could not load your scheduling settings. Refresh this page to try again.
          </ScheduleBanner>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-3">
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                Settings
              </CardTitle>
              <CardDescription>Timezone + policy</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-200">
              <div>Timezone: <span className="font-medium">{String(settings?.timezone ?? "—")}</span></div>
              <div className="mt-1">Min rest: <span className="font-medium">{Number(settings?.minRestMinutes ?? 0)}m</span></div>
              <div className="mt-1">Max shift: <span className="font-medium">{Number(settings?.maxShiftMinutes ?? 0)}m</span></div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="h-4 w-4" />
                Templates
              </CardTitle>
              <CardDescription>Reusable weekly / rotating rules</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-200">
              <div>Total templates: <span className="font-medium">{templates?.length ?? 0}</span></div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Create templates, then assign to employees / org units.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4" />
                Assignments
              </CardTitle>
              <CardDescription>Which template applies to who</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-200">
              <div>Total assignments: <span className="font-medium">{assignments?.length ?? 0}</span></div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Generation uses assignments + policies to produce shifts.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Operational Notes</CardTitle>
            <CardDescription>How Scheduling works</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 dark:text-slate-200">
            <ul className="list-disc pl-5">
              <li>Templates define rules (weekly/rotating).</li>
              <li>Assignments attach templates to employees/org units.</li>
              <li>Generate builds DRAFT shifts, respecting min-rest & overlap guards.</li>
              <li>Conflicts endpoint shows overlaps and rest violations before publish.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ScheduleShell>
  );
}