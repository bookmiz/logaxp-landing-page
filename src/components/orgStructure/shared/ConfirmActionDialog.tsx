// src/components/orgStructure/shared/ConfirmActionDialog.tsx
"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  confirmVariant = "destructive",
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  confirmVariant?: "default" | "outline" | "ghost" | "destructive" | "success";
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant={confirmVariant} loading={loading} onClick={() => onConfirm()}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}