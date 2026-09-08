"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/logaxp/components/ui/input";
import { SelectField } from "@/logaxp/components/orgStructure/shared/SelectField";
import type {
  CreateOrgUnitDto,
  OrgUnitType,
  UpdateOrgUnitDto,
} from "@/logaxp/lib/orgStructure/orgStructure.types";
import { OrgUnitParentPicker } from "./OrgUnitParentPicker";
import { EmployeeSelect } from "@/logaxp/components/lookups/EmployeeSelect";

const ORG_TYPES: Array<{ value: OrgUnitType; label: string }> = [
  { value: "DIVISION", label: "Division" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "TEAM", label: "Team" },
];

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export function OrgUnitForm({
  mode,
  initial,
  excludeId,
  onSubmit,
  loading,
}: {
  mode: "create" | "edit";
  initial?: Partial<CreateOrgUnitDto> & { id?: string };
  excludeId?: string;
  onSubmit: (dto: CreateOrgUnitDto | UpdateOrgUnitDto) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<OrgUnitType>(
    (initial?.type as OrgUnitType) ?? "DIVISION"
  );
  const [parentId, setParentId] = useState<string | null>(
    (initial?.parentId as string | null | undefined) ?? null
  );
  const [code, setCode] = useState(initial?.code ?? "");
  const [managerEmployeeId, setManagerEmployeeId] = useState<string>(
    (initial?.managerEmployeeId as string | undefined) ?? ""
  );

  const [touched, setTouched] = useState<{ name: boolean; type: boolean }>({
    name: false,
    type: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [codeDirty, setCodeDirty] = useState(false);

  useEffect(() => {
    setName(initial?.name ?? "");
    setType(((initial?.type as OrgUnitType) ?? "DIVISION") as OrgUnitType);
    setParentId((initial?.parentId as string | null | undefined) ?? null);
    setCode(initial?.code ?? "");
    setManagerEmployeeId((initial?.managerEmployeeId as string | undefined) ?? "");

    setTouched({ name: false, type: false });
    setSubmitted(false);
    setCodeDirty(false);
  }, [initial?.id, mode, initial?.name, initial?.type, initial?.parentId, initial?.code, initial?.managerEmployeeId]);

  useEffect(() => {
    if (mode !== "create") return;
    if (codeDirty) return;
    if (!name.trim()) return;

    setCode(slugify(name));
  }, [name, mode, codeDirty]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Name is required";
    if (!type) e.type = "Type is required";

    return e;
  }, [name, type]);

  const showNameError = (touched.name || submitted) && !!errors.name;
  const showTypeError = (touched.type || submitted) && !!errors.type;

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  const submit = () => {
    setSubmitted(true);
    if (!canSubmit) return;

    const base = {
      name: name.trim(),
      type,
      parentId: parentId ?? null,
      code: code.trim() ? code.trim() : null,
      managerEmployeeId: managerEmployeeId.trim() ? managerEmployeeId.trim() : null,
    };

    onSubmit(
      mode === "create"
        ? (base as CreateOrgUnitDto)
        : (base as UpdateOrgUnitDto)
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-4 md:p-5">
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-900">Basics</div>
          <div className="text-xs text-slate-600">
            Define the org unit and assign its head if needed.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              error={showNameError ? errors.name : undefined}
            />
          </div>

          <div>
            <SelectField
              label="Type"
              value={type}
              onChange={(v) => setType(v as OrgUnitType)}
              options={ORG_TYPES}
              placeholder="Select type"
            />
            {showTypeError ? (
              <p className="mt-1 text-xs text-red-600">{errors.type}</p>
            ) : null}
          </div>

          <div>
            <Input
              label="Code (optional)"
              value={code}
              onChange={(e) => {
                setCodeDirty(true);
                setCode(e.target.value);
              }}
            />
            <p className="mt-1 text-xs text-slate-600">
              Used for integrations and internal references.
            </p>
          </div>

          <div className="md:col-span-2">
            <EmployeeSelect
              label="Org Unit Head / Manager (optional)"
              value={managerEmployeeId}
              onChange={setManagerEmployeeId}
              placeholder="Search employee..."
            />
            <p className="mt-1 text-xs text-slate-600">
              Assign the employee responsible for this org unit.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 md:p-5">
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-900">Placement</div>
          <div className="text-xs text-slate-600">
            Choose where this unit sits in your organization hierarchy.
          </div>
        </div>

        <OrgUnitParentPicker
          value={parentId}
          onChange={setParentId}
          excludeId={excludeId}
        />

        <div className="mt-3 rounded-xl border bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <span className="font-medium">Tip:</span> Leave parent empty to make
          this a top-level unit.
        </div>
      </div>

      <button
        type="button"
        data-form-submit="orgunit"
        onClick={submit}
        disabled={!canSubmit}
        className="hidden"
      />
    </div>
  );
}