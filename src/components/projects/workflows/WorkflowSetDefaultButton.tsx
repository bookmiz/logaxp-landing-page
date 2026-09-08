"use client";

import { Button } from "@/logaxp/components/ui/button";

export function WorkflowSetDefaultButton({
  isDefault,
  busy,
  onSetDefault,
}: {
  isDefault?: boolean;
  busy?: boolean;
  onSetDefault: () => void;
}) {
  return (
    <Button variant="outline" disabled={busy || isDefault} onClick={onSetDefault}>
      {isDefault ? "Default" : "Set default"}
    </Button>
  );
}