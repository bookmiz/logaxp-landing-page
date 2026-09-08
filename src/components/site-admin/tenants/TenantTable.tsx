"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";
import type { Tenant } from "@/logaxp/lib/tenants/tenant.types";
import { TenantStatusBadge } from "./TenantStatusBadge";
import { TenantRowActions } from "./TenantRowActions";
import type { TenantDetailsTab } from "./tenant-details.types";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

type TenantTableProps = {
  rows: Tenant[];
  busyTenantId?: string | null;
  onView: (tenant: Tenant, tab?: TenantDetailsTab) => void;
  onEdit: (tenant: Tenant) => void;
  onActivate: (tenant: Tenant) => void;
  onSuspend: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
};

export function TenantTable({
  rows,
  busyTenantId,
  onView,
  onEdit,
  onActivate,
  onSuspend,
  onDelete,
}: TenantTableProps) {
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Timezone</TableHead>
            <TableHead>Locale</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((tenant) => (
            <TableRow
              key={tenant.id}
              className="cursor-pointer"
              onClick={() => onView(tenant, "overview")}
            >
              <TableCell>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{tenant.name}</div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {tenant.id}
                  </div>
                </div>
              </TableCell>

              <TableCell className="font-mono text-xs">{tenant.slug}</TableCell>
              <TableCell>
                <TenantStatusBadge status={tenant.status} />
              </TableCell>
              <TableCell>{tenant.planKey ?? "—"}</TableCell>
              <TableCell>{tenant.timezone}</TableCell>
              <TableCell>{tenant.locale}</TableCell>
              <TableCell>{tenant.currency}</TableCell>
              <TableCell>{formatDate(tenant.createdAt)}</TableCell>

              <TableCell className="text-right">
                <TenantRowActions
                  tenant={tenant}
                  busy={busyTenantId === tenant.id}
                  onView={onView}
                  onEdit={onEdit}
                  onActivate={onActivate}
                  onSuspend={onSuspend}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}