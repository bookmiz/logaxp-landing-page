// src/components/ui/employment-type-badge.tsx
"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";

function human(v?: string | null) {
  if (!v) return "—";
  return String(v).replaceAll("_", " ");
}

export function EmploymentTypeBadge({ type }: { type?: string | null }) {
  return <Badge variant="muted">{human(type).toUpperCase()}</Badge>;
}