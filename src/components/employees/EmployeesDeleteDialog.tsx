"use client";

import * as React from "react";
import { Button } from "@/logaxp/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog";
import type { EmployeeListItem } from "@/logaxp/lib/employee-management/employee-management.types";

export function EmployeesDeleteDialog({
  open,
  onOpenChange,
  employee,
  busyAny,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  employee: EmployeeListItem | null;
  busyAny: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete employee</DialogTitle>
          <DialogDescription>
            This will soft-delete{" "}
            <span className="font-semibold">
              {employee ? `${employee.firstName} ${employee.lastName}` : "this employee"}
            </span>
            . You can restore later if needed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => void onConfirm()} disabled={busyAny}>
            Confirm delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}