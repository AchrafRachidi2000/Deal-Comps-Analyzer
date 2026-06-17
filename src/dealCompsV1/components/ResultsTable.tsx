import React, { useState, useRef, useEffect } from 'react';
import { Linkedin, Globe, ListPlus, SearchX } from 'lucide-react';
import type { CompTransaction } from '@/dealCompsV1/data/types';
import { COLUMN_DEFS } from '@/dealCompsV1/lib/columns';
import { cn } from '@/lib/utils';

const MULTIPLE_KEYS = new Set(['evEbitdaMultiple', 'evRevenueMultiple']);
const FIRST_MULTIPLE = 'evEbitdaMultiple';

const SECTOR_COLORS: Record<string, string> = {
  Fintech: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'AI / ML': 'bg-violet-50 text-violet-700 border-violet-100',
  Software: 'bg-blue-50 text-blue-700 border-blue-100',
  Consumer: 'bg-amber-50 text-amber-700 border-amber-100',
  Hardware: 'bg-slate-100 text-slate-700 border-slate-200',
  Industrial: 'bg-orange-50 text-orange-700 border-orange-100',
  'Media & Data': 'bg-rose-50 text-rose-700 border-rose-100',
  Healthcare: 'bg-cyan-50 text-cyan-700 border-cyan-100',
};

export function ResultsTable({
  transactions,
  visibleColumns,
}: {
  transactions: CompTransaction[];
  visibleColumns: Set<string>;
}) {
  const cols = COLUMN_DEFS.filter((c) => visibleColumns.has(c.key));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Drop selected ids that are no longer in the (filtered) set.
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

  const selectedCount = transactions.filter((t) => selected.has(t.id)).length;
  const allSelected = transactions.length > 0 && selectedCount === transactions.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const headerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerRef.current) headerRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) transactions.forEach((t) => next.delete(t.id));
      else transactions.forEach((t) => next.add(t.id));
      return next;
    });

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const headerCellCls = (key: string, align: 'left' | 'right') =>
    cn(
      'p-3 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 whitespace-nowrap',
      align === 'right' ? 'text-right' : 'text-left',
      MULTIPLE_KEYS.has(key) ? 'bg-violet-100/70 text-violet-700' : 'bg-gray-50 text-gray-500',
      key === FIRST_MULTIPLE && 'border-l-2 border-l-violet-200'
    );

  const bodyCellCls = (key: string, align: 'left' | 'right', excluded: boolean) =>
    cn(
      'p-3 align-top text-sm whitespace-nowrap',
      align === 'right' ? 'text-right tabular-nums' : 'text-left',
      MULTIPLE_KEYS.has(key) && 'bg-violet-50/50',
      key === FIRST_MULTIPLE && 'border-l-2 border-l-violet-100',
      excluded ? 'text-gray-400' : 'text-gray-700'
    );

  return (
    <div className="flex flex-col">
      {/* Selection action bar (only when rows are selected) */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-end gap-3 px-3 py-2 border-b border-gray-200 bg-indigo-50/40">
          <span className="text-xs font-medium text-gray-600">{selectedCount} selected</span>
          <button
            onClick={() => setSelected(new Set())}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow-sm transition-all active:scale-[0.97]"
          >
            <ListPlus className="w-3.5 h-3.5" /> Add to screening list
          </button>
        </div>
      )}

      <div className="overflow-auto max-h-[62vh]">
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
                <th key={c.key} className={headerCellCls(c.key, c.align)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const isSelected = selected.has(tx.id);
              return (
                <tr key={tx.id} className={cn('transition-colors', isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50/80')}>
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
                    <td key={c.key} className={bodyCellCls(c.key, c.align, false)}>
                      {c.key === 'target' ? (
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-gray-900 text-white">
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
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w20/${tx.countryCode.toLowerCase()}.png`}
                            alt={`${tx.location} flag`}
                            className="w-5 h-auto rounded-sm shadow-sm"
                          />
                          <span>{tx.location}</span>
                        </div>
                      ) : c.key === 'similarity' ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm font-semibold tabular-nums',
                              tx.similarityScore >= 85 ? 'text-emerald-600' : tx.similarityScore >= 72 ? 'text-green-600' : 'text-amber-600'
                            )}
                          >
                            {tx.similarityScore}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                tx.similarityScore >= 85 ? 'bg-emerald-500' : tx.similarityScore >= 72 ? 'bg-green-500' : 'bg-amber-500'
                              )}
                              style={{ width: `${tx.similarityScore}%` }}
                            />
                          </div>
                        </div>
                      ) : c.key === 'sector' ? (
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            SECTOR_COLORS[tx.sector] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                          )}
                        >
                          {tx.sector}
                        </span>
                      ) : c.key === 'buyerType' ? (
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            tx.buyerType === 'Strategic'
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tabular-nums bg-violet-100 text-violet-700">
                            {c.display(tx)}
                          </span>
                        )
                      ) : (
                        c.display(tx)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={cols.length + 1} className="p-12 text-center">
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
