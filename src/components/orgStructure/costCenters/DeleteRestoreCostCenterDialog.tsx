"use client";

import React, { useState } from "react";
import type { CostCenter } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { ConfirmActionDialog } from "@/logaxp/components/orgStructure/shared/ConfirmActionDialog";

export function DeleteRestoreCostCenterDialog({
  open,
  onOpenChange,
  mode,
  item,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "delete" | "restore";
  item: CostCenter | null;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "delete" ? "Delete Cost Center" : "Restore Cost Center"}
      description={
        mode === "delete"
          ? `Soft-delete this cost center${item?.name ? ` (${item.name})` : ""}.`
          : `Restore this cost center${item?.name ? ` (${item.name})` : ""}.`
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