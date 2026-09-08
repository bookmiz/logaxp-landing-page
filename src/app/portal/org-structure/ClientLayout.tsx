// src/app/portal/org-structure/ClientLayout.tsx
"use client";

import * as React from "react";
import { OrganizationShell } from "@/logaxp/components/orgStructure/orgUnits/OrganizationShell";
import { OrgStructureNav } from "@/logaxp/components/orgStructure/OrgStructureNav";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationShell
      title="Organization Structure"
      subtitle="Define your company's blueprint — units, roles, locations, cost centers, and hierarchy."
      pill="Organization"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          {/* Example actions — customize as needed */}
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            Export Structure
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            New Org Unit
          </button>
        </div>
      }
    >
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-20 -mx-4 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <OrgStructureNav />
        </div>
      </div>

      {/* Page content (sub-pages) */}
      <div className="mt-8 animate-fade-in-up">{children}</div>
    </OrganizationShell>
  );
}