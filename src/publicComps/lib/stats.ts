import { Peer, MultipleKey, MultipleStats, MULTIPLE_DEFINITIONS } from '@/publicComps/data/mockData';

function percentile(sorted: number[], pct: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0];
  const idx = (pct / 100) * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function computeMultipleStats(peers: Peer[], multiple: MultipleKey, label: string): MultipleStats | null {
  const included = peers.filter((p) => p.status === 'Included');
  const values = included
    .map((p) => p[multiple])
    .filter((v): v is number => v !== null && Number.isFinite(v) && v > 0);

  if (values.length === 0) {
    return {
      multiple,
      label,
      min: 0,
      p25: 0,
      median: 0,
      mean: 0,
      p75: 0,
      max: 0,
      sampleSize: 0,
      totalPeers: included.length,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    multiple,
    label,
    min: sorted[0],
    p25: percentile(sorted, 25),
    median: percentile(sorted, 50),
    mean,
    p75: percentile(sorted, 75),
    max: sorted[sorted.length - 1],
    sampleSize: values.length,
    totalPeers: included.length,
  };
}

export function computeAllStats(peers: Peer[]): MultipleStats[] {
  return MULTIPLE_DEFINITIONS.map((d) => computeMultipleStats(peers, d.key, d.label)).filter(
    (s): s is MultipleStats => s !== null
  );
}

export function formatMultiple(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(1)}x`;
}

export function formatMoney(value: number | null, unit: '$M' = '$M'): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return `$${value.toLocaleString()}${unit === '$M' ? 'M' : ''}`;
}

export function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNumber(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return value.toFixed(digits);
}

export function getLatestReferenceDate(peers: Peer[]): string {
  const parsed = peers
    .map((p) => {
      const match = p.referenceDate.match(/Q(\d)\s+(\d{4})/);
      if (!match) return null;
      return { quarter: parseInt(match[1], 10), year: parseInt(match[2], 10) };
    })
    .filter((p): p is { quarter: number; year: number } => p !== null);
  if (parsed.length === 0) return '—';
  parsed.sort((a, b) => b.year - a.year || b.quarter - a.quarter);
  return `Q${parsed[0].quarter} ${parsed[0].year}`;
}
