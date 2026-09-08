"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UseTimeRangeOpts = {
  syncToUrl?: boolean;         // default true
  urlKeys?: { from?: string; to?: string }; // default: from,to
  defaultDaysBack?: number;    // default 7
};

function isoDate(d: Date) {
  // YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(date: Date, delta: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

export function useTimeRange(opts: UseTimeRangeOpts = {}) {
  const {
    syncToUrl = true,
    urlKeys = { from: "from", to: "to" },
    defaultDaysBack = 7,
  } = opts;

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const fromKey = urlKeys.from ?? "from";
  const toKey = urlKeys.to ?? "to";

  const urlFrom = sp.get(fromKey) ?? "";
  const urlTo = sp.get(toKey) ?? "";

  const today = React.useMemo(() => new Date(), []);
  const defaultTo = React.useMemo(() => isoDate(today), [today]);
  const defaultFrom = React.useMemo(() => isoDate(addDays(today, -defaultDaysBack)), [today, defaultDaysBack]);

  const [from, setFrom] = React.useState(urlFrom || defaultFrom);
  const [to, setTo] = React.useState(urlTo || defaultTo);

  // If URL changes (back/forward), mirror into state.
  React.useEffect(() => {
    if (urlFrom && urlFrom !== from) setFrom(urlFrom);
    if (urlTo && urlTo !== to) setTo(urlTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlFrom, urlTo]);

  // Sync state -> URL (replace) to keep filters shareable.
  React.useEffect(() => {
    if (!syncToUrl) return;

    const next = new URLSearchParams(sp.toString());
    if (from) next.set(fromKey, from);
    else next.delete(fromKey);

    if (to) next.set(toKey, to);
    else next.delete(toKey);

    const nextQs = next.toString();
    const curQs = sp.toString();
    if (nextQs !== curQs) router.replace(`${pathname}?${nextQs}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, syncToUrl, pathname, router]);

  const setLastNDays = React.useCallback((n: number) => {
    const t = new Date();
    setTo(isoDate(t));
    setFrom(isoDate(addDays(t, -n)));
  }, []);

  const setThisMonth = React.useCallback(() => {
    const t = new Date();
    const start = new Date(t.getFullYear(), t.getMonth(), 1);
    setFrom(isoDate(start));
    setTo(isoDate(t));
  }, []);

  return {
    from,
    to,
    setFrom,
    setTo,
    setLastNDays,
    setThisMonth,
  };
}