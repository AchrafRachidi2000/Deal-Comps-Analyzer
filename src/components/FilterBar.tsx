import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HardFilters {
  dealSize: string;
  geography: string[];
  dealType: string[];
  recency: string;
}

const GEO_OPTIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa',
];

const DEAL_TYPE_OPTIONS = [
  'M&A',
  'Buyout',
  'Minority Stake',
  'Growth Equity',
  'Carve-out',
  'PIPE',
];

const RECENCY_OPTIONS = [
  'Last 1 year',
  'Last 2 years',
  'Last 3 years',
  'Last 5 years',
  'Last 10 years',
];

const DEAL_SIZE_PRESETS = ['> $10M', '> $25M', '> $50M', '> $100M', '> $250M', '> $500M', '> $1B'];

export function FilterBar() {
  const [hardFilters, setHardFilters] = useState<HardFilters>({
    dealSize: '> $50M',
    geography: ['North America', 'Europe'],
    dealType: ['M&A', 'Buyout'],
    recency: 'Last 5 years',
  });

  const [softFilter, setSoftFilter] = useState(
    'Companies specializing in non-invasive respiratory monitoring hardware and software for ICU and home-care settings...'
  );

  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [editingSoft, setEditingSoft] = useState(false);
  const [softDraft, setSoftDraft] = useState(softFilter);

  const closePopover = () => setActivePopover(null);

  const togglePopover = (name: string) => {
    setActivePopover(prev => (prev === name ? null : name));
  };

  const handleSaveSoft = () => {
    setSoftFilter(softDraft);
    setEditingSoft(false);
  };

  const handleCancelSoft = () => {
    setSoftDraft(softFilter);
    setEditingSoft(false);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
      <div className="flex flex-wrap gap-4 items-start">
        {/* Hard Filters */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Hard Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Deal Size */}
            <FilterChip
              label={`Deal Size: ${hardFilters.dealSize}`}
              active={activePopover === 'dealSize'}
              onClick={() => togglePopover('dealSize')}
            >
              {activePopover === 'dealSize' && (
                <Popover onClose={closePopover}>
                  <div className="space-y-1 p-1">
                    {DEAL_SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setHardFilters(f => ({ ...f, dealSize: preset }));
                          closePopover();
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                          hardFilters.dealSize === preset
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {preset}
                        {hardFilters.dealSize === preset && (
                          <Check className="w-3.5 h-3.5 inline ml-2 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </Popover>
              )}
            </FilterChip>

            {/* Geography */}
            <FilterChip
              label={`Geo: ${hardFilters.geography.join(', ')}`}
              active={activePopover === 'geography'}
              onClick={() => togglePopover('geography')}
            >
              {activePopover === 'geography' && (
                <Popover onClose={closePopover}>
                  <div className="space-y-0.5 p-1">
                    {GEO_OPTIONS.map((geo) => {
                      const selected = hardFilters.geography.includes(geo);
                      return (
                        <label
                          key={geo}
                          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              setHardFilters(f => ({
                                ...f,
                                geography: selected
                                  ? f.geography.filter(g => g !== geo)
                                  : [...f.geography, geo],
                              }));
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          {geo}
                        </label>
                      );
                    })}
                  </div>
                </Popover>
              )}
            </FilterChip>

            {/* Deal Type */}
            <FilterChip
              label={`Type: ${hardFilters.dealType.join(', ')}`}
              active={activePopover === 'dealType'}
              onClick={() => togglePopover('dealType')}
            >
              {activePopover === 'dealType' && (
                <Popover onClose={closePopover}>
                  <div className="space-y-0.5 p-1">
                    {DEAL_TYPE_OPTIONS.map((type) => {
                      const selected = hardFilters.dealType.includes(type);
                      return (
                        <label
                          key={type}
                          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              setHardFilters(f => ({
                                ...f,
                                dealType: selected
                                  ? f.dealType.filter(t => t !== type)
                                  : [...f.dealType, type],
                              }));
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          {type}
                        </label>
                      );
                    })}
                  </div>
                </Popover>
              )}
            </FilterChip>

            {/* Recency */}
            <FilterChip
              label={`Recency: ${hardFilters.recency}`}
              active={activePopover === 'recency'}
              onClick={() => togglePopover('recency')}
            >
              {activePopover === 'recency' && (
                <Popover onClose={closePopover}>
                  <div className="space-y-1 p-1">
                    {RECENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setHardFilters(f => ({ ...f, recency: opt }));
                          closePopover();
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                          hardFilters.recency === opt
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {opt}
                        {hardFilters.recency === opt && (
                          <Check className="w-3.5 h-3.5 inline ml-2 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </Popover>
              )}
            </FilterChip>
          </div>
        </div>

        {/* Soft Filters */}
        <div className="flex-1 min-w-[300px] border-l border-gray-100 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Soft Filters (Context)</span>
          </div>
          {editingSoft ? (
            <div className="space-y-2">
              <textarea
                value={softDraft}
                onChange={(e) => setSoftDraft(e.target.value)}
                rows={3}
                autoFocus
                className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveSoft}
                  className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelSoft}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => { setSoftDraft(softFilter); setEditingSoft(true); }}
              className="text-sm text-gray-600 italic line-clamp-2 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1 -mx-2 -my-1 transition-colors"
              title="Click to edit"
            >
              "{softFilter}"
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
          Keywords <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
        <div className="h-6 w-px bg-gray-300 mx-1 flex-shrink-0" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-transparent rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-200 whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add filters
        </button>
      </div>
    </div>
  );
}

/* ── Filter chip (clickable pill) ── */

function FilterChip({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
          active
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200'
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
        )}
      >
        {label}
      </button>
      {children}
    </div>
  );
}

/* ── Popover wrapper ── */

function Popover({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Check if click is on a filter chip (parent) — let the chip toggle handle it
        const target = e.target as HTMLElement;
        if (target.closest('[data-filter-chip]')) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1.5 z-30 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] py-1"
    >
      {children}
    </div>
  );
}
