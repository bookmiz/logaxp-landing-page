"use client";

import * as React from "react";
import type { CreateTestPlanDto, TestPlan, UpdateTestPlanDto } from "@/logaxp/lib/testing/testing.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";

export function TestPlanCreateEditDialog({
  open,
  onOpenChange,
  mode,
  projectId,
  plan,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "create" | "edit";
  projectId: string;
  plan?: TestPlan | null;
  busy?: boolean;
  onSubmit: (dto: CreateTestPlanDto | UpdateTestPlanDto) => void | Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sprintId, setSprintId] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && plan) {
      setName(plan.name ?? "");
      setDescription(plan.description ?? "");
      setSprintId(plan.sprintId ?? "");
    } else {
      setName("");
      setDescription("");
      setSprintId("");
    }
  }, [open, mode, plan]);

  const canSubmit = name.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;

    if (mode === "create") {
      const dto: CreateTestPlanDto = {
        projectId,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        sprintId: sprintId.trim() ? sprintId.trim() : null,
      };
      await onSubmit(dto);
    } else {
      const dto: UpdateTestPlanDto = {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        sprintId: sprintId.trim() ? sprintId.trim() : null,
      };
      await onSubmit(dto);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Test Plan" : "Edit Test Plan"}</DialogTitle>
          <DialogDescription>
            Plans are curated sets of test cases you execute as runs (smoke, regression, release certification).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            label="Plan name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Release Regression - v1.2"
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scope, environment notes, entry/exit criteria..."
          />
          <Input
            label="Sprint ID (optional)"
            value={sprintId}
            onChange={(e) => setSprintId(e.target.value)}
            placeholder="Link this plan to a sprint when needed"
            hint="The API validates that the sprint belongs to this project."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={busy} disabled={!canSubmit}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
