"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import type { OnboardingInstance, OnboardingStepInstance } from "@/logaxp/lib/onboarding/onboarding.types";
import { unwrapApi, safeIso, unwrapList } from "@/logaxp/components/onboarding/onboarding.utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { toast } from "@/logaxp/components/ui/toast";
import { EmptyState } from "@/logaxp/components/ui/empty-state";

import { OnboardingStatusPill } from "@/logaxp/components/onboarding/OnboardingStatusPill";
import { StepInstanceCard } from "@/logaxp/components/onboarding/templates/instances/StepInstanceCard";

export default function OnboardingInstanceDetailPage() {
  const router = useRouter();
  const params = useParams<{ instanceId: string }>();
  const instanceId = params?.instanceId;

  const { instances, stepInstances, loading } = useOnboarding();

  const [initialLoading, setInitialLoading] = React.useState(true);

  const [row, setRow] = React.useState<OnboardingInstance | null>(null);
  const [instanceLoading, setInstanceLoading] = React.useState(false);

  const [stepRows, setStepRows] = React.useState<OnboardingStepInstance[]>([]);
  const [stepsLoading, setStepsLoading] = React.useState(false);

  const loadInstance = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!instanceId) return;

      try {
        setInstanceLoading(true);
        const res = await instances.get(instanceId);
        const data = unwrapApi(res) as OnboardingInstance;
        setRow(data);
      } catch (e) {
        console.error(e);
        setRow(null);
        if (!opts?.silent) toast.error("Failed to load onboarding instance");
      } finally {
        setInstanceLoading(false);
      }
    },
    [instances, instanceId]
  );

  const loadSteps = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!instanceId) return;

      try {
        setStepsLoading(true);

        // ✅ Enterprise style: ALWAYS pull step instances from dedicated endpoint
        const res = await stepInstances.list(instanceId);
        const data = unwrapApi(res);
        const { items } = unwrapList(data);

        setStepRows(items as OnboardingStepInstance[]);
      } catch (e) {
        console.error(e);
        setStepRows([]);
        if (!opts?.silent) toast.error("Failed to load step instances");
      } finally {
        setStepsLoading(false);
      }
    },
    [stepInstances, instanceId]
  );

  const refreshAfterAction = React.useCallback(async () => {
    await loadInstance({ silent: true });
    await loadSteps({ silent: true });
  }, [loadInstance, loadSteps]);

  React.useEffect(() => {
    if (!instanceId) {
      setInitialLoading(false);
      return;
    }

    (async () => {
      await loadInstance({ silent: true });
      await loadSteps({ silent: true });
      setInitialLoading(false);
    })();
  }, [instanceId, loadInstance, loadSteps]);

  const busy = Boolean(loading || instanceLoading || stepsLoading);

  if (initialLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">Loading onboarding instance...</CardContent>
        </Card>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="p-6">
        <EmptyState
          title="Instance not found"
          description="This instance might have been deleted or you don’t have access."
          action={<Button onClick={() => router.push("/portal/onboarding/instances")}>Back</Button>}
        />
      </div>
    );
  }

  const status = String(row.status ?? "UNKNOWN");
  const employeeId = String(row.employeeId ?? "—");
  const templateId = String(row.templateId ?? "—");

  const isTerminal =
    status.toUpperCase().includes("COMPLET") || status.toUpperCase().includes("CANCEL");

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => router.push("/portal/onboarding/instances")}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <OnboardingStatusPill value={status} kind="instance" />
              </div>

              <CardTitle className="text-xl">Onboarding Instance</CardTitle>
              <CardDescription className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="font-mono text-xs">{row.id}</span>
                <span>
                  Employee: <span className="font-mono text-xs">{employeeId}</span>
                </span>
                <span>
                  Template: <span className="font-mono text-xs">{templateId}</span>
                </span>
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => void refreshAfterAction()}
                disabled={busy}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await instances.start(row.id, {});
                    toast.success("Instance started");
                    await refreshAfterAction();
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to start instance");
                  }
                }}
                disabled={busy || isTerminal}
              >
                Start
              </Button>

              <Button
                onClick={async () => {
                  try {
                    await instances.complete(row.id, {});
                    toast.success("Instance completed");
                    await refreshAfterAction();
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to complete instance");
                  }
                }}
                disabled={busy || isTerminal}
              >
                Complete
              </Button>

              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await instances.cancel(row.id, {});
                    toast.success("Instance cancelled");
                    await refreshAfterAction();
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to cancel instance");
                  }
                }}
                disabled={busy || isTerminal}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-xs text-slate-500">Started</div>
            <div className="font-semibold">{safeIso(row.startedAt ?? null)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-xs text-slate-500">Completed</div>
            <div className="font-semibold">{safeIso(row.completedAt ?? null)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-xs text-slate-500">Created</div>
            <div className="font-semibold">{safeIso(row.createdAt ?? null)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Steps</CardTitle>
          <CardDescription>
            {stepsLoading ? "Loading steps..." : `${stepRows.length} step${stepRows.length === 1 ? "" : "s"} loaded for this instance.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {stepsLoading ? (
            <div className="text-sm text-slate-500">Fetching step instances…</div>
          ) : stepRows.length === 0 ? (
            <EmptyState
              title="No step instances returned"
              description="Your backend returned zero step instances for this onboarding instance."
              action={
                <Button variant="outline" onClick={() => void loadSteps()} disabled={busy}>
                  <RefreshCcw className="h-4 w-4" />
                  Reload steps
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {stepRows.map((si) => (
                <StepInstanceCard
                  key={si.id}
                  stepInstance={si}
                  busy={busy}
                  onActionDone={refreshAfterAction} // ✅ refresh instance + steps
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}