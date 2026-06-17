import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, X, Plus } from 'lucide-react';
import type { PresetCompany } from '@/dealCompsV1/data/types';
import { makeCustomCompany } from '@/dealCompsV1/data/companies';
import { cn } from '@/lib/utils';

export function CompanySelect({
  companies,
  value,
  onSelect,
}: {
  companies: PresetCompany[];
  value: PresetCompany | null;
  onSelect: (c: PresetCompany) => void;
}) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const q = query.trim().toLowerCase();
  // Prefix match on the company name (typing "S" surfaces Stripe and SpaceX).
  const matches = q === '' ? companies : companies.filter((c) => c.name.toLowerCase().startsWith(q));
  // Offer a custom target only when nothing in the list matches what was typed.
  const showCustom = q !== '' && matches.length === 0;

  const pick = (c: PresetCompany) => {
    onSelect(c);
    setQuery(c.name);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Type a company name…"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white rounded-lg border border-gray-200 shadow-lg py-1 max-h-72 overflow-y-auto">
          {matches.map((c) => (
            <button
              key={c.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(c)}
              className={cn('w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-indigo-50', value?.id === c.id && 'bg-indigo-50/60')}
            >
              <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  {c.name}
                  {value?.id === c.id && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.description}</div>
              </div>
            </button>
          ))}

          {showCustom && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(makeCustomCompany(query.trim()))}
              className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-indigo-50"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">Use “{query.trim()}”</div>
                <div className="text-xs text-gray-500">Custom target · default market comp set</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
