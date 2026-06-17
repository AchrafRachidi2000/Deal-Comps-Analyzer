import React from 'react';
import type { MultipleStat } from '@/dealCompsV1/lib/stats';
import { formatMultiple } from '@/dealCompsV1/lib/format';
import { cn } from '@/lib/utils';

export function SummaryStatsTable({ stats, scope }: { stats: MultipleStat[]; scope: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">Summary Statistics</span>
        <span className="text-xs text-gray-400">Computed across {scope} comp{scope === 1 ? '' : 's'}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-gray-500">
              <th className="text-left font-semibold px-4 py-2">Multiple</th>
              <th className="text-right font-semibold px-4 py-2">Min</th>
              <th className="text-right font-semibold px-4 py-2">25th</th>
              <th className="text-right font-semibold px-4 py-2 bg-indigo-50/60 text-indigo-600">Median</th>
              <th className="text-right font-semibold px-4 py-2">Mean</th>
              <th className="text-right font-semibold px-4 py-2">75th</th>
              <th className="text-right font-semibold px-4 py-2">Max</th>
              <th className="text-right font-semibold px-4 py-2">Sample</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.map((s) => (
              <tr key={s.key} className="hover:bg-gray-50/60">
                <td className="text-left font-medium text-gray-900 px-4 py-2.5 whitespace-nowrap">{s.label}</td>
                <Cell value={s.min} />
                <Cell value={s.p25} />
                <td className="text-right px-4 py-2.5 tabular-nums font-bold text-indigo-600 bg-indigo-50/60">
                  {formatMultiple(s.median)}
                </td>
                <Cell value={s.mean} />
                <Cell value={s.p75} />
                <Cell value={s.max} />
                <td className="text-right px-4 py-2.5">
                  <Sample n={s.n} total={s.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ value }: { value: number | null }) {
  return <td className="text-right px-4 py-2.5 tabular-nums text-gray-700">{formatMultiple(value)}</td>;
}

function Sample({ n, total }: { n: number; total: number }) {
  const full = total > 0 && n === total;
  const none = n === 0;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums',
        none ? 'bg-gray-100 text-gray-400' : full ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      )}
    >
      {n} of {total}
    </span>
  );
}
