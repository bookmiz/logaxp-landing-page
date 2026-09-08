"use client";

import React, { useState } from "react";
import type { Position } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { ConfirmActionDialog } from "@/logaxp/components/orgStructure/shared/ConfirmActionDialog";

export function DeleteRestorePositionDialog({
  open,
  onOpenChange,
  mode,
  item,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "delete" | "restore";
  item: Position | null;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "delete" ? "Delete Position" : "Restore Position"}
      description={
        mode === "delete"
          ? `Soft-delete this position${item?.name ? ` (${item.name})` : ""}.`
          : `Restore this position${item?.name ? ` (${item.name})` : ""}.`
      }
      confirmText={mode === "delete" ? "Delete" : "Restore"}
      confirmVariant={mode === "delete" ? "destructive" : "success"}
      loading={loading}
      onConfirm={async () => {
        try {
          setLoading(true);
          await onConfirm();
          onOpenChange(false);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}