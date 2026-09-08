"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Pencil,
  PlayCircle,
  PauseCircle,
  Trash2,
  Eye,
  Globe,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/logaxp/components/ui/dropdown-menu";
import type { Tenant } from "@/logaxp/lib/tenants/tenant.types";
import type { TenantDetailsTab } from "./tenant-details.types";

type TenantRowActionsProps = {
  tenant: Tenant;
  busy?: boolean;
  onView: (tenant: Tenant, tab?: TenantDetailsTab) => void;
  onEdit: (tenant: Tenant) => void;
  onActivate: (tenant: Tenant) => void;
  onSuspend: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
};

export function TenantRowActions({
  tenant,
  onView,
  onEdit,
  onActivate,
  onSuspend,
  onDelete,
  busy,
}: TenantRowActionsProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={busy} aria-label="Tenant actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(tenant, "overview")}>
            <Eye className="h-4 w-4" />
            View details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onView(tenant, "domains")}>
            <Globe className="h-4 w-4" />
            Manage domains
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onView(tenant, "settings")}>
            <Settings className="h-4 w-4" />
            Tenant settings
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onView(tenant, "members")}>
            <Users className="h-4 w-4" />
            Members
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onEdit(tenant)}>
            <Pencil className="h-4 w-4" />
            Edit tenant
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {tenant.status !== "ACTIVE" ? (
            <DropdownMenuItem onClick={() => onActivate(tenant)}>
              <PlayCircle className="h-4 w-4" />
              Activate
            </DropdownMenuItem>
          ) : null}

          {tenant.status === "ACTIVE" ? (
            <DropdownMenuItem onClick={() => onSuspend(tenant)}>
              <PauseCircle className="h-4 w-4" />
              Suspend
            </DropdownMenuItem>
          ) : null}

          {tenant.status !== "DELETED" ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(tenant)}
                className="text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete (soft)
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}