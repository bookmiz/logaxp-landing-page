/** Clock summary items use workedMinutes, unlike the aggregate totalMinutes. */
export function clockSummaryMinutes(response: unknown): number {
  if (!response || typeof response !== "object") return 0;
  const raw = "data" in response ? response.data : response;
  if (!raw || typeof raw !== "object") return 0;
  const items = Array.isArray(raw) ? raw : "items" in raw && Array.isArray(raw.items) ? raw.items : [];
  return items.reduce((total: number, row: { workedMinutes?: number }) => total + Number(row.workedMinutes ?? 0), 0);
}
