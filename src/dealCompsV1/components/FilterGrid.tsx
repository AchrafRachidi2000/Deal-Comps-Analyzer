import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { DealCompFilters } from '@/dealCompsV1/data/types';
import { FILTER_DEFS } from '@/dealCompsV1/data/filterDefs';
import { cn } from '@/lib/utils';
import { FilterControl, Popover, filterValueLabel, hasFilterValue } from './filterShared';

export function FilterGrid({
  filters,
  onChange,
}: {
  filters: DealCompFilters;
  onChange: (next: DealCompFilters) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
        <span className="text-sm font-semibold text-gray-900">Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
        {FILTER_DEFS.map((def, i) => {
          const hv = hasFilterValue(def, filters);
          const open = active === def.key;
          const align = i % 2 === 1 ? 'right' : 'left';
          return (
            <div key={def.key} className="relative space-y-1">
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">{def.label}</label>
              <button
                onClick={() => setActive((a) => (a === def.key ? null : def.key))}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-md text-sm text-left transition-colors',
                  open ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-gray-300 hover:border-indigo-300'
                )}
              >
                <span className={cn('truncate', hv ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                  {filterValueLabel(def, filters)}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-gray-400 flex-shrink-0 transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <Popover onClose={() => setActive(null)} align={align}>
                  <FilterControl def={def} filters={filters} onChange={onChange} />
                </Popover>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
