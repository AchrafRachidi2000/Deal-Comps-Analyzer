import React from 'react';
import type { MultipleStat } from '@/dealCompsV1/lib/stats';
import { formatMultiple } from '@/dealCompsV1/lib/format';

export function StatsGrid({ stats }: { stats: MultipleStat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.key} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">{s.label}</span>
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
              n = {s.n}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <Cell label="Min" value={formatMultiple(s.min)} />
            <div className="text-center">
              <div className="text-[10px] text-indigo-400 uppercase tracking-wide mb-0.5">Median</div>
              <div className="text-2xl font-bold text-indigo-600 tabular-nums leading-none">{formatMultiple(s.median)}</div>
            </div>
            <Cell label="Max" value={formatMultiple(s.max)} align="right" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Cell({ label, value, align = 'left' }: { label: string; value: string; align?: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-base font-semibold text-gray-700 tabular-nums leading-none">{value}</div>
    </div>
  );
}
