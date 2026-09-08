"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";

export function TestingShell({
  title,
  subtitle,
  pill,
  actions,
  children,
  projectId,
}: {
  title: string;
  subtitle?: string;
  pill?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  projectId?: string | null;
}) {
  return (
    <ProjectShell
      projectId={projectId}
      title={title}
      subtitle={subtitle}
      pill={
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          {pill ?? "Testing"}
        </span>
      }
      actions={actions}
    >
      {children}
    </ProjectShell>
  );
}
