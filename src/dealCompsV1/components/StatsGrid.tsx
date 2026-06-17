import React from 'react';
import type { MultipleStat } from '@/dealCompsV1/lib/stats';
import { formatMultiple } from '@/dealCompsV1/lib/format';

export function StatsGrid({ stats }: { stats: MultipleStat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">{s.label}</span>
            <span className="text-[10px] font-medium text-gray-400">N = {s.n}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Cell label="Min" value={formatMultiple(s.min)} />
            <Cell label="Median" value={formatMultiple(s.median)} highlight />
            <Cell label="Max" value={formatMultiple(s.max)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
      <div className={`text-lg font-bold ${highlight ? 'text-indigo-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}
