"use client";

import * as React from "react";
import { Search, X, Check } from "lucide-react";

import { useEmployeeManagement } from "@/logaxp/hooks/useEmployeeManagement";
import type { EmployeeListItem } from "@/logaxp/lib/employee-management/employee-management.types";

import { Input } from "@/logaxp/components/ui/input";
import { Button } from "@/logaxp/components/ui/button";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function safeName(e: any) {
  const n = `${e?.firstName ?? ""} ${e?.lastName ?? ""}`.trim();
  return n || "—";
}

function safeEmail(e: any) {
  return String(e?.workEmail ?? e?.personalEmail ?? "").trim();
}

function safeNumber(e: any) {
  const v = (e as any)?.employeeNumber;
  return v ? `#${String(v)}` : "";
}

/**
 * EmployeeSelect (upgraded)
 * ✅ Uses your hook correctly: api.employees.list + api.employees.get
 * ✅ Supports "no employees" empty-state messaging
 * ✅ Can preload selected employee (value) for display
 * ✅ Better UX: opens on focus, keyboard friendly basics, clearer states
 */
export function EmployeeSelect({
  label = "Manager",
  value,
  onChange,
  onPick,
  disabled,
  placeholder = "Search employee name/email…",
  hint,
  error,

  // Optional behavior toggles
  allowClear = true,
  required = false,
  pageSize = 8,
  emptyStateText = "No employees found. Create an employee first to select one.",
}: {
  label?: string;
  value: string; // employeeId
  onChange: (employeeId: string) => void;
  onPick?: (employee: EmployeeListItem | null) => void;
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;

  allowClear?: boolean;
  required?: boolean;
  pageSize?: number;
  emptyStateText?: string;
}) {
  const api = useEmployeeManagement();

  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [items, setItems] = React.useState<EmployeeListItem[]>([]);
  const [selected, setSelected] = React.useState<EmployeeListItem | null>(null);

  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const [loadingSelected, setLoadingSelected] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  // Close on outside click
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = e.target as Node;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(el)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Keep selected in sync with value (preload label for selected id)
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      if (!value) {
        setSelected(null);
        return;
      }

      // If we already have the same selected, do nothing.
      if (selected?.id === value) return;

      try {
        setLoadingSelected(true);
        const res = await api.employees.get(value);
        const data = (res as any)?.data ?? res;
        if (!mounted) return;

        // Some backends return detail; we only need list fields.
        setSelected(data as any);
      } catch {
        // If employee no longer exists, clear selection
        if (!mounted) return;
        setSelected(null);
        onChange("");
        onPick?.(null);
      } finally {
        if (mounted) setLoadingSelected(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, api.employees, onChange]);

  const load = React.useCallback(async () => {
    const query = debouncedQ.trim();

    // If user hasn't typed anything, don't spam API.
    if (!query) {
      setItems([]);
      return;
    }

    try {
      setLoadingSearch(true);

      // ✅ hook correct usage
      const res = await api.employees.list({ q: query, page: 1, pageSize } as any);
      const data = (res as any)?.data ?? res;

      const rows: EmployeeListItem[] =
        Array.isArray(data?.items) ? (data.items as EmployeeListItem[]) : Array.isArray(data) ? (data as EmployeeListItem[]) : [];

      setItems(rows);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [api.employees, debouncedQ, pageSize]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const pick = (emp: EmployeeListItem) => {
    setSelected(emp);
    onChange(emp.id);
    onPick?.(emp);

    setOpen(false);
    setQ("");
    setItems([]);
  };

  const clear = () => {
    if (required) return;
    setSelected(null);
    onChange("");
    onPick?.(null);

    setQ("");
    setItems([]);
    setOpen(false);
  };

  const showValue = selected ? safeName(selected) : q;

  const showNoEmployeesHint =
    !loadingSearch &&
    debouncedQ.trim().length > 0 &&
    items.length === 0;

  const showDropdown = open && !disabled;

  return (
    <div ref={rootRef} className="relative">
      <Input
        label={label}
        value={showValue}
        onChange={(e) => {
          // If typing while a selection exists, switch into "search mode"
          if (selected) setSelected(null);
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        hint={hint}
        error={error}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          allowClear && value && !required ? (
            <button
              type="button"
              onClick={clear}
              className="text-slate-500 hover:text-slate-700 disabled:opacity-50"
              disabled={disabled}
              aria-label="Clear selection"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        }
      />

      {/* subtle selected loading indicator */}
      {loadingSelected ? (
        <div className="mt-1 text-xs text-slate-500">Loading selection…</div>
      ) : null}

      {showDropdown ? (
        <div
          className={cn(
            "absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
            "dark:border-slate-800 dark:bg-slate-950"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-900">
            <span>
              {loadingSearch
                ? "Searching…"
                : debouncedQ
                ? `Results (${items.length})`
                : "Type to search"}
            </span>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => setOpen(false)}
              type="button"
            >
              Close
            </Button>
          </div>

          {showNoEmployeesHint ? (
            <div className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
              {emptyStateText}
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="max-h-[280px] overflow-auto">
              {items.map((emp) => {
                const email = safeEmail(emp) || "—";
                const number = safeNumber(emp);

                const isSelected = value && emp.id === value;

                return (
                  <button
                    key={emp.id}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left transition",
                      "hover:bg-slate-50 dark:hover:bg-slate-900",
                      isSelected && "bg-slate-50 dark:bg-slate-900/50"
                    )}
                    onClick={() => pick(emp)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold truncate">{safeName(emp)}</div>
                          {isSelected ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{email}</div>
                      </div>

                      <div className="shrink-0 text-xs text-slate-500">{number}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* If user hasn't typed, suggest action */}
          {!debouncedQ && !loadingSearch ? (
            <div className="px-3 py-3 text-xs text-slate-500">
              Start typing to search employees by name or email.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}