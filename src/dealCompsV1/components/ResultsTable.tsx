import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import type { CompTransaction } from '@/dealCompsV1/data/types';
import { COLUMN_DEFS } from '@/dealCompsV1/lib/columns';
import { cn } from '@/lib/utils';

export type StatusTab = 'all' | 'included' | 'excluded';

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

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white">
        <Tab label="All" count={counts.all} active={statusTab === 'all'} onClick={() => onStatusTabChange('all')} />
        <Tab label="Included" count={counts.included} active={statusTab === 'included'} onClick={() => onStatusTabChange('included')} />
        <Tab label="Excluded" count={counts.excluded} active={statusTab === 'excluded'} onClick={() => onStatusTabChange('excluded')} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[110px]">
                Status
              </th>
              {cols.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap',
                    c.align === 'right' ? 'text-right' : 'text-left'
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((tx) => {
              const excluded = tx.status === 'Excluded';
              return (
                <tr key={tx.id} className={cn('hover:bg-gray-50 transition-colors', excluded && 'bg-gray-50/50')}>
                  <td className="p-3 align-top">
                    <button
                      onClick={() => onToggleStatus(tx.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border',
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
                  {cols.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'p-3 align-top text-sm whitespace-nowrap',
                        c.align === 'right' ? 'text-right' : 'text-left',
                        excluded ? 'text-gray-400' : 'text-gray-700'
                      )}
                    >
                      {c.key === 'target' ? (
                        <div className={cn(excluded && 'opacity-60')}>
                          <div className="font-semibold text-gray-900">{tx.targetCompany}</div>
                          <div className="text-xs text-gray-500 mt-0.5 max-w-[260px] whitespace-normal line-clamp-2">
                            {tx.targetDescription}
                          </div>
                        </div>
                      ) : c.key === 'geography' ? (
                        <div className={cn('flex items-center gap-2', excluded && 'opacity-60')}>
                          <img
                            src={`https://flagcdn.com/w20/${tx.countryCode.toLowerCase()}.png`}
                            alt={tx.countryCode}
                            className="w-5 h-auto rounded-sm shadow-sm"
                          />
                          <span>{tx.region}</span>
                        </div>
                      ) : (
                        c.display(tx)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={cols.length + 1} className="p-8 text-center text-sm text-gray-400">
                  No transactions match the current filters.
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
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      )}
    >
      {label}
      <span className={cn('px-2 py-0.5 rounded-full text-xs', active ? 'bg-white shadow-sm' : 'bg-gray-100')}>
        {count}
      </span>
    </button>
  );
}
