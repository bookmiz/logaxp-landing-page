"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { ProjectRequiredState } from "./ProjectRequiredState";

export function ProjectGuard({
  projectId,
  children,
}: {
  projectId?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (!projectId) {
    return (
      <ProjectRequiredState
        targetPath={pathname || "/portal/projects"}
        targetLabel="Open workspace"
        description="Boards, sprints, backlog, and work items belong to a project. Select a project and we will attach the project context automatically."
      />
    );
  }

  return <>{children}</>;
}
