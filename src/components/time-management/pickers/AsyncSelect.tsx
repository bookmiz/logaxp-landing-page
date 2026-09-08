"use client";

import * as React from "react";
import { Search, ChevronDown } from "lucide-react";
import { useDebouncedValue } from "@/logaxp/hooks/useDebouncedValue";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export type AsyncSelectItem = {
  id: string;
  label: string;
  meta?: string;
};

type Props = {
  valueId?: string | null;
  valueLabel?: string | null;

  placeholder?: string;
  disabled?: boolean;

  fetcher: (q: string) => Promise<AsyncSelectItem[]>;
  onSelect: (item: AsyncSelectItem | null) => void;

  allowClear?: boolean;
};

export function AsyncSelect({
  valueId,
  valueLabel,
  placeholder = "Search…",
  disabled,
  fetcher,
  onSelect,
  allowClear = true,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const dq = useDebouncedValue(q, 250);

  const [items, setItems] = React.useState<AsyncSelectItem[]>([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let live = true;

    (async () => {
      setBusy(true);
      try {
        const res = await fetcher(dq.trim());
        if (live) setItems(res);
      } finally {
        if (live) setBusy(false);
      }
    })();

    return () => {
      live = false;
    };
  }, [open, dq, fetcher]);

  return (
    <div className={cx("relative", disabled && "opacity-60 pointer-events-none")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-800 shadow-sm",
          "hover:bg-slate-50",
          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate">
              {valueId ? (valueLabel ? valueLabel : valueId) : <span className="text-slate-400">{placeholder}</span>}
            </div>
            {valueId && (
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {valueId}
              </div>
            )}
          </div>
          <ChevronDown className={cx("h-4 w-4 opacity-70 transition", open && "rotate-180")} />
        </div>
      </button>

      {open ? (
        <div className="absolute z-[80] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-100 p-2 dark:border-slate-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type to search…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950/40"
              />
            </div>
          </div>

          <div className="max-h-[280px] overflow-auto p-2">
            {allowClear && valueId ? (
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="mb-2 w-full rounded-xl border border-dashed border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Clear selection
              </button>
            ) : null}

            {busy ? (
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                Searching…
              </div>
            ) : items.length ? (
              items.map((it) => (
                <button
                  type="button"
                  key={it.id}
                  onClick={() => {
                    onSelect(it);
                    setOpen(false);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{it.label}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {it.id}{it.meta ? ` • ${it.meta}` : ""}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                No results.
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-2 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}