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
import type { Location } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { LocationForm } from "./LocationForm";

export function CreateEditLocationModal({
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
  value?: Location | null;
  loading?: boolean;
  onSubmit: (dto: any) => void;
}) {
  const title = useMemo(
    () => (mode === "create" ? "Create Location" : "Edit Location"),
    [mode]
  );

  const submitRef = useRef<null | (() => void)>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Manage offices and workplace locations.
          </DialogDescription>
        </DialogHeader>

        <LocationForm
          mode={mode}
          initial={value ?? undefined}
          loading={loading}
          onSubmit={onSubmit}
        />

        <div
          className="hidden"
          ref={(el) => {
            if (!el) return;
            submitRef.current = () => {
              const btn = el.parentElement?.querySelector(
                'button[data-form-submit="location"]'
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