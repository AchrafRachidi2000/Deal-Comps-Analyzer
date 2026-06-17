import { describe, it, expect } from 'vitest';
import { formatMoney, formatMultiple, formatNumber, formatDate } from './format';

describe('format', () => {
  it('formatMoney', () => {
    expect(formatMoney(450)).toBe('$450M');
    expect(formatMoney(1500)).toBe('$1.5B');
    expect(formatMoney(8000)).toBe('$8B');
    expect(formatMoney(null)).toBe('—');
  });
  it('formatMultiple', () => {
    expect(formatMultiple(14.1)).toBe('14.1x');
    expect(formatMultiple(8)).toBe('8.0x');
    expect(formatMultiple(null)).toBe('—');
  });
  it('formatNumber', () => {
    expect(formatNumber(320)).toBe('320');
    expect(formatNumber(12.34, 1)).toBe('12.3');
    expect(formatNumber(null)).toBe('—');
  });
  it('formatDate', () => {
    expect(formatDate('2025-11-15')).toBe('Nov 15, 2025');
    expect(formatDate(null)).toBe('—');
  });
});
