import { describe, it, expect } from 'vitest';
import { COLUMN_DEFS, defaultVisibleColumns, toggleColumn } from './columns';

describe('columns', () => {
  it('target column is alwaysOn', () => {
    const target = COLUMN_DEFS.find((c) => c.key === 'target')!;
    expect(target.alwaysOn).toBe(true);
  });
  it('defaultVisibleColumns includes default-on keys and excludes default-off', () => {
    const v = defaultVisibleColumns();
    expect(v.has('target')).toBe(true);
    expect(v.has('evEbitMultiple')).toBe(true);
    expect(v.has('employees')).toBe(false);
    expect(v.has('ebit')).toBe(false);
  });
  it('toggleColumn adds and removes a normal column', () => {
    const base = defaultVisibleColumns();
    const added = toggleColumn(base, 'employees');
    expect(added.has('employees')).toBe(true);
    const removed = toggleColumn(added, 'employees');
    expect(removed.has('employees')).toBe(false);
  });
  it('toggleColumn refuses to remove an alwaysOn column', () => {
    const v = toggleColumn(defaultVisibleColumns(), 'target');
    expect(v.has('target')).toBe(true);
  });
});
