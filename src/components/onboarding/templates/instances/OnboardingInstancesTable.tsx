"use client";

import * as React from "react";
import { Eye, Play, CheckCircle2, Ban } from "lucide-react";

import type { OnboardingInstance } from "@/logaxp/lib/onboarding/onboarding.types";
import { safeIso, pickInstanceStatus } from "@/logaxp/components/onboarding/onboarding.utils";
import { OnboardingStatusPill } from "@/logaxp/components/onboarding/OnboardingStatusPill";

import { Button } from "@/logaxp/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";

type BusyAction = "view" | "start" | "complete" | "cancel" | null;

export function OnboardingInstancesTable({
  rows,
  busy, // ✅ legacy "disable everything"
  busyInstanceId, // ✅ enterprise row-level busy
  busyAction, // ✅ which action is busy on that row
  onView,
  onStart,
  onComplete,
  onCancel,
}: {
  rows: OnboardingInstance[];
  busy?: boolean;

  busyInstanceId?: string | null;
  busyAction?: BusyAction;

  onView: (i: OnboardingInstance) => void;
  onStart: (i: OnboardingInstance) => void;
  onComplete: (i: OnboardingInstance) => void;
  onCancel: (i: OnboardingInstance) => void;
}) {
  const rowBusy = (id: string) => Boolean(busy) || (busyInstanceId ? busyInstanceId === id : false);

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instance</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((i) => {
            const status = pickInstanceStatus(i);
            const employeeId = String((i as OnboardingInstance).employeeId ?? "—");
            const templateId = String((i as OnboardingInstance).templateId ?? "—");

            const isCompleted = status.toUpperCase().includes("COMPLET");
            const isCanceled = status.toUpperCase().includes("CANCEL");
            const isNotStarted =
              status.toUpperCase().includes("NOT_STARTED") || status.toUpperCase().includes("DRAFT");

            const disabled = rowBusy(i.id);

            return (
              <TableRow key={i.id}>
                <TableCell className="font-mono text-xs">{i.id}</TableCell>
                <TableCell className="font-mono text-xs">{employeeId}</TableCell>
                <TableCell className="font-mono text-xs">{templateId}</TableCell>
                <TableCell>
                  <OnboardingStatusPill value={status} kind="instance" />
                </TableCell>
                <TableCell>{safeIso((i as OnboardingInstance).createdAt)}</TableCell>

                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(i)}
                      disabled={disabled}
                      loading={busyInstanceId === i.id && busyAction === "view"}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStart(i)}
                      disabled={disabled || !isNotStarted || isCanceled || isCompleted}
                      loading={busyInstanceId === i.id && busyAction === "start"}
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onComplete(i)}
                      disabled={disabled || isCanceled || isCompleted}
                      loading={busyInstanceId === i.id && busyAction === "complete"}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Complete
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onCancel(i)}
                      disabled={disabled || isCanceled || isCompleted}
                      loading={busyInstanceId === i.id && busyAction === "cancel"}
                    >
                      <Ban className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}