import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import type { DealCompFilters } from '@/dealCompsV1/data/types';
import { EMPTY_FILTERS } from '@/dealCompsV1/data/types';
import { FILTER_DEFS, FilterDef } from '@/dealCompsV1/data/filterDefs';
import { cn } from '@/lib/utils';
import { FilterControl, Popover, filterValueLabel, hasFilterValue } from './filterShared';

export function FilterBar({
  filters,
  onChange,
}: {
  filters: DealCompFilters;
  onChange: (next: DealCompFilters) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  const reset = (key: keyof DealCompFilters) => {
    onChange({ ...filters, [key]: EMPTY_FILTERS[key] });
    if (active === key) setActive(null);
  };

  const activeCount = FILTER_DEFS.filter((d) => hasFilterValue(d, filters)).length;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Filters</span>
        {activeCount > 0 && (
          <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
            {activeCount} active
          </span>
        )}
        {activeCount > 0 && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_DEFS.map((def) => (
          <Chip
            key={def.key}
            def={def}
            label={`${def.shortLabel}: ${filterValueLabel(def, filters)}`}
            active={active === def.key}
            hasValue={hasFilterValue(def, filters)}
            onClick={() => setActive((a) => (a === def.key ? null : def.key))}
            onRemove={hasFilterValue(def, filters) ? () => reset(def.key) : undefined}
          >
            {active === def.key && (
              <Popover onClose={() => setActive(null)}>
                <FilterControl def={def} filters={filters} onChange={onChange} />
              </Popover>
            )}
          </Chip>
        ))}
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
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap',
            onRemove ? 'rounded-l-md' : 'rounded-md',
            active
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200'
              : hv
                ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          )}
        >
          {def.icon}
          <span className="max-w-[220px] truncate">{label}</span>
        </button>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              'px-1 py-1.5 border border-l-0 rounded-r-md transition-colors',
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
