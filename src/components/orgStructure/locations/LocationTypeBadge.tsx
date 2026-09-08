"use client";

import React from "react";
import { Badge } from "@/logaxp/components/ui/badge";
import type { LocationType } from "@/logaxp/lib/orgStructure/orgStructure.types";

function labelOf(t?: string) {
  if (!t) return "—";
  return t.charAt(0) + t.slice(1).toLowerCase();
}

export function LocationTypeBadge({ type }: { type?: LocationType }) {
  const t = String(type ?? "");
  const variant =
    t === "HQ" ? "success" : t === "BRANCH" ? "warning" : t === "REMOTE" ? "default" : "muted";

  return <Badge variant={variant as any}>{labelOf(t)}</Badge>;
}