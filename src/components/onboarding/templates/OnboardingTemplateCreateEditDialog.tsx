"use client";

import * as React from "react";
import { Save } from "lucide-react";
import type { OnboardingTemplate, CreateOnboardingTemplateDto, UpdateOnboardingTemplateDto } from "@/logaxp/lib/onboarding/onboarding.types";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { toast } from "@/logaxp/components/ui/toast";

type Payload = CreateOnboardingTemplateDto | UpdateOnboardingTemplateDto;

export function OnboardingTemplateCreateEditDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: OnboardingTemplate | null;
  onSubmit: (payload: Payload) => Promise<void> | void;
}) {
  const isEdit = Boolean(template?.id);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState<string>("");
  const [isActive, setIsActive] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    setName(template?.name ?? "");
    setDescription(String(template?.description ?? ""));
    setIsActive(template?.isActive ?? true);
  }, [open, template]);

  const canSave = name.trim().length >= 2 && !saving;

  const submit = async () => {
    if (!canSave) return;

    try {
      setSaving(true);
      const payload: Payload = {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        isActive,
      };

      await onSubmit(payload);
    } catch (e) {
      console.error(e);
      toast.error(isEdit ? "Failed to update template" : "Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Template" : "New Onboarding Template"}</DialogTitle>
          <DialogDescription>
            Templates define steps and policies used for employee onboarding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            label="Template Name"
            placeholder="New Hire Onboarding"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            label="Description"
            placeholder="Short description for HR/Admin..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            resize="y"
            size="md"
          />

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Active template
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={saving} disabled={!canSave}>
            <Save className="h-4 w-4" />
            {isEdit ? "Save changes" : "Create template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}