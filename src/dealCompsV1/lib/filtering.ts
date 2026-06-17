import type { CompTransaction, DealCompFilters, RangeFilter } from '@/dealCompsV1/data/types';

export function transactionAgeYears(announcementDate: string, now: Date): number {
  const d = new Date(announcementDate + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return 0;
  let age = now.getFullYear() - d.getFullYear();
  const beforeAnniversary =
    now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeAnniversary) age -= 1;
  return age < 0 ? 0 : age;
}

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

export function filterTransactions(
  rows: CompTransaction[],
  f: DealCompFilters,
  now: Date = new Date()
): CompTransaction[] {
  return rows.filter(
    (t) =>
      inRange(transactionAgeYears(t.announcementDate, now), f.transactionAge) &&
      matchesMulti(t.sector, f.sector) &&
      matchesMulti(t.buyerType, f.buyerType) &&
      matchesMulti(t.location, f.geography) &&
      inRange(t.employees, f.employees) &&
      inRange(t.revenue, f.revenue) &&
      inRange(t.ebitda, f.ebitda) &&
      inRange(t.evEbitdaMultiple, f.evEbitda) &&
      inRange(t.evRevenueMultiple, f.evRevenue)
  );
}

export function extentOf(rows: CompTransaction[], key: keyof CompTransaction): { min: number; max: number } {
  const values = rows
    .map((r) => r[key])
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}
