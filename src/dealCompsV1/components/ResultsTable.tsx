import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, MinusCircle, Linkedin, Globe, ListPlus, SearchX } from 'lucide-react';
import type { CompTransaction } from '@/dealCompsV1/data/types';
import { COLUMN_DEFS } from '@/dealCompsV1/lib/columns';
import { cn } from '@/lib/utils';

export type StatusTab = 'all' | 'included' | 'excluded';

const MULTIPLE_KEYS = new Set(['evEbitdaMultiple', 'evRevenueMultiple', 'evEbitMultiple']);

const SECTOR_COLORS: Record<string, string> = {
  'Medical Devices': 'bg-blue-50 text-blue-700 border-blue-100',
  Diagnostics: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Health IT / SaaS': 'bg-violet-50 text-violet-700 border-violet-100',
  'Medical Supplies': 'bg-amber-50 text-amber-700 border-amber-100',
  Pharmaceuticals: 'bg-rose-50 text-rose-700 border-rose-100',
  Wearables: 'bg-cyan-50 text-cyan-700 border-cyan-100',
};

export function ResultsTable({
  transactions,
  visibleColumns,
  statusTab,
  onStatusTabChange,
  onToggleStatus,
}: {
  transactions: CompTransaction[];
  visibleColumns: Set<string>;
  statusTab: StatusTab;
  onStatusTabChange: (t: StatusTab) => void;
  onToggleStatus: (id: string) => void;
}) {
  const cols = COLUMN_DEFS.filter((c) => visibleColumns.has(c.key));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Drop selected ids that are no longer in the (filtered) transaction set.
  useEffect(() => {
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const valid = new Set(transactions.map((t) => t.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => (valid.has(id) ? next.add(id) : (changed = true)));
      return changed ? next : prev;
    });
  }, [transactions]);

  const counts = {
    all: transactions.length,
    included: transactions.filter((t) => t.status === 'Included').length,
    excluded: transactions.filter((t) => t.status === 'Excluded').length,
  };

  const rows = transactions.filter((t) => {
    if (statusTab === 'included') return t.status === 'Included';
    if (statusTab === 'excluded') return t.status === 'Excluded';
    return true;
  });

  const selectedInView = rows.filter((r) => selected.has(r.id)).length;
  const allSelected = rows.length > 0 && selectedInView === rows.length;
  const someSelected = selectedInView > 0 && !allSelected;

  const headerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerRef.current) headerRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-1" role="tablist" aria-label="Filter transactions by status">
          <Tab label="All" count={counts.all} active={statusTab === 'all'} onClick={() => onStatusTabChange('all')} />
          <Tab label="Included" count={counts.included} active={statusTab === 'included'} onClick={() => onStatusTabChange('included')} />
          <Tab label="Excluded" count={counts.excluded} active={statusTab === 'excluded'} onClick={() => onStatusTabChange('excluded')} />
        </div>
        {selectedInView > 0 && (
          <div className="flex items-center gap-3 pr-1">
            <span className="text-xs font-medium text-gray-500">{selectedInView} selected</span>
            <button
              onClick={() => setSelected(new Set())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow-sm transition-all active:scale-[0.97]"
            >
              <ListPlus className="w-3.5 h-3.5" /> Add to screening list
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-3 w-10 border-b border-gray-200 bg-gray-50">
                <input
                  ref={headerRef}
                  type="checkbox"
                  aria-label="Select all transactions"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {cols.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap bg-gray-50',
                    c.align === 'right' ? 'text-right' : 'text-left'
                  )}
                >
                  {c.label}
                </th>
              ))}
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right bg-gray-50">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((tx) => {
              const excluded = tx.status === 'Excluded';
              const isSelected = selected.has(tx.id);
              return (
                <tr
                  key={tx.id}
                  className={cn(
                    'transition-colors',
                    isSelected
                      ? 'bg-indigo-50'
                      : excluded
                        ? 'bg-gray-50/40 hover:bg-gray-100/80'
                        : 'hover:bg-indigo-50/70'
                  )}
                >
                  <td className={cn('p-3 align-top', isSelected && 'shadow-[inset_3px_0_0_0_#6366f1]')}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${tx.targetCompany}`}
                      checked={isSelected}
                      onChange={() => toggleOne(tx.id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  {cols.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'p-3 align-top text-sm whitespace-nowrap',
                        c.align === 'right' ? 'text-right tabular-nums' : 'text-left',
                        excluded ? 'text-gray-400' : 'text-gray-700'
                      )}
                    >
                      {c.key === 'target' ? (
                        <div className={cn('flex items-start gap-3', excluded && 'opacity-60')}>
                          <div
                            className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0',
                              excluded ? 'bg-gray-200 text-gray-500' : 'bg-gray-900 text-white'
                            )}
                          >
                            {tx.targetCompany.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{tx.targetCompany}</div>
                            <div className="text-xs text-gray-500 mt-0.5 max-w-[240px] whitespace-normal line-clamp-2">
                              {tx.targetDescription}
                            </div>
                            <div className="flex gap-1.5 mt-1.5">
                              <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                aria-label={`${tx.targetCompany} on LinkedIn`}
                              >
                                <Linkedin className="w-3 h-3" aria-hidden="true" />
                              </a>
                              <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="p-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                aria-label={`${tx.targetCompany} website`}
                              >
                                <Globe className="w-3 h-3" aria-hidden="true" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : c.key === 'geography' ? (
                        <div className={cn('flex items-center gap-2', excluded && 'opacity-60')}>
                          <img
                            src={`https://flagcdn.com/w20/${tx.countryCode.toLowerCase()}.png`}
                            alt={`${tx.location} flag`}
                            className="w-5 h-auto rounded-sm shadow-sm"
                          />
                          <span>{tx.location}</span>
                        </div>
                      ) : c.key === 'sector' ? (
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            excluded ? 'bg-gray-100 text-gray-500 border-gray-200' : SECTOR_COLORS[tx.sector] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                          )}
                        >
                          {tx.sector}
                        </span>
                      ) : c.key === 'buyerType' ? (
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            excluded
                              ? 'bg-gray-100 text-gray-500 border-gray-200'
                              : tx.buyerType === 'Strategic'
                                ? 'bg-sky-50 text-sky-700 border-sky-100'
                                : 'bg-purple-50 text-purple-700 border-purple-100'
                          )}
                        >
                          {tx.buyerType}
                        </span>
                      ) : MULTIPLE_KEYS.has(c.key) ? (
                        c.display(tx) === '—' ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums',
                              excluded ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-700'
                            )}
                          >
                            {c.display(tx)}
                          </span>
                        )
                      ) : (
                        c.display(tx)
                      )}
                    </td>
                  ))}
                  <td className="p-3 align-top text-right">
                    <button
                      onClick={() => onToggleStatus(tx.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-[0.97] border',
                        excluded
                          ? 'bg-white border-gray-300 text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                          : 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100'
                      )}
                    >
                      {excluded ? (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" /> Include
                        </>
                      ) : (
                        <>
                          <MinusCircle className="w-3.5 h-3.5" /> Exclude
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={cols.length + 2} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <SearchX className="w-10 h-10 text-gray-300" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-600">No comps match the current filters</p>
                    <p className="text-xs text-gray-400">Try widening a range or clearing a filter above.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
        active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      )}
    >
      {label}
      <span
        className={cn(
          'px-2 py-0.5 rounded-full text-xs tabular-nums',
          active ? 'bg-white text-indigo-700 shadow-sm' : 'bg-gray-100'
        )}
      >
        {count}
      </span>
    </button>
  );
}
