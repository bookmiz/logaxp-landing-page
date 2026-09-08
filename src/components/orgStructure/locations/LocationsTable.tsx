"use client";

import React from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import type { Location } from "@/logaxp/lib/orgStructure/orgStructure.types";
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
import { LocationTypeBadge } from "./LocationTypeBadge";

export function LocationsTable({
  items,
  canWrite,
  onEdit,
  onDelete,
  onRestore,
}: {
  items: Location[];
  canWrite: boolean;
  onEdit: (p: Location) => void;
  onDelete: (p: Location) => void;
  onRestore: (p: Location) => void;
}) {
  const router = useRouter();

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((p) => {
            const isDeleted = Boolean(p.deletedAt);

            const managerName =
              p.managerEmployee
                ? `${String(p.managerEmployee.firstName ?? "")} ${String(
                    p.managerEmployee.lastName ?? ""
                  )}`.trim() || p.managerEmployee.preferredName || "—"
                : "—";

            return (
              <TableRow key={p.id}>
                <TableCell className="font-semibold">{p.name ?? "—"}</TableCell>

                <TableCell>
                  <LocationTypeBadge type={p.type as any} />
                </TableCell>

                <TableCell>{(p.city as string | undefined) ?? "—"}</TableCell>
                <TableCell>{(p.country as string | undefined) ?? "—"}</TableCell>
                <TableCell>{isDeleted ? "Deleted" : "Active"}</TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/portal/org-structure/locations/${p.id}`)
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