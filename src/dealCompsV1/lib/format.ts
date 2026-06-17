const DASH = '—';

export function formatMoney(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return DASH;
  if (Math.abs(v) >= 1000) {
    const b = v / 1000;
    return `$${(Number.isInteger(b) ? b : Number(b.toFixed(1))).toLocaleString('en-US')}B`;
  }
  return `$${v.toLocaleString('en-US')}M`;
}

export function formatMultiple(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return DASH;
  return `${v.toFixed(1)}x`;
}

export function formatNumber(v: number | null, digits = 0): string {
  if (v === null || !Number.isFinite(v)) return DASH;
  return v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatDate(iso: string | null): string {
  if (!iso) return DASH;
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
