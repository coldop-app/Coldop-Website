export function toStartOfDayIso(date: Date): string {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
}

export function toEndOfDayIso(date: Date): string {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next.toISOString();
}

export function buildDateRangeFilters(fromDate?: Date, toDate?: Date) {
  const filters: { from?: string; to?: string } = {};

  if (fromDate) {
    filters.from = toStartOfDayIso(fromDate);
  }

  if (toDate) {
    filters.to = toEndOfDayIso(toDate);
  }

  return filters;
}
