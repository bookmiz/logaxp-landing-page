// src/logaxp/components/projects/timeline/milestones/MilestoneCreateEditDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Label } from "@/logaxp/components/ui/label";

import type {
  CreateProjectMilestoneDto,
  UpdateProjectMilestoneDto,
  ProjectMilestone,
} from "@/logaxp/lib/project-management/projectManagement.types";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  busy?: boolean;

  milestone?: ProjectMilestone | null;

  onSubmit: (dto: CreateProjectMilestoneDto | UpdateProjectMilestoneDto) => void | Promise<void>;
};

function toDateInput(v?: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  // yyyy-mm-dd
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromDateInput(v: string): string | undefined {
  if (!v) return undefined;
  // store as ISO date (midnight)
  const d = new Date(`${v}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function MilestoneCreateEditDialog({
  open,
  onOpenChange,
  mode,
  busy,
  milestone,
  onSubmit,
}: Props) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startAt, setStartAt] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && milestone) {
      setTitle(String(milestone.title ?? ""));
      setDescription(String(milestone.description ?? ""));
      setStartAt(toDateInput(milestone.startAt as any));
      setDueAt(toDateInput(milestone.dueAt as any));
      setSortOrder(milestone.sortOrder != null ? String(milestone.sortOrder) : "");
    } else {
      setTitle("");
      setDescription("");
      setStartAt("");
      setDueAt("");
      setSortOrder("");
    }
  }, [open, mode, milestone]);

  const canSave = title.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New milestone" : "Edit milestone"}</DialogTitle>
          <DialogDescription>
            Milestones help teams track key delivery points on the roadmap.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Beta launch" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes…"
              className="min-h-[90px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              inputMode="numeric"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value.replace(/[^\d-]/g, ""))}
              placeholder="Optional numeric ordering (lower first)"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const payload: any = {
                  title: title.trim(),
                };

                if (description.trim()) payload.description = description.trim();

                const s = fromDateInput(startAt);
                const d = fromDateInput(dueAt);

                if (startAt) payload.startAt = s;
                if (dueAt) payload.dueAt = d;

                if (sortOrder.trim() !== "") payload.sortOrder = Number(sortOrder);

                await onSubmit(payload);
                onOpenChange(false);
              }}
              disabled={!canSave || busy}
            >
              {busy ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}