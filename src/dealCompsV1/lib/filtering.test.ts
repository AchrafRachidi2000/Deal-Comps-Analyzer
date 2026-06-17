import { describe, it, expect } from 'vitest';
import { inRange, transactionAgeYears, matchesMulti, filterTransactions, extentOf } from './filtering';
import type { CompTransaction, DealCompFilters } from '@/dealCompsV1/data/types';
import { EMPTY_FILTERS } from '@/dealCompsV1/data/types';

function tx(p: Partial<CompTransaction>): CompTransaction {
  return {
    id: 'x', targetCompany: 'X', targetDescription: '', sector: 'Medical Devices',
    region: 'North America', location: 'US', countryCode: 'US', announcementDate: '2025-01-01',
    buyer: 'B', buyerType: 'Strategic', employees: 100, dealSize: 100, currency: 'USD',
    revenue: 50, ebitda: 10, ebit: 8, enterpriseValue: 120,
    evRevenueMultiple: 2.4, evEbitdaMultiple: 12, evEbitMultiple: 15, similarityScore: 80, status: 'Included', ...p,
  };
}

describe('inRange', () => {
  it('no bounds → always true (incl null)', () => {
    expect(inRange(5, { min: null, max: null })).toBe(true);
    expect(inRange(null, { min: null, max: null })).toBe(true);
  });
  it('min>max treated as no constraint', () => {
    expect(inRange(5, { min: 100, max: 1 })).toBe(true);
  });
  it('null value fails when a bound exists', () => {
    expect(inRange(null, { min: 1, max: null })).toBe(false);
  });
  it('inclusive comparison', () => {
    expect(inRange(5, { min: 5, max: 10 })).toBe(true);
    expect(inRange(10, { min: 5, max: 10 })).toBe(true);
    expect(inRange(4, { min: 5, max: 10 })).toBe(false);
    expect(inRange(11, { min: 5, max: 10 })).toBe(false);
    expect(inRange(20, { min: 5, max: null })).toBe(true);
    expect(inRange(2, { min: null, max: 5 })).toBe(true);
  });
});

describe('matchesMulti', () => {
  it('empty selection matches anything', () => { expect(matchesMulti('A', [])).toBe(true); });
  it('membership', () => {
    expect(matchesMulti('A', ['A', 'B'])).toBe(true);
    expect(matchesMulti('C', ['A', 'B'])).toBe(false);
  });
});

describe('transactionAgeYears', () => {
  const now = new Date('2026-06-17T00:00:00');
  it('floors to whole years', () => {
    expect(transactionAgeYears('2026-01-01', now)).toBe(0);
    expect(transactionAgeYears('2025-06-17', now)).toBe(1);
    expect(transactionAgeYears('2021-01-01', now)).toBe(5);
  });
  it('future dates clamp to 0', () => {
    expect(transactionAgeYears('2027-01-01', now)).toBe(0);
  });
});

describe('filterTransactions', () => {
  const rows = [
    tx({ id: '1', sector: 'Medical Devices', buyerType: 'Strategic', region: 'North America', location: 'United States', evEbitdaMultiple: 10 }),
    tx({ id: '2', sector: 'Diagnostics', buyerType: 'Financial', region: 'Europe', location: 'Germany', evEbitdaMultiple: 18 }),
    tx({ id: '3', sector: 'Wearables', buyerType: 'Financial', region: 'Asia Pacific', location: 'Japan', evEbitdaMultiple: null }),
  ];
  it('empty filters returns all', () => {
    expect(filterTransactions(rows, EMPTY_FILTERS).map((r) => r.id)).toEqual(['1', '2', '3']);
  });
  it('multi filter on sector', () => {
    const f: DealCompFilters = { ...EMPTY_FILTERS, sector: ['Diagnostics'] };
    expect(filterTransactions(rows, f).map((r) => r.id)).toEqual(['2']);
  });
  it('range filter excludes null-valued rows', () => {
    const f: DealCompFilters = { ...EMPTY_FILTERS, evEbitda: { min: 5, max: 15 } };
    expect(filterTransactions(rows, f).map((r) => r.id)).toEqual(['1']);
  });
  it('geography filters by country', () => {
    const f: DealCompFilters = { ...EMPTY_FILTERS, geography: ['Germany', 'Japan'] };
    expect(filterTransactions(rows, f).map((r) => r.id)).toEqual(['2', '3']);
  });
  it('combined filters AND together', () => {
    const f: DealCompFilters = { ...EMPTY_FILTERS, buyerType: ['Financial'], geography: ['Germany'] };
    expect(filterTransactions(rows, f).map((r) => r.id)).toEqual(['2']);
  });
  it('filters by transaction age', () => {
    const now = new Date('2026-06-17T00:00:00');
    const aged = [
      tx({ id: 'a', announcementDate: '2026-01-01' }), // age 0
      tx({ id: 'b', announcementDate: '2023-01-01' }), // age 3
    ];
    const f: DealCompFilters = { ...EMPTY_FILTERS, transactionAge: { min: null, max: 1 } };
    expect(filterTransactions(aged, f, now).map((r) => r.id)).toEqual(['a']);
  });
});

describe('extentOf', () => {
  it('min/max ignoring nulls', () => {
    const rows = [tx({ employees: 50 }), tx({ employees: 300 }), tx({ employees: null })];
    expect(extentOf(rows, 'employees')).toEqual({ min: 50, max: 300 });
  });
  it('no numeric values → {0,0}', () => {
    expect(extentOf([tx({ employees: null })], 'employees')).toEqual({ min: 0, max: 0 });
  });
});
