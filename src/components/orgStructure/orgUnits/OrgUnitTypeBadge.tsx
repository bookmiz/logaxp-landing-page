"use client";

import React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { OrgUnitType } from "@/logaxp/lib/orgStructure/orgStructure.types";

function labelOf(t?: string) {
  if (!t) return "—";
  return t.charAt(0) + t.slice(1).toLowerCase();
}

export function OrgUnitTypeBadge({ type }: { type?: OrgUnitType }) {
  const t = String(type ?? "");
  const variant =
    t === "DIVISION" ? "success" : t === "DEPARTMENT" ? "warning" : t === "TEAM" ? "default" : "muted";

  return <Badge variant={variant as any}>{labelOf(t)}</Badge>;
}