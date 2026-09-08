"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import { Button } from "@/logaxp/components/ui/button";
import { Card, CardContent } from "@/logaxp/components/ui/card";

import type { OnboardingStepInstance } from "@/logaxp/lib/onboarding/onboarding.types";
import { pickStepInstanceStatus, pickStepInstanceTitle, safeIso } from "@/logaxp/components/onboarding/onboarding.utils";
import { OnboardingStatusPill } from "@/logaxp/components/onboarding/OnboardingStatusPill";

import { StepInstanceActionDialogs } from "./StepInstanceActionDialogs";

export function StepInstanceCard({
  stepInstance,
  busy,
  onActionDone,
}: {
  stepInstance: OnboardingStepInstance;
  busy?: boolean;
  onActionDone: () => void | Promise<void>;
}) {
  const status = pickStepInstanceStatus(stepInstance);
  const title = pickStepInstanceTitle(stepInstance);

  const dueAt = stepInstance.dueAt ?? null;
  const assignedToUserId = stepInstance.assignedToUserId ?? null;
  const blockedReason = stepInstance.blockedReason ?? null;

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <OnboardingStatusPill value={status} kind="step" />
              <Badge variant="muted" className="font-mono text-xs">{stepInstance.id}</Badge>
            </div>

            <div className="text-base font-semibold truncate">{title}</div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Due: <span className="font-mono">{safeIso(dueAt)}</span></span>
              <span>Assignee: <span className="font-mono">{assignedToUserId ?? "—"}</span></span>
              {blockedReason ? (
                <span className="text-amber-700 dark:text-amber-300">
                  Blocked: <span className="font-mono">{String(blockedReason)}</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <StepInstanceActionDialogs stepInstance={stepInstance} busy={busy} onDone={onActionDone} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}