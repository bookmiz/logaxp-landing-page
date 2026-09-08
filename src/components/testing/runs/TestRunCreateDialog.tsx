"use client";

import * as React from "react";
import type { CreateTestRunDto, TestPlan } from "@/logaxp/lib/testing/testing.types";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";

export function TestRunCreateDialog({
  open,
  onOpenChange,
  projectId,
  plans,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  plans: TestPlan[];
  busy?: boolean;
  onSubmit: (dto: CreateTestRunDto) => void | Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [planId, setPlanId] = React.useState<string>("NONE");

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setPlanId("NONE");
  }, [open]);

  const canSubmit = name.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    const dto: CreateTestRunDto = {
      projectId,
      name: name.trim(),
      planId: planId === "NONE" ? null : planId,
    };
    await onSubmit(dto);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>New Test Run</DialogTitle>
          <DialogDescription>
            Create a run (execution event). You can link a plan (recommended) or run ad-hoc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            label="Run name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Smoke Run - Staging - Feb 28"
          />

          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger label="Plan (optional)">
              <SelectValue placeholder="Select a plan (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Plans</SelectLabel>
                <SelectItem value="NONE">No plan</SelectItem>
                {plans
                  .filter((p) => !p.deletedAt)
                  .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={busy} disabled={!canSubmit}>
            Create run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}