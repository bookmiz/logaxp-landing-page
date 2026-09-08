"use client";

import * as React from "react";
import { TableWrapper, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/logaxp/components/ui/table";
import type { ManagerTeamListItem } from "@/logaxp/lib/manager/manager.types";

function fullName(v?: {
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
}) {
  if (!v) return "—";
  return v.preferredName || `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim() || "—";
}

export function ManagerTeamTable({
  items,
}: {
  items: ManagerTeamListItem[];
}) {
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Employment</TableHead>
            <TableHead>Org Unit</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Supervisor</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-semibold text-slate-900">
                  {fullName(item)}
                </div>
                <div className="text-xs text-slate-500">
                  {item.employeeNumber ? `#${item.employeeNumber}` : "—"}
                </div>
                <div className="text-xs text-slate-500">{item.workEmail ?? "—"}</div>
              </TableCell>

              <TableCell>{item.status ?? "—"}</TableCell>
              <TableCell>{item.employmentType ?? "—"}</TableCell>
              <TableCell>{item.primaryAssignment?.orgUnit?.name ?? "—"}</TableCell>
              <TableCell>{item.primaryAssignment?.location?.name ?? "—"}</TableCell>
              <TableCell>
                {item.primaryAssignment?.position?.title ??
                  item.primaryAssignment?.position?.name ??
                  "—"}
              </TableCell>
              <TableCell>{item.primaryAssignment?.costCenter?.name ?? "—"}</TableCell>
              <TableCell>
                {item.primaryAssignment?.manager
                  ? fullName(item.primaryAssignment.manager)
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}