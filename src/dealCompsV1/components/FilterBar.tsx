import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CompTransaction, DealCompFilters, RangeFilter, DateRange } from '@/dealCompsV1/data/types';
import { EMPTY_FILTERS } from '@/dealCompsV1/data/types';
import { FILTER_DEFS, FilterDef } from '@/dealCompsV1/data/filterDefs';
import { extentOf } from '@/dealCompsV1/lib/filtering';
import { cn } from '@/lib/utils';
import { SingleSelect, MultiSelect, GeographyControl, RangeControl, DateRangeControl } from './FilterControls';

function chipValue(def: FilterDef, filters: DealCompFilters): string {
  const val = filters[def.key];
  if (def.kind === 'multi' || def.kind === 'single' || def.kind === 'geo') {
    const arr = val as string[];
    if (arr.length === 0) return 'Any';
    if (arr.length <= 2) return arr.join(', ');
    return `${arr.slice(0, 2).join(', ')} +${arr.length - 2}`;
  }
  if (def.kind === 'range') {
    const r = val as RangeFilter;
    const u = def.unit ?? '';
    const s = def.suffix ?? '';
    if (r.min !== null && r.max !== null && r.min > r.max) return 'Any';
    if (r.min !== null && r.max !== null) return `${u}${r.min}${s} – ${u}${r.max}${s}`;
    if (r.min !== null) return `≥ ${u}${r.min}${s}`;
    if (r.max !== null) return `≤ ${u}${r.max}${s}`;
    return 'Any';
  }
  const d = val as DateRange;
  if (d.from && d.to && d.from > d.to) return 'Any';
  if (d.from && d.to) return `${d.from} → ${d.to}`;
  if (d.from) return `From ${d.from}`;
  if (d.to) return `Until ${d.to}`;
  return 'Any';
}

function hasValue(def: FilterDef, filters: DealCompFilters): boolean {
  const val = filters[def.key];
  if (Array.isArray(val)) return val.length > 0;
  return Object.values(val as object).some((x) => x !== null && x !== '');
}

export function FilterBar({
  filters,
  onChange,
  transactions,
}: {
  filters: DealCompFilters;
  onChange: (next: DealCompFilters) => void;
  transactions: CompTransaction[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const set = <K extends keyof DealCompFilters>(key: K, val: DealCompFilters[K]) =>
    onChange({ ...filters, [key]: val });

  const reset = (key: keyof DealCompFilters) => {
    onChange({ ...filters, [key]: EMPTY_FILTERS[key] });
    if (active === key) setActive(null);
  };

  const activeCount = FILTER_DEFS.filter((d) => hasValue(d, filters)).length;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Filters</span>
        {activeCount > 0 && (
          <span className="text-[10px] font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
            {activeCount} active
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_DEFS.map((def) => (
          <Chip
            key={def.key}
            def={def}
            label={`${def.shortLabel}: ${chipValue(def, filters)}`}
            active={active === def.key}
            hasValue={hasValue(def, filters)}
            onClick={() => setActive((a) => (a === def.key ? null : def.key))}
            onRemove={hasValue(def, filters) ? () => reset(def.key) : undefined}
          >
            {active === def.key && (
              <Popover onClose={() => setActive(null)}>
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
                {def.kind === 'geo' && (
                  <GeographyControl
                    value={filters.geography}
                    onChange={(next) => set('geography', next)}
                    transactions={transactions}
                  />
                )}
                {def.kind === 'range' && (
                  <RangeControl
                    value={filters[def.key] as RangeFilter}
                    onChange={(r) => set(def.key, r as DealCompFilters[typeof def.key])}
                    {...extentOf(transactions, def.field!)}
                    step={def.step}
                    unit={def.unit}
                    suffix={def.suffix}
                  />
                )}
                {def.kind === 'date' && (
                  <DateRangeControl value={filters.announcementDate} onChange={(d) => set('announcementDate', d)} />
                )}
              </Popover>
            )}
          </Chip>
        ))}

        {activeCount > 0 && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-md text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({
  def,
  label,
  active,
  hasValue: hv,
  onClick,
  onRemove,
  children,
}: {
  key?: React.Key;
  def: FilterDef;
  label: string;
  active: boolean;
  hasValue: boolean;
  onClick: () => void;
  onRemove?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative flex-shrink-0">
      <div className="flex items-center">
        <button
          onClick={onClick}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border transition-colors whitespace-nowrap',
            onRemove ? 'rounded-l-md' : 'rounded-md',
            active
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200'
              : hv
                ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
          )}
        >
          {def.icon}
          <span className="max-w-[200px] truncate">{label}</span>
        </button>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              'px-1 py-1 border border-l-0 rounded-r-md transition-colors',
              active
                ? 'bg-indigo-50 text-indigo-400 border-indigo-200 hover:text-indigo-700'
                : 'bg-indigo-50/50 text-indigo-300 border-indigo-100 hover:text-indigo-600'
            )}
            title="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Popover({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1.5 z-30 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
    >
      {children}
    </div>
  );
}
