import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import type { DealCompFilters, RangeFilter } from '@/dealCompsV1/data/types';
import { FilterDef } from '@/dealCompsV1/data/filterDefs';
import { SingleSelect, MultiSelect, GeographyControl, RangeControl } from './FilterControls';

export function fmtRangeValue(def: FilterDef, n: number): string {
  if (def.unit === '$') {
    if (n >= 1000) {
      const b = n / 1000;
      return `$${Number.isInteger(b) ? b : b.toFixed(1)}B`;
    }
    return `$${n.toLocaleString('en-US')}M`;
  }
  const num = Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(1);
  return `${num}${def.suffix ?? ''}`;
}

export function filterValueLabel(def: FilterDef, filters: DealCompFilters): string {
  const val = filters[def.key];
  if (def.kind === 'multi' || def.kind === 'single' || def.kind === 'geo') {
    const arr = val as string[];
    if (arr.length === 0) return 'Any';
    if (arr.length <= 2) return arr.join(', ');
    return `${arr.slice(0, 2).join(', ')} +${arr.length - 2}`;
  }
  // range
  const r = val as RangeFilter;
  if (r.min !== null && r.max !== null && r.min > r.max) return 'Any';
  if (r.min !== null && r.max !== null) return `${fmtRangeValue(def, r.min)} – ${fmtRangeValue(def, r.max)}`;
  if (r.min !== null) return `≥ ${fmtRangeValue(def, r.min)}`;
  if (r.max !== null) return `≤ ${fmtRangeValue(def, r.max)}`;
  return 'Any';
}

export function hasFilterValue(def: FilterDef, filters: DealCompFilters): boolean {
  const val = filters[def.key];
  if (Array.isArray(val)) return val.length > 0;
  return Object.values(val as object).some((x) => x !== null && x !== '');
}

export function FilterControl({
  def,
  filters,
  onChange,
}: {
  def: FilterDef;
  filters: DealCompFilters;
  onChange: (next: DealCompFilters) => void;
}) {
  const set = <K extends keyof DealCompFilters>(key: K, val: DealCompFilters[K]) =>
    onChange({ ...filters, [key]: val });

  return (
    <>
      {def.kind === 'single' && (
        <SingleSelect
          options={def.options!}
          value={(filters[def.key] as string[])[0] ?? null}
          onChange={(v) => set(def.key, (v ? [v] : []) as DealCompFilters[typeof def.key])}
        />
      )}
      {def.kind === 'multi' && (
        <MultiSelect
          options={def.options!}
          selected={filters[def.key] as string[]}
          onChange={(next) => set(def.key, next as DealCompFilters[typeof def.key])}
        />
      )}
      {def.kind === 'geo' && <GeographyControl value={filters.geography} onChange={(next) => set('geography', next)} />}
      {def.kind === 'range' && (
        <RangeControl
          value={filters[def.key] as RangeFilter}
          onChange={(r) => set(def.key, r as DealCompFilters[typeof def.key])}
          min={def.min ?? 0}
          max={def.max ?? 100}
          step={def.step}
          unit={def.unit}
          suffix={def.suffix}
        />
      )}
    </>
  );
}

export function Popover({
  children,
  onClose,
  align = 'left',
}: {
  children: React.ReactNode;
  onClose: () => void;
  align?: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.13, ease: 'easeOut' }}
      style={{ transformOrigin: 'top' }}
      className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 z-30 bg-white rounded-lg shadow-xl border border-gray-200 py-1`}
    >
      {children}
    </motion.div>
  );
}
