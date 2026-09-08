"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import type {
  CreateTestCaseDto,
  TestCase,
  TestCasePriority,
  TestCaseStatus,
  TestSuite,
  UpdateTestCaseDto,
} from "@/logaxp/lib/testing/testing.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";
import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function parseTags(v: string): string[] {
  return v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x, i, a) => a.indexOf(x) === i);
}

export function TestCaseCreateEditDialog({
  open,
  onOpenChange,
  mode,
  projectId,
  suites,
  caseRow,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "create" | "edit";
  projectId: string;
  suites: TestSuite[];
  caseRow?: TestCase | null;
  busy?: boolean;
  onSubmit: (dto: CreateTestCaseDto | UpdateTestCaseDto) => void | Promise<void>;
}) {
  const [suiteId, setSuiteId] = React.useState<string>("__none__");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [priority, setPriority] = React.useState<TestCasePriority>("MEDIUM");
  const [status, setStatus] = React.useState<TestCaseStatus>("ACTIVE");

  const [tagsInput, setTagsInput] = React.useState("");
  const [steps, setSteps] = React.useState<Array<{ title?: string; action: string; expected: string }>>([]);
  const [refs, setRefs] = React.useState<Array<{ label?: string; url: string }>>([]);

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && caseRow) {
      setSuiteId(caseRow.suiteId ?? "__none__");
      setTitle(caseRow.title ?? "");
      setDescription(caseRow.description ?? "");
      setPriority(caseRow.priority ?? "MEDIUM");
      setStatus(caseRow.status ?? "ACTIVE");
      setTagsInput(Array.isArray(caseRow.tags) ? caseRow.tags.join(", ") : "");
      setSteps(Array.isArray(caseRow.steps) ? caseRow.steps.map((s) => ({ ...s })) : []);
      setRefs(Array.isArray(caseRow.references) ? caseRow.references.map((r) => ({ ...r })) : []);
    } else {
      setSuiteId("__none__");
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus("ACTIVE");
      setTagsInput("");
      setSteps([]);
      setRefs([]);
    }
  }, [open, mode, caseRow]);

  const addStep = () => setSteps((p) => [...p, { title: "", action: "", expected: "" }]);
  const removeStep = (idx: number) => setSteps((p) => p.filter((_, i) => i !== idx));

  const addRef = () => setRefs((p) => [...p, { label: "", url: "" }]);
  const removeRef = (idx: number) => setRefs((p) => p.filter((_, i) => i !== idx));

  const canSubmit = title.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;

    const tags = parseTags(tagsInput);

    const cleanedSteps = steps
      .map((s) => ({
        title: s.title?.trim() ? s.title.trim() : undefined,
        action: (s.action ?? "").trim(),
        expected: (s.expected ?? "").trim(),
      }))
      .filter((s) => s.action && s.expected);

    const cleanedRefs = refs
      .map((r) => ({
        label: r.label?.trim() ? r.label.trim() : undefined,
        url: (r.url ?? "").trim(),
      }))
      .filter((r) => r.url);

    const normalizedSuiteId = suiteId === "__none__" ? null : suiteId;

    if (mode === "create") {
      const dto: CreateTestCaseDto = {
        projectId,
        suiteId: normalizedSuiteId,
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        priority,
        status,
        tags: tags.length ? tags : undefined,
        steps: cleanedSteps.length ? cleanedSteps : undefined,
        references: cleanedRefs.length ? cleanedRefs : undefined,
      };
      await onSubmit(dto);
    } else {
      const dto: UpdateTestCaseDto = {
        suiteId: normalizedSuiteId,
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        priority,
        status,
        tags,
        steps: cleanedSteps,
        references: cleanedRefs,
      };
      await onSubmit(dto);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[980px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Test Case" : "Edit Test Case"}</DialogTitle>
          <DialogDescription>
            Author high-quality test cases with steps, tags, references, and suite placement.
          </DialogDescription>
        </DialogHeader>

        {/* Header grid */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px_240px_240px]">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Login with valid credentials" />

          <div className="space-y-1">
            <Select value={suiteId} onValueChange={setSuiteId}>
              <SelectTrigger label="Suite">
                <SelectValue placeholder="No suite" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Suites</SelectLabel>
                  <SelectItem value="__none__">No suite</SelectItem>
                  {suites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Select value={priority} onValueChange={(v) => setPriority(v as TestCasePriority)}>
              <SelectTrigger label="Priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="LOW">LOW</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Select value={status} onValueChange={(v) => setStatus(v as TestCaseStatus)}>
              <SelectTrigger label="Status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="DEPRECATED">DEPRECATED</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this case validate?"
        />

        <Input
          label="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g., auth, login, regression"
          hint="Tags help filter cases and build plans quickly."
        />

        {/* Steps */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Steps</div>
              <div className="text-xs text-slate-500">Add action + expected result pairs.</div>
            </div>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="h-4 w-4" />
              Add step
            </Button>
          </div>

          <div className="mt-3 space-y-3">
            {steps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                No steps yet. Add at least one step for better execution quality.
              </div>
            ) : null}

            {steps.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Step {idx + 1}</div>
                  <Button variant="outline" size="sm" onClick={() => removeStep(idx)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <Input
                    label="Title (optional)"
                    value={s.title ?? ""}
                    onChange={(e) =>
                      setSteps((p) => p.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                    }
                    placeholder="e.g., Enter email"
                  />

                  <Input
                    label="Action"
                    value={s.action}
                    onChange={(e) =>
                      setSteps((p) => p.map((x, i) => (i === idx ? { ...x, action: e.target.value } : x)))
                    }
                    placeholder="What does the user do?"
                  />

                  <Input
                    label="Expected"
                    value={s.expected}
                    onChange={(e) =>
                      setSteps((p) => p.map((x, i) => (i === idx ? { ...x, expected: e.target.value } : x)))
                    }
                    placeholder="What should happen?"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* References */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">References</div>
              <div className="text-xs text-slate-500">Links to docs, PRDs, screenshots, specs.</div>
            </div>
            <Button variant="outline" size="sm" onClick={addRef}>
              <Plus className="h-4 w-4" />
              Add reference
            </Button>
          </div>

          <div className="mt-3 space-y-3">
            {refs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                No references added.
              </div>
            ) : null}

            {refs.map((r, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl border border-slate-200 p-3 dark:border-slate-800",
                  "bg-slate-50 dark:bg-slate-900/40"
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Reference {idx + 1}</div>
                  <Button variant="outline" size="sm" onClick={() => removeRef(idx)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[240px_1fr]">
                  <Input
                    label="Label (optional)"
                    value={r.label ?? ""}
                    onChange={(e) =>
                      setRefs((p) => p.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))
                    }
                    placeholder="e.g., PRD section"
                  />
                  <Input
                    label="URL"
                    value={r.url}
                    onChange={(e) =>
                      setRefs((p) => p.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={busy} disabled={!canSubmit}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}