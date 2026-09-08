// src/hooks/useDebouncedValue.ts
"use client";

import * as React from "react";

/**
 * useDebouncedValue
 * - Debounces any value (string, number, object reference, etc.)
 * - Great for search inputs, filters, etc.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = React.useState<T>(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}