import type { CompTransaction } from '@/dealCompsV1/data/types';

export type MultipleKey = 'evEbitdaMultiple' | 'evRevenueMultiple';

export interface MultipleStat {
  key: MultipleKey;
  label: string;
  min: number | null;
  median: number | null;
  max: number | null;
  n: number;
}

export const MULTIPLE_DEFS: { key: MultipleKey; label: string }[] = [
  { key: 'evEbitdaMultiple', label: 'EV / EBITDA' },
  { key: 'evRevenueMultiple', label: 'EV / Revenue' },
];

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeStat(rows: CompTransaction[], key: MultipleKey, label: string): MultipleStat {
  const values = rows
    .map((r) => r[key])
    .filter((v): v is number => v !== null && Number.isFinite(v) && v > 0);

  if (values.length === 0) {
    return { key, label, min: null, median: null, max: null, n: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  return {
    key,
    label,
    min: sorted[0],
    median: median(sorted),
    max: sorted[sorted.length - 1],
    n: values.length,
  };
}

export function computeAllStats(rows: CompTransaction[]): MultipleStat[] {
  return MULTIPLE_DEFS.map((d) => computeStat(rows, d.key, d.label));
}
