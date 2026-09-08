// src/logaxp/components/site-admin/tenants/advanced/tenant-admin.helpers.ts

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatDateOnly(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(d);
}

export function safePrettyJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

export function parseJsonObject(input: string): {
  ok: true;
  value: Record<string, unknown>;
} | {
  ok: false;
  error: string;
} {
  try {
    const parsed = JSON.parse(input);

    if (parsed === null) {
      return { ok: true, value: {} };
    }

    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "JSON must be an object (not array/string/number)." };
    }

    return { ok: true, value: parsed as Record<string, unknown> };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON";
    return { ok: false, error: msg };
  }
}

export function truthyFromSelect(v: string) {
  return v === "true";
}