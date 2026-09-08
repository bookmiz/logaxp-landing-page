"use client";

import * as React from "react";
import { Button } from "@/logaxp/components/ui/button";
import { TimeBanner } from "../feedback/TimeBanner";

type Props = {
  ok: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
};

export function TimePermissionGate({
  ok,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: Props) {
  if (ok) return <>{children}</>;

  return (
    <TimeBanner
      tone="warning"
      title={title}
      right={
        actionLabel && onAction ? (
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null
      }
    >
      {description}
    </TimeBanner>
  );
}