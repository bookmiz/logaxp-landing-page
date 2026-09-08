import { Badge } from "@/logaxp/components/ui/badge";
import type { TenantStatus } from "@/logaxp/lib/tenants/tenant.types";

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  if (status === "ACTIVE") return <Badge variant="success">Active</Badge>;
  if (status === "SUSPENDED") return <Badge variant="warning">Suspended</Badge>;
  if (status === "DELETED") return <Badge variant="destructive">Deleted</Badge>;
  return <Badge variant="muted">{status}</Badge>;
}