// src/app/portal/org-structure/layout.tsx
import { ClientLayout } from "./ClientLayout";

export const metadata = {
  title: "Organization Structure • LogaXP",
  description: "Manage org units, reporting lines, positions, locations, and cost centers.",
};

export default function OrgStructureLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}