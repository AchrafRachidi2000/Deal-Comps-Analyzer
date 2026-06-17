import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, Building2 } from 'lucide-react';
import type { PresetCompany } from '@/dealCompsV1/data/types';

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
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const matches = q === ''
    ? companies
    : companies.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Select by company name…"
          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-[280px] overflow-y-auto">
          {matches.length === 0 && <div className="px-3 py-2.5 text-sm text-gray-400">No matching companies</div>}
          {matches.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onSelect(c);
                setQuery(c.name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors flex items-start gap-2.5"
            >
              <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-indigo-600" />
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
        </div>
      )}
    </div>
  );
}
