"use client";

import * as React from "react";
import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";

type Props = {
  projectId: string;
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function FinanceShell({ projectId, title, subtitle, actions, children }: Props) {
  return (
    <ProjectShell
      projectId={projectId}
      title={title}
      subtitle={subtitle}
      pill={`Work • Projects • Finance`}
      actions={actions}
    >
      {children}
    </ProjectShell>
  );
}
