"use client";

import * as React from "react";
import { Save, ChevronDown } from "lucide-react";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import type { OnboardingStep } from "@/logaxp/lib/onboarding/onboarding.types";

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
import { Textarea } from "@/logaxp/components/ui/textarea";
import { Badge } from "@/logaxp/components/ui/badge";
import { toast } from "@/logaxp/components/ui/toast";

/** ---------------------------
 * Helpers
 * -------------------------- */
function parseJsonObject(text: string, label: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed) return null;
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${label} must be a JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (e) {
    throw new Error(
      e instanceof Error ? e.message : `${label} contains invalid JSON`,
    );
  }
}

function pretty(v: unknown) {
  if (!v) return "";
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
}

function slugToKey(input: string) {
  // snake_case-ish and safe
  const s = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  const base = s || "step";
  return base.slice(0, 80);
}

function isIntLike(v: string) {
  if (!v.trim()) return false;
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n);
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const STEP_KIND_PRESETS = [
  { value: "TASK", label: "Task", desc: "A general task to complete" },
  {
    value: "DOCUMENT_REQUEST",
    label: "Document Request",
    desc: "Request & attach documents",
  },
  { value: "FORM", label: "Form", desc: "Complete a form or questionnaire" },
  {
    value: "POLICY_ACK",
    label: "Policy Acknowledgement",
    desc: "Acknowledge a policy",
  },
] as const;

const DUE_DAY_PRESETS = [
  { value: "", label: "No due date" },
  { value: "1", label: "1 day" },
  { value: "2", label: "2 days" },
  { value: "3", label: "3 days" },
  { value: "5", label: "5 days" },
  { value: "7", label: "1 week" },
  { value: "10", label: "10 days" },
  { value: "14", label: "2 weeks" },
  { value: "30", label: "30 days" },
] as const;

