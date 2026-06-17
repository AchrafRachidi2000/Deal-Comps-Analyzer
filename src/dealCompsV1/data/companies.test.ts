import { describe, it, expect } from 'vitest';
import { PRESET_COMPANIES, SECTORS, REGIONS, BUYER_TYPES, FALLBACK_TRANSACTIONS, makeCustomCompany } from './companies';
import { EMPTY_FILTERS } from './types';
import { REGION_COUNTRIES } from './geography';

describe('PRESET_COMPANIES', () => {
  it('has 6 companies', () => {
    expect(PRESET_COMPANIES).toHaveLength(6);
  });

  it('each company has 14-20 transactions with unique ids', () => {
    for (const c of PRESET_COMPANIES) {
      expect(c.transactions.length).toBeGreaterThanOrEqual(14);
      expect(c.transactions.length).toBeLessThanOrEqual(20);
      const ids = c.transactions.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('uses only known sectors, regions, and buyer types', () => {
    for (const c of PRESET_COMPANIES) {
      for (const t of c.transactions) {
        expect(SECTORS).toContain(t.sector);
        expect(REGIONS).toContain(t.region);
        expect(BUYER_TYPES).toContain(t.buyerType);
      }
    }
  });

  it('every transaction has at least one financial and at least one multiple', () => {
    for (const c of PRESET_COMPANIES) {
      for (const t of c.transactions) {
        expect(t.revenue !== null || t.ebitda !== null).toBe(true);
        expect(t.evRevenueMultiple !== null || t.evEbitdaMultiple !== null).toBe(true);
      }
    }
  });

  it('preset filters reference valid sectors and countries', () => {
    const validCountries = new Set(REGION_COUNTRIES.flatMap((g) => g.countries.map((c) => c.name)));
    for (const c of PRESET_COMPANIES) {
      for (const s of c.presetFilters.sector) expect(SECTORS).toContain(s);
      for (const country of c.presetFilters.geography) expect(validCountries.has(country)).toBe(true);
    }
  });

  it('fallback comp set is valid and every row has a financial + a multiple', () => {
    expect(FALLBACK_TRANSACTIONS.length).toBeGreaterThanOrEqual(12);
    const validCountries = new Set(REGION_COUNTRIES.flatMap((g) => g.countries.map((c) => c.name)));
    for (const t of FALLBACK_TRANSACTIONS) {
      expect(SECTORS).toContain(t.sector);
      expect(validCountries.has(t.location)).toBe(true);
      expect(t.revenue !== null || t.ebitda !== null).toBe(true);
      expect(t.evRevenueMultiple !== null || t.evEbitdaMultiple !== null).toBe(true);
    }
  });

  it('makeCustomCompany returns empty filters and the fallback comp set', () => {
    const c = makeCustomCompany('Acme Robotics');
    expect(c.id).toBe('custom');
    expect(c.name).toBe('Acme Robotics');
    expect(c.presetFilters).toEqual(EMPTY_FILTERS);
    expect(c.transactions).toBe(FALLBACK_TRANSACTIONS);
    expect(makeCustomCompany('   ').name).toBe('Custom target');
  });

  it('non-null EV/EBITDA multiples are roughly EV/EBITDA', () => {
    for (const c of PRESET_COMPANIES) {
      for (const t of c.transactions) {
        if (t.evEbitdaMultiple !== null && t.enterpriseValue !== null && t.ebitda && t.ebitda > 0) {
          const expected = t.enterpriseValue / t.ebitda;
          expect(Math.abs(t.evEbitdaMultiple - expected)).toBeLessThan(1.0);
        }
      }
    }
  });
});
