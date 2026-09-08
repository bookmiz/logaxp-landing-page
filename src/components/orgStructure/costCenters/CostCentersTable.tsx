"use client";

import React from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import type { CostCenter } from "@/logaxp/lib/orgStructure/orgStructure.types";
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

export function CostCentersTable({
  items,
  canWrite,
  onEdit,
  onDelete,
  onRestore,
}: {
  items: CostCenter[];
  canWrite: boolean;
  onEdit: (p: CostCenter) => void;
  onDelete: (p: CostCenter) => void;
  onRestore: (p: CostCenter) => void;
}) {
  const router = useRouter();

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((p) => {
            const isDeleted = Boolean(p.deletedAt);

            const ownerName =
              p.ownerEmployee
                ? `${String(p.ownerEmployee.firstName ?? "")} ${String(
                    p.ownerEmployee.lastName ?? ""
                  )}`.trim() || p.ownerEmployee.preferredName || "—"
                : "—";

            return (
              <TableRow key={p.id}>
                <TableCell className="font-semibold">{p.name ?? "—"}</TableCell>
                <TableCell>{(p.code as string | undefined) ?? "—"}</TableCell>
                <TableCell className="max-w-[420px] truncate">
                  {(p.description as string | undefined) ?? "—"}
                </TableCell>
                <TableCell>{ownerName}</TableCell>
                <TableCell>{isDeleted ? "Deleted" : "Active"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/portal/org-structure/cost-centers/${p.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <RowActionsMenu
                      isDeleted={isDeleted}
                      canEdit={canWrite}
                      canDelete={canWrite}
                      canRestore={canWrite}
                      onEdit={() => onEdit(p)}
                      onDelete={() => onDelete(p)}
                      onRestore={() => onRestore(p)}
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