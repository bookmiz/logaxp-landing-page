"use client";

import React, { useState } from "react";
import type { OrgUnit } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { ConfirmActionDialog } from "@/logaxp/components/orgStructure/shared/ConfirmActionDialog";

export function DeleteRestoreOrgUnitDialog({
  open,
  onOpenChange,
  mode,
  unit,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "delete" | "restore";
  unit: OrgUnit | null;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const title = mode === "delete" ? "Delete Org Unit" : "Restore Org Unit";
  const description =
    mode === "delete"
      ? "This will soft-delete the org unit. You can restore it later."
      : "This will restore the org unit and make it active again.";

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={`${description}${unit?.name ? ` (${unit.name})` : ""}`}
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