"use client";

import React from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { OrgUnit } from "@/logaxp/lib/orgStructure/orgStructure.types";
import {
  TableWrapper,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/logaxp/components/ui/table";
import { Button } from "@/logaxp/components/ui/button";
import { RowActionsMenu } from "@/logaxp/components/orgStructure/shared/RowActionsMenu";
import { OrgUnitTypeBadge } from "./OrgUnitTypeBadge";

export function OrgUnitsTable({
  items,
  canWrite,
  onEdit,
  onDelete,
  onRestore,
}: {
  items: OrgUnit[];
  canWrite: boolean;
  onEdit: (u: OrgUnit) => void;
  onDelete: (u: OrgUnit) => void;
  onRestore: (u: OrgUnit) => void;
}) {
  const router = useRouter();

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((u) => {
            const isDeleted = Boolean(u.deletedAt);
            const managerName = u.managerEmployee
              ? `${u.managerEmployee.firstName ?? ""} ${u.managerEmployee.lastName ?? ""}`.trim()
              : "—";

            return (
              <TableRow key={u.id}>
                <TableCell className="font-semibold">{u.name ?? "—"}</TableCell>
                <TableCell>
                  <OrgUnitTypeBadge type={u.type as any} />
                </TableCell>
                <TableCell>{u.code ?? "—"}</TableCell>
                <TableCell>{isDeleted ? "Deleted" : "Active"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/portal/org-structure/org-units/${u.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <RowActionsMenu
                      isDeleted={isDeleted}
                      canEdit={canWrite}
                      canDelete={canWrite}
                      canRestore={canWrite}
                      onEdit={() => onEdit(u)}
                      onDelete={() => onDelete(u)}
                      onRestore={() => onRestore(u)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}