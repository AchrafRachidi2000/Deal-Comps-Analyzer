import React from 'react';
import type { RangeFilter, DateRange } from '@/dealCompsV1/data/types';

/* ── Multi-select (checkbox list) ── */

export function MultiSelect({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);

  return (
    <div className="space-y-0.5 p-1 min-w-[200px]">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

/* ── Dual-thumb range (slider bars + numeric inputs) ── */

export function RangeControl({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  suffix = '',
}: {
  value: RangeFilter;
  onChange: (r: RangeFilter) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  suffix?: string;
}) {
  const hiBound = max > min ? max : min + 1;
  const lo = value.min ?? min;
  const hi = value.max ?? hiBound;
  const parse = (s: string) => (s.trim() === '' ? null : Number(s));

  return (
    <div className="p-3 space-y-3 min-w-[240px]">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {unit && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>}
          <input
            type="number"
            value={value.min ?? ''}
            step={step}
            placeholder="Min"
            onChange={(e) => onChange({ ...value, min: parse(e.target.value) })}
            className={`w-full ${unit ? 'pl-5' : 'pl-2.5'} pr-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400`}
          />
        </div>
        <span className="text-gray-400 text-xs flex-shrink-0">–</span>
        <div className="relative flex-1">
          {unit && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>}
          <input
            type="number"
            value={value.max ?? ''}
            step={step}
            placeholder="Max"
            onChange={(e) => onChange({ ...value, max: parse(e.target.value) })}
            className={`w-full ${unit ? 'pl-5' : 'pl-2.5'} pr-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Min</span>
            <span>{unit}{lo}{suffix}</span>
          </div>
          <input
            type="range"
            min={min}
            max={hiBound}
            step={step}
            value={lo}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...value, min: n > hi ? hi : n });
            }}
            className="w-full accent-indigo-600"
          />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Max</span>
            <span>{unit}{hi}{suffix}</span>
          </div>
          <input
            type="range"
            min={min}
            max={hiBound}
            step={step}
            value={hi}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...value, max: n < lo ? lo : n });
            }}
            className="w-full accent-indigo-600"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Date range (from/to + quick presets) ── */

export function DateRangeControl({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (d: DateRange) => void;
}) {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const preset = (years: number) => {
    const from = new Date(today);
    from.setFullYear(from.getFullYear() - years);
    onChange({ from: iso(from), to: iso(today) });
  };

  return (
    <div className="p-3 space-y-3 min-w-[240px]">
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">From</label>
          <input
            type="date"
            value={value.from ?? ''}
            onChange={(e) => onChange({ ...value, from: e.target.value || null })}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">To</label>
          <input
            type="date"
            value={value.to ?? ''}
            onChange={(e) => onChange({ ...value, to: e.target.value || null })}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
      </div>
      <div className="flex gap-1.5">
        {[1, 3, 5].map((y) => (
          <button
            key={y}
            onClick={() => preset(y)}
            className="px-2 py-1 text-[11px] font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            Last {y}y
          </button>
        ))}
      </div>
    </div>
  );
}
