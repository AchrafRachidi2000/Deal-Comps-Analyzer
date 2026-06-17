import type { CompTransaction, DealCompFilters, RangeFilter, DateRange } from '@/dealCompsV1/data/types';

function hasBound(r: RangeFilter): boolean {
  if (r.min === null && r.max === null) return false;
  if (r.min !== null && r.max !== null && r.min > r.max) return false; // invalid → no constraint
  return true;
}

export function inRange(value: number | null, r: RangeFilter): boolean {
  if (!hasBound(r)) return true;
  if (value === null || !Number.isFinite(value)) return false;
  if (r.min !== null && value < r.min) return false;
  if (r.max !== null && value > r.max) return false;
  return true;
}

export function matchesMulti(value: string, selected: string[]): boolean {
  return selected.length === 0 || selected.includes(value);
}

export function inDateRange(date: string, r: DateRange): boolean {
  if (r.from && date < r.from) return false;
  if (r.to && date > r.to) return false;
  return true;
}

export function filterTransactions(rows: CompTransaction[], f: DealCompFilters): CompTransaction[] {
  return rows.filter(
    (t) =>
      matchesMulti(t.sector, f.sector) &&
      matchesMulti(t.buyerType, f.buyerType) &&
      matchesMulti(t.location, f.geography) &&
      inRange(t.employees, f.employees) &&
      inRange(t.revenue, f.revenue) &&
      inRange(t.ebitda, f.ebitda) &&
      inRange(t.evEbitdaMultiple, f.evEbitda) &&
      inRange(t.evRevenueMultiple, f.evRevenue) &&
      inDateRange(t.announcementDate, f.announcementDate)
  );
}

export function extentOf(rows: CompTransaction[], key: keyof CompTransaction): { min: number; max: number } {
  const values = rows
    .map((r) => r[key])
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}
