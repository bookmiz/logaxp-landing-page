"use client";

import React, { useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import type { OrgUnit, CreateOrgUnitDto, UpdateOrgUnitDto } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { OrgUnitForm } from "./OrgUnitForm";

export function CreateEditOrgUnitModal({
  open,
  onOpenChange,
  mode,
  value,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  value?: OrgUnit | null;
  loading?: boolean;
  onSubmit: (dto: CreateOrgUnitDto | UpdateOrgUnitDto) => void;
}) {
  const title = useMemo(
    () => (mode === "create" ? "Create Org Unit" : "Edit Org Unit"),
    [mode]
  );

  const submitRef = useRef<null | (() => void)>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new division, department, or team."
              : "Update org unit details."}
          </DialogDescription>
        </DialogHeader>

        <OrgUnitForm
          mode={mode}
          initial={value ?? undefined}
          excludeId={mode === "edit" ? value?.id : undefined}
          loading={loading}
          onSubmit={onSubmit}
        />

        <div
          className="hidden"
          ref={(el) => {
            if (!el) return;
            submitRef.current = () => {
              const btn = el.parentElement?.querySelector(
                'button[type="button"][data-form-submit="orgunit"]'
              ) as HTMLButtonElement | null;
              btn?.click();
            };
          }}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button loading={loading} onClick={() => submitRef.current?.()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}