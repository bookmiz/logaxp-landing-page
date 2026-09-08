"use client";

import * as React from "react";
import { Badge } from "@/logaxp/components/ui/badge";

function norm(v: string) {
  return (v || "").toUpperCase().replace(/\s+/g, "_");
}

export function OnboardingStatusPill({
  value,
  kind = "neutral",
}: {
  value: string;
  kind?: "neutral" | "instance" | "step";
}) {
  const v = norm(value);

  const variant = React.useMemo(() => {
    // instance statuses
    if (kind === "instance") {
      if (v.includes("COMPLET")) return "success";
      if (v.includes("CANCEL")) return "warning";
      if (v.includes("IN_PROGRESS") || v.includes("START")) return "default";
      if (v.includes("NOT_STARTED") || v.includes("DRAFT")) return "muted";
      return "muted";
    }

    // step statuses
    if (kind === "step") {
      if (v === "DONE" || v.includes("COMPLET")) return "success";
      if (v === "SKIPPED") return "muted";
      if (v === "BLOCKED") return "warning";
      if (v.includes("IN_PROGRESS")) return "default";
      if (v === "PENDING") return "muted";
      return "muted";
    }

    return "muted";
  }, [v, kind]);

  return <Badge variant={variant as any}>{v}</Badge>;
}