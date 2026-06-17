import { describe, it, expect } from 'vitest';
import { PRESET_COMPANIES, SECTORS, REGIONS, BUYER_TYPES } from './companies';

describe('PRESET_COMPANIES', () => {
  it('has exactly 3 companies', () => {
    expect(PRESET_COMPANIES).toHaveLength(3);
  });

  it('each company has 10-12 transactions with unique ids', () => {
    for (const c of PRESET_COMPANIES) {
      expect(c.transactions.length).toBeGreaterThanOrEqual(10);
      expect(c.transactions.length).toBeLessThanOrEqual(12);
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

  it('each company has at least one row with a null multiple', () => {
    for (const c of PRESET_COMPANIES) {
      const hasNull = c.transactions.some((t) => t.evEbitdaMultiple === null);
      expect(hasNull).toBe(true);
    }
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
