import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import type { PresetCompany } from '@/dealCompsV1/data/types';
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className={cn(value ? 'text-gray-900 font-medium' : 'text-gray-400')}>
          {value ? value.name : 'Select a target company…'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          <div className="px-2 pb-1.5 pt-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search companies…"
                className="w-full pl-8 pr-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No matches</div>}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                  setQuery('');
                }}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors flex items-start gap-2"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {c.name}
                    {value?.id === c.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
