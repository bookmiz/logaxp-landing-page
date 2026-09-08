// src/logaxp/components/projects/timeline/events/EventCreateEditDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Label } from "@/logaxp/components/ui/label";

import type {
  CreateProjectTimelineEventDto,
  UpdateProjectTimelineEventDto,
  ProjectTimelineEvent,
} from "@/logaxp/lib/project-management/projectManagement.types";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  busy?: boolean;

  event?: ProjectTimelineEvent | null;

  onSubmit: (dto: CreateProjectTimelineEventDto | UpdateProjectTimelineEventDto) => void | Promise<void>;
};

function toDTInput(v?: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromDTInput(v: string): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function EventCreateEditDialog({ open, onOpenChange, mode, busy, event, onSubmit }: Props) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("");
  const [startAt, setStartAt] = React.useState("");
  const [endAt, setEndAt] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && event) {
      setTitle(String(event.title ?? ""));
      setDescription(String(event.description ?? ""));
      setType(String(event.type ?? ""));
      setStartAt(toDTInput(event.startAt as any));
      setEndAt(toDTInput(event.endAt as any));
    } else {
      setTitle("");
      setDescription("");
      setType("");
      setStartAt("");
      setEndAt("");
    }
  }, [open, mode, event]);

  const canSave = title.trim().length >= 2 && (mode === "edit" ? true : Boolean(startAt));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New event" : "Edit event"}</DialogTitle>
          <DialogDescription>Events are time-bounded moments: reviews, releases, workshops, etc.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sprint review" />
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

          <div className="space-y-2">
            <Label>Type</Label>
            <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. REVIEW, RELEASE, MEETING" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              disabled={!canSave || busy}
              onClick={async () => {
                const payload: any = { title: title.trim() };

                if (description.trim()) payload.description = description.trim();
                if (type.trim()) payload.type = type.trim();

                const s = fromDTInput(startAt);
                const e = fromDTInput(endAt);

                if (mode === "create") payload.startAt = s;
                else if (startAt) payload.startAt = s;

                if (endAt) payload.endAt = e;
                else payload.endAt = null;

                await onSubmit(payload);
                onOpenChange(false);
              }}
            >
              {busy ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}