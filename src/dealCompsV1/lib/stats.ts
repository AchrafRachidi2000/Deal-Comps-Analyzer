import type { CompTransaction } from '@/dealCompsV1/data/types';

export type MultipleKey = 'evEbitdaMultiple' | 'evRevenueMultiple';

export interface MultipleStat {
  key: MultipleKey;
  label: string;
  min: number | null;
  p25: number | null;
  median: number | null;
  mean: number | null;
  p75: number | null;
  max: number | null;
  n: number; // comps with a valid value for this multiple
  total: number; // comps in scope
}

export const MULTIPLE_DEFS: { key: MultipleKey; label: string }[] = [
  { key: 'evEbitdaMultiple', label: 'EV / EBITDA' },
  { key: 'evRevenueMultiple', label: 'EV / Revenue' },
];

export function median(values: number[]): number {
  return percentile([...values].sort((a, b) => a - b), 50);
}

// Linear-interpolation percentile over a pre-sorted ascending array.
function percentile(sorted: number[], pct: number): number {
  const n = sorted.length;
  if (n === 1) return sorted[0];
  const idx = (pct / 100) * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function computeStat(rows: CompTransaction[], key: MultipleKey, label: string): MultipleStat {
  const total = rows.length;
  const values = rows
    .map((r) => r[key])
    .filter((v): v is number => v !== null && Number.isFinite(v) && v > 0);

  if (values.length === 0) {
    return { key, label, min: null, p25: null, median: null, mean: null, p75: null, max: null, n: 0, total };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    key,
    label,
    min: sorted[0],
    p25: percentile(sorted, 25),
    median: percentile(sorted, 50),
    mean,
    p75: percentile(sorted, 75),
    max: sorted[sorted.length - 1],
    n: values.length,
    total,
  };
}

export function computeAllStats(rows: CompTransaction[]): MultipleStat[] {
  return MULTIPLE_DEFS.map((d) => computeStat(rows, d.key, d.label));
}
