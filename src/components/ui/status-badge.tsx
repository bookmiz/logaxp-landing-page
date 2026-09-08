// src/components/ui/status-badge.tsx
"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";

export function StatusBadge({
  status,
  deleted,
}: {
  status?: string | null;
  deleted?: boolean;
}) {
  if (deleted) return <Badge variant="warning">DELETED</Badge>;

  const s = String(status ?? "—").toUpperCase();

  if (s === "ACTIVE") return <Badge variant="success">ACTIVE</Badge>;
  if (s === "ONBOARDING") return <Badge variant="muted">ONBOARDING</Badge>;
  if (s === "ON_LEAVE") return <Badge variant="default">ON LEAVE</Badge>;
  if (s === "SUSPENDED") return <Badge variant="warning">SUSPENDED</Badge>;
  if (s === "TERMINATED") return <Badge variant="destructive">TERMINATED</Badge>;
  if (s === "INACTIVE") return <Badge variant="muted">INACTIVE</Badge>;

  return <Badge variant="muted">{s}</Badge>;
}