export function OnboardingStepCreateEditDialog({
  open,
  onOpenChange,
  templateId,
  step,
  onSaved,

  /** ✅ pass rows.length from StepsManager for create */
  suggestedOrder = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  step: OnboardingStep | null;
  onSaved: () => Promise<void> | void;
  suggestedOrder?: number;
}) {
  const { steps } = useOnboarding();
  const isEdit = Boolean(step?.id);

  const [saving, setSaving] = React.useState(false);

  // Required by backend for CREATE
  const [key, setKey] = React.useState("");
  const [order, setOrder] = React.useState<number>(0);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [kind, setKind] = React.useState("TASK");
  const [required, setRequired] = React.useState(true);

  // Due days (backend calls it dueDaysFromStart)
  const [dueDaysMode, setDueDaysMode] = React.useState<
    "none" | "preset" | "custom"
  >("none");
  const [dueDaysPreset, setDueDaysPreset] = React.useState<string>("3");
  const [dueDaysCustom, setDueDaysCustom] = React.useState<string>("");

  // Advanced
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [metadataText, setMetadataText] = React.useState("");

  // Track whether user manually edited key
  const keyTouchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;

    const initialTitle = String(step?.title ?? step?.name ?? "");
    const initialDesc = String(step?.description ?? "");
    const initialKind = String(step?.kind ?? step?.type ?? "TASK");
    const initialRequired = Boolean(step?.required ?? true);

    setTitle(initialTitle);
    setDescription(initialDesc);
    setKind(initialKind);
    setRequired(initialRequired);

    // ✅ backend requires key/order on create
    const existingKey = String(step?.key ?? "");
    const existingOrder = step?.order;

    keyTouchedRef.current = false;
    setKey(existingKey || slugToKey(initialTitle) || "step");
    setOrder(
      Number.isFinite(Number(existingOrder))
        ? Number(existingOrder)
        : clampInt(Number(suggestedOrder ?? 0), 0, 99999),
    );

    const dd = step?.dueDaysFromStart ?? step?.dueDays ?? null;
    if (typeof dd === "number" && Number.isFinite(dd)) {
      const ddStr = String(dd);
      const isPreset = DUE_DAY_PRESETS.some((p) => p.value === ddStr);
      setDueDaysMode(isPreset ? "preset" : "custom");
      setDueDaysPreset(isPreset ? ddStr : "3");
      setDueDaysCustom(!isPreset ? ddStr : "");
    } else {
      setDueDaysMode("none");
      setDueDaysPreset("3");
      setDueDaysCustom("");
    }

    const meta = pretty(step?.metadata ?? null);
    setMetadataText(meta);

    setAdvancedOpen(Boolean(meta.trim()));
  }, [open, step, suggestedOrder]);

  // Auto-generate key from title (only if user hasn't edited key)
  React.useEffect(() => {
    if (!open) return;
    if (isEdit) return; // don't auto-change key on edit unless they want to
    if (keyTouchedRef.current) return;

    const next = slugToKey(title);
    if (next && next !== key) setKey(next);
  }, [title, open, isEdit]); // intentionally not depending on key to avoid loops

  const kindPreset = STEP_KIND_PRESETS.find(
    (k) => k.value === kind.trim().toUpperCase(),
  );

  const keyError = React.useMemo(() => {
    const v = key.trim();
    if (!v) return "Key is required";
    if (v.length > 80) return "Key must be 80 characters or less";
    return null;
  }, [key]);

  const orderError = React.useMemo(() => {
    if (!Number.isFinite(order)) return "Order must be a number";
    if (!Number.isInteger(order)) return "Order must be an integer";
    if (order < 0) return "Order must be 0 or greater";
    return null;
  }, [order]);

  const dueDaysValue = React.useMemo(() => {
    if (dueDaysMode === "none") return null;

    const raw = (
      dueDaysMode === "preset" ? dueDaysPreset : dueDaysCustom
    ).trim();
    if (!raw) return null;

    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return NaN;
    return n;
  }, [dueDaysMode, dueDaysPreset, dueDaysCustom]);

  const dueDaysError = React.useMemo(() => {
    if (dueDaysMode === "none") return null;
    if (dueDaysMode === "preset") return null;

    const raw = dueDaysCustom.trim();
    if (!raw) return "Enter due days";
    if (!isIntLike(raw)) return "Due days must be a whole number";
    const n = Number(raw);
    if (n < 0) return "Due days must be 0 or greater";
    if (n > 3650) return "Due days too large (max 3650)";
    return null;
  }, [dueDaysMode, dueDaysCustom]);

  const canSave =
    title.trim().length >= 2 &&
    !saving &&
    !keyError &&
    !orderError &&
    !dueDaysError;

  const submit = async () => {
    if (!canSave) return;

    let metadataObj: Record<string, unknown> | null = null;

    try {
      metadataObj = parseJsonObject(metadataText, "Metadata");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid JSON");
      return;
    }

    if (
      dueDaysMode !== "none" &&
      (dueDaysValue === null || Number.isNaN(dueDaysValue))
    ) {
      toast.error("Due days must be a valid whole number");
      return;
    }

    try {
      setSaving(true);

      // ✅ Matches backend DTO exactly
      const payload: Record<string, unknown> = {
        key: key.trim(),
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        kind: kind.trim(),
        required,
        order,
        dueDaysFromStart: dueDaysMode === "none" ? null : dueDaysValue,
        metadata: metadataObj ?? null,
      };

      if (isEdit && step?.id) {
        await steps.update(step.id, payload);
        toast.success("Step updated");
      } else {
        await steps.create(templateId, payload);
        toast.success("Step created");
      }

      await onSaved();
    } catch (e) {
      console.error(e);
      toast.error(isEdit ? "Failed to update step" : "Failed to create step");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2">
                {isEdit ? "Edit Step" : "Add Step"}
                <Badge
                  variant={required ? "success" : "muted"}
                  className="h-5 px-2 text-[10px]"
                >
                  {required ? "REQUIRED" : "OPTIONAL"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Give this step a unique reference and choose its position in the
                checklist.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="muted" className="h-6 px-2 text-[10px]">
                {(kindPreset?.label ?? kind).toUpperCase()}
              </Badge>
              <Badge variant="muted" className="h-6 px-2 text-[10px]">
                {dueDaysMode === "none"
                  ? "NO DUE"
                  : `DUE ${String(dueDaysMode === "preset" ? dueDaysPreset : dueDaysCustom)}d`}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Basics */}
            <section className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Basics
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  Required
                </label>
              </div>

              <div className="space-y-2">
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Collect ID Document"
                />

                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the employee/HR should do..."
                  resize="y"
                  size="sm"
                  className="min-h-[96px]"
                />

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Kind
                  </label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                  >
                    {STEP_KIND_PRESETS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label} ({k.value})
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-500">
                    {kindPreset?.desc ??
                      "Choose the type of onboarding activity."}
                  </div>
                </div>
              </div>
            </section>

            {/* Key + Order + Due */}
            <section className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Scheduling
              </div>

              <div className="space-y-2">
                <Input
                  label="Key (required, max 80)"
                  value={key}
                  onChange={(e) => {
                    keyTouchedRef.current = true;
                    setKey(e.target.value);
                  }}
                  placeholder="collect_id_document"
                  error={keyError ?? undefined}
                  hint="A unique reference for this step."
                />

                <Input
                  label="Order (required, 0+)"
                  value={String(order)}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!raw.trim()) return setOrder(0);
                    const n = Number(raw);
                    setOrder(Number.isFinite(n) ? Math.trunc(n) : 0);
                  }}
                  placeholder="0"
                  error={orderError ?? undefined}
                  hint="Controls default step sequence. You can reorder later."
                />

                {/* Due date picker */}
                <div className="mt-2">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Due Days From Start
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Chip
                      active={dueDaysMode === "none"}
                      onClick={() => setDueDaysMode("none")}
                    >
                      None
                    </Chip>
                    <Chip
                      active={dueDaysMode === "preset"}
                      onClick={() => {
                        setDueDaysMode("preset");
                        if (!dueDaysPreset) setDueDaysPreset("3");
                      }}
                    >
                      Preset
                    </Chip>
                    <Chip
                      active={dueDaysMode === "custom"}
                      onClick={() => {
                        setDueDaysMode("custom");
                        if (!dueDaysCustom) setDueDaysCustom("3");
                      }}
                    >
                      Custom
                    </Chip>
                  </div>

                  <div className="mt-2 space-y-2">
                    {dueDaysMode === "none" ? (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                        No due date for this step.
                      </div>
                    ) : dueDaysMode === "preset" ? (
                      <select
                        value={dueDaysPreset}
                        onChange={(e) => setDueDaysPreset(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                      >
                        {DUE_DAY_PRESETS.filter((p) => p.value !== "").map(
                          (p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      <Input
                        label="Custom due days"
                        value={dueDaysCustom}
                        onChange={(e) => setDueDaysCustom(e.target.value)}
                        placeholder="e.g. 3"
                        error={dueDaysError ?? undefined}
                        hint="Whole number. 0 = due immediately."
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Advanced (metadata only; backend doesn't accept config) */}
          <section className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Advanced
              </div>
              <ChevronDown
                className={[
                  "h-4 w-4 transition",
                  advancedOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {advancedOpen ? (
              <div className="mt-3">
                <Textarea
                  label="Metadata JSON (optional)"
                  value={metadataText}
                  onChange={(e) => setMetadataText(e.target.value)}
                  className="min-h-[160px] font-mono text-xs"
                  resize="y"
                  hint='Example: { "uiHint": "upload", "docKinds": ["PASSPORT"] }'
                />
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-slate-500">
                Optional labels and additional details for this step.
              </div>
            )}
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            loading={saving}
            disabled={!canSave}
          >
            <Save className="h-4 w-4" />
            {isEdit ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** compact chips */
function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-8 rounded-lg px-3 text-xs border transition",
        active
          ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
