"use client";

import * as React from "react";

export function useShiftSelection() {
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());

  const isSelected = React.useCallback((id: string) => selected.has(id), [selected]);

  const toggle = React.useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = React.useCallback(() => setSelected(new Set()), []);
  const setAll = React.useCallback((ids: string[]) => setSelected(new Set(ids)), []);
  const list = React.useMemo(() => Array.from(selected), [selected]);

  return { selected, list, isSelected, toggle, clear, setAll, count: selected.size };
}