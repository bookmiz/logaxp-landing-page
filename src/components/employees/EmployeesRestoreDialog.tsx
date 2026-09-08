"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
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

export function EmployeesRestoreDialog({
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
          <DialogTitle>Restore employee</DialogTitle>
          <DialogDescription>
            Restore{" "}
            <span className="font-semibold">
              {employee ? `${employee.firstName} ${employee.lastName}` : "this employee"}
            </span>{" "}
            back to active records.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busyAny}>
            Cancel
          </Button>
          <Button onClick={() => void onConfirm()} disabled={busyAny}>
            <RotateCcw className="h-4 w-4" />
            Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}