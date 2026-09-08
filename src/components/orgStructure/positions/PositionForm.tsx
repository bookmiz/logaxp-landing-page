"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/logaxp/components/ui/input";
import type { CreatePositionDto, UpdatePositionDto, Position } from "@/logaxp/lib/orgStructure/orgStructure.types";

export function PositionForm({
  mode,
  initial,
  loading,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Partial<Position>; // ✅ accept actual Position shape safely
  loading?: boolean;
  onSubmit: (dto: CreatePositionDto | UpdatePositionDto) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [level, setLevel] = useState(initial?.level ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (code.trim().length > 40) e.code = "Code is too long (max 40)";
    if (title.trim().length > 180) e.title = "Title is too long (max 180)";
    if (level.trim().length > 80) e.level = "Level is too long (max 80)";
    if (description.trim().length > 1000) e.description = "Description is too long (max 1000)";
    return e;
  }, [name, code, title, level, description]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  const submit = () => {
    if (!canSubmit) return;

    const base: CreatePositionDto = {
      name: name.trim(),
      title: title.trim() ? title.trim() : null,
      code: code.trim() ? code.trim() : null,
      level: level.trim() ? level.trim() : null,
      description: description.trim() ? description.trim() : null,
    };

    onSubmit(mode === "create" ? base : (base as UpdatePositionDto));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Name"
          placeholder='e.g. "Manager"'
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <Input
          label="Short Title (optional)"
          placeholder='e.g. "MGR"'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Code (optional)"
          placeholder='e.g. "001"'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={errors.code}
        />

        <Input
          label="Level (optional)"
          placeholder='e.g. "L2" or "Senior"'
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          error={errors.level}
        />
      </div>

      <Input
        label="Description (optional)"
        placeholder="What does this position typically handle?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
      />

      {/* hidden submit trigger used by modal footer buttons */}
      <button
        type="button"
        data-form-submit="position"
        onClick={submit}
        disabled={!canSubmit}
        className="hidden"
      />
    </div>
  );
}