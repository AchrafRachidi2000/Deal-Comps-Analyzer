import { describe, it, expect } from 'vitest';
import { toExportObjects, buildCsv } from './export';
import { COLUMN_DEFS } from './columns';
import type { CompTransaction } from '@/dealCompsV1/data/types';

function tx(p: Partial<CompTransaction>): CompTransaction {
  return {
    id: 'x', targetCompany: 'X', targetDescription: '', sector: 'Medical Devices',
    region: 'North America', location: 'US', countryCode: 'US', announcementDate: '2025-11-15',
    buyer: 'B', buyerType: 'Strategic', employees: 100, dealSize: 450, currency: 'USD',
    revenue: 85, ebitda: 32, ebit: 26, enterpriseValue: 450,
    evRevenueMultiple: 5.3, evEbitdaMultiple: 14.1, evEbitMultiple: 17.3, similarityScore: 80, status: 'Included', ...p,
  };
}

const cols = (keys: string[]) => COLUMN_DEFS.filter((c) => keys.includes(c.key));

describe('toExportObjects', () => {
  it('keys by label and uses raw values for visible columns only', () => {
    const out = toExportObjects([tx({})], cols(['target', 'enterpriseValue', 'evEbitdaMultiple']));
    expect(out).toEqual([{ Target: 'X', EV: 450, 'EV/EBITDA': 14.1 }]);
  });
});

describe('buildCsv', () => {
  it('renders header + rows, empty for null', () => {
    const csv = buildCsv([tx({ enterpriseValue: null })], cols(['target', 'enterpriseValue']));
    expect(csv).toBe('Target,EV\nX,');
  });
  it('escapes commas, quotes, and newlines', () => {
    const csv = buildCsv([tx({ targetCompany: 'A, "B"\nC' })], cols(['target']));
    expect(csv).toBe('Target\n"A, ""B""\nC"');
  });
});
