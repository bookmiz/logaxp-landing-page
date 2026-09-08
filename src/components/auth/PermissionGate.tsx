// src/components/auth/PermissionGate.tsx
"use client";

import React from "react";
import { useHasPermission } from "@/logaxp/hooks/useHasPermission";

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission?: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const ok = useHasPermission(permission);
  if (!ok) return <>{fallback}</>;
  return <>{children}</>;
}