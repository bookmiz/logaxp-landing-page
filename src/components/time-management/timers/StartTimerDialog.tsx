"use client";

import * as React from "react";
import { Play, Sparkles, ChevronDown, X, Search } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Modal } from "@/logaxp/components/time-management/dialogs/Modal";

import type { StartTimerDto } from "@/logaxp/lib/time-management/timeManagement.types";
import type { AsyncSelectItem } from "@/logaxp/components/time-management/pickers/AsyncSelect";

// ✅ adjust this import to your real path
import { fetchProjects, fetchWorkItems } from "@/logaxp/components/time-management/pickers/projectPickers";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  membershipId: string | null;
  busy?: boolean;
  onStart: (dto: StartTimerDto) => void | Promise<void>;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function AsyncPicker({
  label,
  placeholder,
  value,
  onChange,
  loadItems,
  disabled,
  hint,
}: {
  label: string;
  placeholder: string;
  value: AsyncSelectItem | null;
  onChange: (v: AsyncSelectItem | null) => void;
  loadItems: (q: string) => Promise<AsyncSelectItem[]>;
  disabled?: boolean;
  hint?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<AsyncSelectItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  // close dropdown when disabled toggles on
  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  // load options (debounced)
  React.useEffect(() => {
    if (!open) return;

    let alive = true;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await loadItems(q.trim());
        if (alive) setItems(res);
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [open, q, loadItems]);

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</div>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={cx(
            "h-10 w-full rounded-xl border bg-white px-3 text-left text-sm shadow-sm outline-none transition",
            "border-slate-200 text-slate-800 hover:bg-slate-50",
            "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/30",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          <span className="flex items-center justify-between gap-2">
            <span className={cx("truncate", !value && "text-slate-400 dark:text-slate-500")}>
              {value ? value.label : placeholder}
            </span>

            <span className="inline-flex items-center gap-1">
              {value ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                    setQ("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onChange(null);
                      setQ("");
                    }
                  }}
                  className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Clear"
                >
                  <X className="h-4 w-4" />
                </span>
              ) : null}

              <ChevronDown className="h-4 w-4 opacity-70" />
            </span>
          </span>
        </button>

        {open ? (
          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="mt-2 max-h-56 overflow-auto">
              {loading ? (
                <div className="rounded-xl p-3 text-sm text-slate-500 dark:text-slate-400">Loading…</div>
              ) : items.length ? (
                <div className="space-y-1">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => {
                        onChange(it);
                        setOpen(false);
                        setQ("");
                      }}
                      className={cx(
                        "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                        "hover:bg-slate-50 dark:hover:bg-slate-900/30",
                        value?.id === it.id && "bg-emerald-50 dark:bg-emerald-950/20"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate font-medium text-slate-900 dark:text-slate-50">{it.label}</div>
                        {it.meta ? (
                          <div className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400">{it.meta}</div>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{it.id}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-3 text-sm text-slate-500 dark:text-slate-400">No results.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {hint ? <div className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</div> : null}
    </div>
  );
}

export function StartTimerDialog({ open, onOpenChange, membershipId, busy, onStart }: Props) {
  const [project, setProject] = React.useState<AsyncSelectItem | null>(null);
  const [workItem, setWorkItem] = React.useState<AsyncSelectItem | null>(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setProject(null);
    setWorkItem(null);
    setErr("");
  }, [open]);

  // If project changes, clear work item (prevents stale mismatched selection)
  React.useEffect(() => {
    // keep workItem if user didn’t change project (but if project is cleared, clear workItem too)
    if (!project) setWorkItem(null);
  }, [project]);

  const submit = async () => {
    setErr("");
    if (!membershipId) {
      setErr("Missing membership context.");
      return;
    }

    try {
      await onStart({
        membershipId,
        projectId: project?.id ?? null,
        workItemId: workItem?.id ?? null,
      });

      onOpenChange(false);
    } catch (e: any) {
      setErr(typeof e?.message === "string" ? e.message : "Failed to start timer.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Start Timer"
      subtitle="Start a focused work session (project/work item optional)."
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !membershipId}>
            <Play className="h-4 w-4" />
            Start
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Timer
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Leave blank if you want — you can assign later.
          </div>
        </div>

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            {err}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <AsyncPicker
            label="Project (optional)"
            placeholder="Search projects…"
            value={project}
            onChange={(v) => setProject(v)}
            loadItems={fetchProjects}
          />

          <AsyncPicker
            label="Work item (optional)"
            placeholder={project ? "Search work items in project…" : "Search work items…"}
            value={workItem}
            onChange={(v) => setWorkItem(v)}
            loadItems={(q) => fetchWorkItems({ q, projectId: project?.id ?? null })}
            hint={project ? `Filtering by project: ${project.label}` : "Tip: select a project to narrow results."}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
          <div className="font-medium">Policy note</div>
          <div className="mt-1 text-slate-600 dark:text-slate-300">
            Backend enforces “single running timer per member”. If you already have one running, we’ll show the error here.
          </div>
        </div>
      </div>
    </Modal>
  );
}