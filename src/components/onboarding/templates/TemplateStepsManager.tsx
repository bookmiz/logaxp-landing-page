"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Pencil, Trash2, RefreshCcw } from "lucide-react";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import type { OnboardingStep } from "@/logaxp/lib/onboarding/onboarding.types";
import {
  unwrapApi,
  unwrapList,
  safeIso,
  pickStepTitle,
} from "@/logaxp/components/onboarding/onboarding.utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { toast } from "@/logaxp/components/ui/toast";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";

import { OnboardingStepCreateEditDialog } from "./OnboardingStepCreateEditDialog";

function sortSteps(rows: OnboardingStep[]) {
  return [...rows].sort((a, b) => {
    const ao = Number(a.order ?? 0);
    const bo = Number(b.order ?? 0);
    if (Number.isFinite(ao) && Number.isFinite(bo) && ao !== bo) return ao - bo;

    const ad = new Date(a.createdAt ?? 0).getTime();
    const bd = new Date(b.createdAt ?? 0).getTime();
    if (!Number.isNaN(ad) && !Number.isNaN(bd) && ad !== bd) return ad - bd;

    return pickStepTitle(a).localeCompare(pickStepTitle(b));
  });
}

type BusyAction = "up" | "down" | "delete" | "refresh" | null;

export function TemplateStepsManager({ templateId }: { templateId: string }) {
  const { steps } = useOnboarding();

  const [rows, setRows] = React.useState<OnboardingStep[]>([]);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editStep, setEditStep] = React.useState<OnboardingStep | null>(null);

  const [busyStepId, setBusyStepId] = React.useState<string | null>(null);
  const [busyAction, setBusyAction] = React.useState<BusyAction>(null);

  const [removeTarget, setRemoveTarget] = React.useState<OnboardingStep | null>(null);

  const sortedRows = React.useMemo(() => sortSteps(rows), [rows]);

  // Reset on template change (prevents stale UI)
  React.useEffect(() => {
    setRows([]);
    setInitialLoading(true);
    setBusyStepId(null);
    setBusyAction(null);
    setRemoveTarget(null);
  }, [templateId]);

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        setBusyAction("refresh");
        const res = await steps.list(templateId);
        const data = unwrapApi(res);
        const { items } = unwrapList(data);
        setRows(sortSteps(items as OnboardingStep[]));
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error("Failed to load steps");
      } finally {
        setInitialLoading(false);
        setBusyAction(null);
      }
    },
    [steps, templateId]
  );

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  const moveStep = async (step: OnboardingStep, dir: "up" | "down") => {
    const idx = sortedRows.findIndex((s) => s.id === step.id);
    if (idx < 0) return;

    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sortedRows.length) return;

    // Common admin convention: 1-based order
    const newOrder = targetIdx + 1;

    try {
      setBusyStepId(step.id);
      setBusyAction(dir);

      await steps.reorder(step.id, { order: newOrder });
      toast.success("Step order updated");

      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to reorder step");
    } finally {
      setBusyStepId(null);
      setBusyAction(null);
    }
  };

  const confirmRemove = (step: OnboardingStep) => setRemoveTarget(step);

  const remove = async () => {
    const step = removeTarget;
    if (!step) return;

    try {
      setBusyStepId(step.id);
      setBusyAction("delete");

      await steps.remove(step.id);
      toast.success("Step removed");

      setRemoveTarget(null);
      await load({ silent: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove step");
    } finally {
      setBusyStepId(null);
      setBusyAction(null);
    }
  };

  const busyAny = Boolean(busyAction);
  const rowBusy = (id: string) => busyStepId === id;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-base">Template Steps</CardTitle>
            <CardDescription>Create, edit, reorder, and remove steps in this template.</CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={busyAny}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>

            <Button onClick={() => setCreateOpen(true)} disabled={busyAny}>
              <Plus className="h-4 w-4" />
              Add step
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {initialLoading ? (
          <div className="text-sm text-slate-500">Loading steps...</div>
        ) : sortedRows.length === 0 ? (
          <EmptyState
            title="No steps yet"
            description="Add your first step to begin building onboarding workflow."
            action={<Button onClick={() => setCreateOpen(true)}>Add first step</Button>}
          />
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 70 }}>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Kind / Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Due Days</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedRows.map((s, index) => {
                  const busy = rowBusy(s.id);

                  const stepData = s as Record<string, unknown>;
                  const order = Number(stepData.order ?? index + 1);
                  const kind = String(stepData.kind ?? stepData.type ?? "—");
                  const required = Boolean(stepData.required ?? true);
                  const dueDays =
                    stepData.dueDays ??
                    stepData.dueDaysFromStart ??
                    null;

                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">
                        {Number.isFinite(order) ? order : index + 1}
                      </TableCell>

                      <TableCell>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{pickStepTitle(s)}</div>
                          {stepData.description ? (
                            <div className="text-xs text-slate-500 truncate">{String(stepData.description)}</div>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="muted">{kind.toUpperCase()}</Badge>
                      </TableCell>

                      <TableCell>
                        {required ? <Badge variant="success">REQUIRED</Badge> : <Badge variant="muted">OPTIONAL</Badge>}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {typeof dueDays === "number" ? dueDays : "—"}
                      </TableCell>

                      <TableCell>{safeIso((stepData.updatedAt ?? stepData.createdAt) as string | null | undefined)}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void moveStep(s, "up")}
                            disabled={busyAny || index === 0}
                            loading={busy && busyAction === "up"}
                            title={index === 0 ? "Already at top" : undefined}
                          >
                            <ArrowUp className="h-4 w-4" />
                            Up
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void moveStep(s, "down")}
                            disabled={busyAny || index === sortedRows.length - 1}
                            loading={busy && busyAction === "down"}
                            title={index === sortedRows.length - 1 ? "Already at bottom" : undefined}
                          >
                            <ArrowDown className="h-4 w-4" />
                            Down
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditStep(s)}
                            disabled={busyAny}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmRemove(s)}
                            disabled={busyAny}
                            loading={busy && busyAction === "delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </CardContent>

      {/* Create */}
      <OnboardingStepCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        templateId={templateId}
        suggestedOrder={rows.length}
        step={null}
        onSaved={async () => {
          setCreateOpen(false);
          await load({ silent: true });
        }}
      />

      {/* Edit */}
      <OnboardingStepCreateEditDialog
        open={Boolean(editStep)}
        onOpenChange={(o) => !o && setEditStep(null)}
        templateId={templateId}
        step={editStep}
        onSaved={async () => {
          setEditStep(null);
          await load({ silent: true });
        }}
      />

      {/* Delete confirm */}
      <Dialog open={Boolean(removeTarget)} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete step</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold">{removeTarget ? pickStepTitle(removeTarget) : "this step"}</span>.
              This can affect active onboarding instances depending on backend policy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={busyAny}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void remove()} loading={busyAction === "delete"}>
              Confirm delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}