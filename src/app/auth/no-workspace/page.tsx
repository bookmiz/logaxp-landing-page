"use client";

import React from "react";
import NoWorkspaceState from "@/logaxp/components/auth/NoWorkspaceState";

export default function NoWorkspacePage() {
  return (
    <NoWorkspaceState
      suiteName="HR Suite"
      // Optional: wire to your real flows
      // onCreateWorkspace={() => openCreateWorkspaceModal()}
      // onRequestAccess={() => openRequestAccessModal()}
      // onJoinWithCode={(code) => joinWorkspaceByCode(code)}
      // onSignOut={() => authService.logout()}
    />
  );
}

// C:\Users\kriss\logaxp-landing-page\src\app\auth\no-workspace\page.tsx