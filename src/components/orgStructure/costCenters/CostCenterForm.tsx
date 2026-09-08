"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/logaxp/components/ui/input";
import { EmployeeSelect } from "@/logaxp/components/lookups/EmployeeSelect";
import type {
  CreateCostCenterDto,
  UpdateCostCenterDto,
} from "@/logaxp/lib/orgStructure/orgStructure.types";

export function CostCenterForm({
  mode,
  initial,
  loading,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Partial<CreateCostCenterDto> & { ownerEmployeeId?: string | null };
  loading?: boolean;
  onSubmit: (dto: CreateCostCenterDto | UpdateCostCenterDto) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState((initial?.code as string) ?? "");
  const [description, setDescription] = useState(
    (initial?.description as string) ?? ""
  );
  const [ownerEmployeeId, setOwnerEmployeeId] = useState(
    (initial?.ownerEmployeeId as string | null | undefined) ?? ""
  );

  useEffect(() => {
    setName(initial?.name ?? "");
    setCode((initial?.code as string) ?? "");
    setDescription((initial?.description as string) ?? "");
    setOwnerEmployeeId(
      (initial?.ownerEmployeeId as string | null | undefined) ?? ""
    );
  }, [initial]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (mode === "create" || name.trim().length > 0) {
      if (!name.trim()) e.name = "Name is required";
    }
    return e;
  }, [mode, name]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  const submit = () => {
    if (!canSubmit) return;

    const dto = {
      name: name.trim(),
      code: code.trim() ? code.trim() : null,
      description: description.trim() ? description.trim() : null,
      ownerEmployeeId: ownerEmployeeId || null,
    };

    onSubmit(dto as CreateCostCenterDto | UpdateCostCenterDto);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-4 md:p-5">
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-900">Basics</div>
          <div className="text-xs text-slate-600">
            Define the financial grouping and internal reference details.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
          </div>

          <Input
            label="Code (optional)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 md:p-5">
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-900">Ownership</div>
          <div className="text-xs text-slate-600">
            Assign the employee responsible for this cost center.
          </div>
        </div>

        <EmployeeSelect
          label="Owner (optional)"
          value={ownerEmployeeId}
          onChange={setOwnerEmployeeId}
          placeholder="Search employee..."
        />
      </div>

      <button
        type="button"
        data-form-submit="costcenter"
        onClick={submit}
        disabled={!canSubmit}
        className="hidden"
      />
    </div>
  );
}