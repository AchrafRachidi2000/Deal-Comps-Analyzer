import React from 'react';
import { MultipleStats } from '@/publicComps/data/mockData';
import { formatMultiple } from '@/publicComps/lib/stats';
import { cn } from '@/lib/utils';

interface SummaryStatsGridProps {
  stats: MultipleStats[];
}

export function SummaryStatsGrid({ stats }: SummaryStatsGridProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Summary Statistics</h3>
        <p className="text-xs text-gray-500">Computed across included public peers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Multiple
              </th>
              <StatHeader label="Min" />
              <StatHeader label="25th" />
              <StatHeader label="Median" emphasised />
              <StatHeader label="Mean" />
              <StatHeader label="75th" />
              <StatHeader label="Max" />
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Sample
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.map((s) => {
              const hasData = s.sampleSize > 0;
              return (
                <tr key={s.multiple} className={cn(!hasData && 'bg-gray-50/60 text-gray-400')}>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.label}</td>
                  <StatCell value={hasData ? s.min : null} />
                  <StatCell value={hasData ? s.p25 : null} />
                  <StatCell value={hasData ? s.median : null} emphasised />
                  <StatCell value={hasData ? s.mean : null} />
                  <StatCell value={hasData ? s.p75 : null} />
                  <StatCell value={hasData ? s.max : null} />
                  <td className="px-4 py-3 text-right text-xs whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full font-medium',
                        !hasData
                          ? 'bg-gray-100 text-gray-400'
                          : s.sampleSize === s.totalPeers
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      )}
                    >
                      {s.sampleSize} of {s.totalPeers}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatHeader({ label, emphasised }: { label: string; emphasised?: boolean }) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider border-b border-gray-200',
        emphasised ? 'text-indigo-700 bg-indigo-50/40' : 'text-gray-500'
      )}
    >
      {label}
    </th>
  );
}

function StatCell({ value, emphasised }: { value: number | null; emphasised?: boolean }) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-right tabular-nums whitespace-nowrap',
        emphasised ? 'font-bold text-indigo-700 bg-indigo-50/20' : 'text-gray-800'
      )}
    >
      {formatMultiple(value)}
    </td>
  );
}
