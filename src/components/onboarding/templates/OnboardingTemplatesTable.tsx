"use client";

import * as React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { OnboardingTemplate } from "@/logaxp/lib/onboarding/onboarding.types";
import { safeIso } from "@/logaxp/components/onboarding/onboarding.utils";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/logaxp/components/ui/table";

export function OnboardingTemplatesTable({
  rows,
  busy,
  onView,
  onEdit,
  onDelete,
}: {
  rows: OnboardingTemplate[];
  busy?: boolean;
  onView: (t: OnboardingTemplate) => void;
  onEdit: (t: OnboardingTemplate) => void;
  onDelete: (t: OnboardingTemplate) => void;
}) {
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((t) => {
            const tWithExtended = t as OnboardingTemplate & { isActive?: boolean; description?: string; version?: string; updatedAt?: string; createdAt?: string };
            const isActive = Boolean(tWithExtended.isActive ?? true);
            return (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{t.name}</div>
                    <div className="text-xs text-slate-500 truncate">{tWithExtended.description ?? ""}</div>
                  </div>
                </TableCell>

                <TableCell className="font-mono text-xs">
                  {tWithExtended.version ?? "—"}
                </TableCell>

                <TableCell>
                  {isActive ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="muted">INACTIVE</Badge>}
                </TableCell>

                <TableCell>{safeIso(tWithExtended.updatedAt ?? tWithExtended.createdAt)}</TableCell>

                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView(t)} disabled={busy}>
                      <Eye className="h-4 w-4" />
                      View
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => onEdit(t)} disabled={busy}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>

                    <Button variant="destructive" size="sm" onClick={() => onDelete(t)} disabled={busy}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
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