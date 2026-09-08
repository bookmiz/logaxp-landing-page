"use client";

import * as React from "react";
import type { CreateTestSuiteDto, TestSuite, UpdateTestSuiteDto } from "@/logaxp/lib/testing/testing.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";

export function TestSuiteCreateEditDialog({
  open,
  onOpenChange,
  mode,
  projectId,
  suite,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "create" | "edit";
  projectId: string;
  suite?: TestSuite | null;
  busy?: boolean;
  onSubmit: (dto: CreateTestSuiteDto | UpdateTestSuiteDto) => void | Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && suite) {
      setName(suite.name ?? "");
      setDescription(suite.description ?? "");
      setSortOrder(suite.sortOrder === null || typeof suite.sortOrder === "undefined" ? "" : String(suite.sortOrder));
    } else {
      setName("");
      setDescription("");
      setSortOrder("");
    }
  }, [open, mode, suite]);

  const submit = async () => {
    if (!name.trim()) return;
    if (mode === "create") {
      const dto: CreateTestSuiteDto = {
        projectId,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        sortOrder: sortOrder.trim() ? Number(sortOrder) : null,
      };
      await onSubmit(dto);
    } else {
      const dto: UpdateTestSuiteDto = {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        sortOrder: sortOrder.trim() ? Number(sortOrder) : null,
      };
      await onSubmit(dto);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Suite" : "Edit Suite"}</DialogTitle>
          <DialogDescription>Suites help you structure test cases by feature area.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Authentication" />
          <Input label="Sort Order (optional)" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="e.g., 10" />
        </div>

        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description..."
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={busy} disabled={!name.trim()}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}