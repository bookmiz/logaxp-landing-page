"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  RefCountry,
  RefCurrency,
  RefListResult,
  RefState,
  RefTimezone,
} from "./reference.types";

function extractItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: T[] }).items;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data &&
    typeof payload.data === "object" &&
    "items" in (payload.data as Record<string, unknown>) &&
    Array.isArray((payload.data as { items?: unknown }).items)
  ) {
    return ((payload as { data: { items: T[] } }).data.items ?? []) as T[];
  }

  return [];
}

export const referenceService = {
  async listCountries() {
    const res = await api.get<RefListResult<RefCountry> | { data: RefListResult<RefCountry> }>(
      "/public/reference/countries"
    );
    return extractItems<RefCountry>(res.data);
  },

  async listStates(countryCode: string) {
    const res = await api.get<RefListResult<RefState> | { data: RefListResult<RefState> }>(
      "/public/reference/states",
      {
        params: { countryCode },
      }
    );
    return extractItems<RefState>(res.data);
  },

  async listCurrencies() {
    const res = await api.get<RefListResult<RefCurrency> | { data: RefListResult<RefCurrency> }>(
      "/public/reference/currencies"
    );
    return extractItems<RefCurrency>(res.data);
  },

  async listTimezones() {
    const res = await api.get<RefListResult<RefTimezone> | { data: RefListResult<RefTimezone> }>(
      "/public/reference/timezones"
    );
    return extractItems<RefTimezone>(res.data);
  },
};