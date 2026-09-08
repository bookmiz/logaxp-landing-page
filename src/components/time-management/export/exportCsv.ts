"use client";

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => unknown;
};

function escapeCsvCell(v: unknown): string {
  if (v === null || typeof v === "undefined") return "";
  const raw = String(v);
  const s = /^[\s]*[=+@-]/.test(raw) ? "'" + raw : raw;
  // quote if contains comma, quote, newline
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const lines = rows.map((r) =>
    columns.map((c) => escapeCsvCell(c.value(r))).join(","),
  );
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
