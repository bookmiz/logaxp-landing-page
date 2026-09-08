"use client";

import React from "react";
import type { Position } from "@/logaxp/lib/orgStructure/orgStructure.types";
import {
  TableWrapper,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/logaxp/components/ui/table";
import { RowActionsMenu } from "@/logaxp/components/orgStructure/shared/RowActionsMenu";

function StatusPill({ deleted }: { deleted: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        deleted
          ? "bg-rose-50 text-rose-700 border border-rose-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200",
      ].join(" ")}
    >
      {deleted ? "Deleted" : "Active"}
    </span>
  );
}

export function PositionsTable({
  items,
  canWrite,
  onEdit,
  onDelete,
  onRestore,
}: {
  items: Position[];
  canWrite: boolean;
  onEdit: (p: Position) => void;
  onDelete: (p: Position) => void;
  onRestore: (p: Position) => void;
}) {
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Short Title</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((p) => {
            const isDeleted = Boolean(p.deletedAt);
            return (
              <TableRow key={p.id} className={isDeleted ? "opacity-75" : ""}>
                <TableCell className="font-semibold">{p.name || "—"}</TableCell>
                <TableCell>{p.title ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">{p.code ?? "—"}</TableCell>
                <TableCell>{p.level ?? "—"}</TableCell>
                <TableCell>
                  <StatusPill deleted={isDeleted} />
                </TableCell>
                <TableCell className="text-right">
                  <RowActionsMenu
                    isDeleted={isDeleted}
                    canEdit={canWrite}
                    canDelete={canWrite}
                    canRestore={canWrite}
                    onEdit={() => onEdit(p)}
                    onDelete={() => onDelete(p)}
                    onRestore={() => onRestore(p)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}