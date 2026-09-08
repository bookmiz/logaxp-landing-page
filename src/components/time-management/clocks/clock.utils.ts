"use client";

export function toIsoFromDateTimeLocal(v?: string | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function toDateTimeLocalFromIso(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

export function computeClockDurationMinutes(clockInAt?: string | null, clockOutAt?: string | null, breakMinutes?: number | null): number | null {
  if (!clockInAt) return null;
  const a = new Date(clockInAt).getTime();
  const b = clockOutAt ? new Date(clockOutAt).getTime() : Date.now();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const raw = Math.max(0, Math.round((b - a) / 60000));
  const br = Math.max(0, Number(breakMinutes ?? 0));
  return Math.max(0, raw - br);
}