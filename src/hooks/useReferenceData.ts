"use client";

import * as React from "react";
import { referenceService } from "@/logaxp/lib/reference/referenceService";
import type { RefCountry, RefCurrency, RefState, RefTimezone } from "@/logaxp/lib/reference/reference.types";

type Loadable<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

type UseReferenceDataResult = {
  countries: Loadable<RefCountry[]>;
  currencies: Loadable<RefCurrency[]>;
  timezones: Loadable<RefTimezone[]>;

  // states are cached by country code
  getStates: (countryCode: string) => Promise<RefState[]>;
  getCachedStates: (countryCode: string) => RefState[] | undefined;
  statesLoading: (countryCode: string) => boolean;
  statesError: (countryCode: string) => string | null;
};

/**
 * Extract error message from error object
 */
function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error as Record<string, unknown>;
    if (response.response && typeof response.response === 'object') {
      const data = response.response as Record<string, unknown>;
      if (data.data && typeof data.data === 'object') {
        const dataObj = data.data as Record<string, unknown>;
        if (typeof dataObj.message === 'string') {
          return dataObj.message;
        }
      }
    }
  }
  return defaultMessage;
}

/**
 * Module-level cache (shared across components)
 */
const cache = {
  countries: null as RefCountry[] | null,
  currencies: null as RefCurrency[] | null,
  timezones: null as RefTimezone[] | null,

  statesByCountry: new Map<string, RefState[]>(),
  statesInFlight: new Map<string, Promise<RefState[]>>(),
};

export function useReferenceData(): UseReferenceDataResult {
  const [countries, setCountries] = React.useState<Loadable<RefCountry[]>>({
    data: cache.countries ?? [],
    loading: cache.countries ? false : true,
    error: null,
  });

  const [currencies, setCurrencies] = React.useState<Loadable<RefCurrency[]>>({
    data: cache.currencies ?? [],
    loading: cache.currencies ? false : true,
    error: null,
  });

  const [timezones, setTimezones] = React.useState<Loadable<RefTimezone[]>>({
    data: cache.timezones ?? [],
    loading: cache.timezones ? false : true,
    error: null,
  });

  const [statesMeta, setStatesMeta] = React.useState<Record<string, { loading: boolean; error: string | null }>>(
    {}
  );

  const loadOnce = React.useCallback(async () => {
    // Countries
    if (!cache.countries) {
      setCountries((p) => ({ ...p, loading: true, error: null }));
      try {
        const rows = await referenceService.listCountries();
        cache.countries = rows;
        setCountries({ data: rows, loading: false, error: null });
      } catch (e: unknown) {
        const msg = extractErrorMessage(e, "Failed to load countries");
        setCountries((p) => ({ ...p, loading: false, error: msg }));
      }
    } else {
      setCountries((p) => ({ ...p, data: cache.countries ?? [], loading: false }));
    }

    // Currencies
    if (!cache.currencies) {
      setCurrencies((p) => ({ ...p, loading: true, error: null }));
      try {
        const rows = await referenceService.listCurrencies();
        cache.currencies = rows;
        setCurrencies({ data: rows, loading: false, error: null });
      } catch (e: unknown) {
        const msg = extractErrorMessage(e, "Failed to load currencies");
        setCurrencies((p) => ({ ...p, loading: false, error: msg }));
      }
    } else {
      setCurrencies((p) => ({ ...p, data: cache.currencies ?? [], loading: false }));
    }

    // Timezones
    if (!cache.timezones) {
      setTimezones((p) => ({ ...p, loading: true, error: null }));
      try {
        const rows = await referenceService.listTimezones();
        cache.timezones = rows;
        setTimezones({ data: rows, loading: false, error: null });
      } catch (e: unknown) {
        const msg = extractErrorMessage(e, "Failed to load timezones");
        setTimezones((p) => ({ ...p, loading: false, error: msg }));
      }
    } else {
      setTimezones((p) => ({ ...p, data: cache.timezones ?? [], loading: false }));
    }
  }, []);

  React.useEffect(() => {
    void loadOnce();
  }, [loadOnce]);

  const getCachedStates = React.useCallback((countryCode: string) => {
    const cc = (countryCode ?? "").trim().toUpperCase();
    if (!cc) return undefined;
    return cache.statesByCountry.get(cc);
  }, []);

  const statesLoading = React.useCallback(
    (countryCode: string) => {
      const cc = (countryCode ?? "").trim().toUpperCase();
      return Boolean(statesMeta[cc]?.loading);
    },
    [statesMeta]
  );

  const statesError = React.useCallback(
    (countryCode: string) => {
      const cc = (countryCode ?? "").trim().toUpperCase();
      return statesMeta[cc]?.error ?? null;
    },
    [statesMeta]
  );

  const getStates = React.useCallback(async (countryCode: string) => {
    const cc = (countryCode ?? "").trim().toUpperCase();
    if (!cc) return [];

    // cached
    const cached = cache.statesByCountry.get(cc);
    if (cached) return cached;

    // in-flight dedupe
    const inFlight = cache.statesInFlight.get(cc);
    if (inFlight) return inFlight;

    setStatesMeta((prev) => ({ ...prev, [cc]: { loading: true, error: null } }));

    const p = referenceService
      .listStates(cc)
      .then((rows) => {
        cache.statesByCountry.set(cc, rows);
        return rows;
      })
      .catch((e: unknown) => {
        const msg = extractErrorMessage(e, "Failed to load states");
        setStatesMeta((prev) => ({ ...prev, [cc]: { loading: false, error: msg } }));
        throw e;
      })
      .finally(() => {
        cache.statesInFlight.delete(cc);
        setStatesMeta((prev) => ({ ...prev, [cc]: { loading: false, error: prev[cc]?.error ?? null } }));
      });

    cache.statesInFlight.set(cc, p);
    return p;
  }, []);

  return {
    countries,
    currencies,
    timezones,
    getStates,
    getCachedStates,
    statesLoading,
    statesError,
  };
}