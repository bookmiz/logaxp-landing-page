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
import type { CostCenter } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { CostCenterForm } from "./CostCenterForm";

export function CreateEditCostCenterModal({
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
  value?: CostCenter | null;
  loading?: boolean;
  onSubmit: (dto: any) => void;
}) {
  const title = useMemo(() => (mode === "create" ? "Create Cost Center" : "Edit Cost Center"), [mode]);
  const submitRef = useRef<null | (() => void)>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Manage financial cost centers.</DialogDescription>
        </DialogHeader>

        <CostCenterForm mode={mode} initial={value ?? undefined} loading={loading} onSubmit={onSubmit} />

        <div
          className="hidden"
          ref={(el) => {
            if (!el) return;
            submitRef.current = () => {
              const btn = el.parentElement?.querySelector('button[data-form-submit="costcenter"]') as HTMLButtonElement | null;
              btn?.click();
            };
          }}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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