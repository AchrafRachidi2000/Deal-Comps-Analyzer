import { describe, it, expect } from 'vitest';
import { median, computeStat, computeAllStats, MULTIPLE_DEFS } from './stats';
import type { CompTransaction } from '@/dealCompsV1/data/types';

function tx(partial: Partial<CompTransaction>): CompTransaction {
  return {
    id: 'x', targetCompany: 'X', targetDescription: '', sector: 'Medical Devices',
    region: 'North America', location: 'US', countryCode: 'US', announcementDate: '2025-01-01',
    buyer: 'B', buyerType: 'Strategic', employees: null, dealSize: null, currency: 'USD',
    revenue: null, ebitda: null, ebit: null, enterpriseValue: null,
    evRevenueMultiple: null, evEbitdaMultiple: null, evEbitMultiple: null, similarityScore: 80, status: 'Included',
    ...partial,
  };
}

describe('median', () => {
  it('odd count', () => { expect(median([3, 1, 2])).toBe(2); });
  it('even count averages the middle two', () => { expect(median([1, 2, 3, 4])).toBe(2.5); });
  it('single', () => { expect(median([7])).toBe(7); });
});

describe('computeStat', () => {
  it('computes min/quartiles/median/mean/max/n over valid values', () => {
    const rows = [
      tx({ evEbitdaMultiple: 10 }),
      tx({ evEbitdaMultiple: 14 }),
      tx({ evEbitdaMultiple: 12 }),
    ];
    const s = computeStat(rows, 'evEbitdaMultiple', 'EV / EBITDA');
    expect(s).toEqual({
      key: 'evEbitdaMultiple', label: 'EV / EBITDA',
      min: 10, p25: 11, median: 12, mean: 12, p75: 13, max: 14, n: 3, total: 3,
    });
  });

  it('excludes null, zero, negative, and non-finite values', () => {
    const rows = [
      tx({ evEbitdaMultiple: 10 }),
      tx({ evEbitdaMultiple: null }),
      tx({ evEbitdaMultiple: 0 }),
      tx({ evEbitdaMultiple: -5 }),
    ];
    const s = computeStat(rows, 'evEbitdaMultiple', 'EV / EBITDA');
    expect(s.n).toBe(1);
    expect(s.min).toBe(10);
    expect(s.max).toBe(10);
  });

  it('returns nulls and n=0 for empty', () => {
    const s = computeStat([], 'evEbitdaMultiple', 'EV / EBITDA');
    expect(s).toEqual({
      key: 'evEbitdaMultiple', label: 'EV / EBITDA',
      min: null, p25: null, median: null, mean: null, p75: null, max: null, n: 0, total: 0,
    });
  });
});

describe('computeAllStats', () => {
  it('returns one stat per multiple definition', () => {
    const stats = computeAllStats([tx({ evEbitdaMultiple: 10, evRevenueMultiple: 5, evEbitMultiple: 12 })]);
    expect(stats.map((s) => s.key)).toEqual(MULTIPLE_DEFS.map((d) => d.key));
  });
});
