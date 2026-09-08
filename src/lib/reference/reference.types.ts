// src/logaxp/lib/reference/reference.types.ts

export type RefListResult<T> = {
  items: T[];
};

export type RefCountry = {
  code: string;
  name: string;
};

export type RefState = {
  countryCode: string;
  code: string;
  name: string;
};

export type RefCurrency = {
  code: string;
  name: string;
  symbol?: string | null;
};

export type RefTimezone = {
  name?: string;
  value?: string;
  code?: string;
  label?: string;
  timezone?: string;
};