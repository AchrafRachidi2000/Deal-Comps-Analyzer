import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight } from 'lucide-react';
import type { RangeFilter } from '@/dealCompsV1/data/types';
import { REGION_COUNTRIES } from '@/dealCompsV1/data/geography';
import { cn } from '@/lib/utils';

/* ── Indeterminate-capable checkbox ── */

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    />
  );
}

/* ── Single-select (one value or none) ── */

export function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <div className="p-1 min-w-[210px]">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-left transition-colors',
          value === null ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
        )}
      >
        Any
        {value === null && <Check className="w-3.5 h-3.5" />}
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-left transition-colors',
            value === opt ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
          )}
        >
          {opt}
          {value === opt && <Check className="w-3.5 h-3.5" />}
        </button>
      ))}
    </div>
  );
}

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

/* ── Geography (collapsible regions; selecting a region selects its countries) ── */

export function GeographyControl({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['North America']));

  const toggleExpand = (region: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(region) ? next.delete(region) : next.add(region);
      return next;
    });

  const toggleCountry = (name: string) =>
    onChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name]);

  const toggleRegion = (names: string[], allSelected: boolean) =>
    onChange(allSelected ? value.filter((v) => !names.includes(v)) : [...new Set([...value, ...names])]);

  return (
    <div className="p-1 min-w-[250px] max-h-[320px] overflow-y-auto">
      {REGION_COUNTRIES.map((g) => {
        const names = g.countries.map((c) => c.name);
        const sel = names.filter((n) => value.includes(n)).length;
        const all = sel === names.length && names.length > 0;
        const open = expanded.has(g.region);
        return (
          <div key={g.region}>
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-50">
              <button
                onClick={() => toggleExpand(g.region)}
                className="p-0.5 text-gray-400 hover:text-gray-700 flex-shrink-0"
                aria-label={open ? `Collapse ${g.region}` : `Expand ${g.region}`}
                aria-expanded={open}
              >
                <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-90')} aria-hidden="true" />
              </button>
              <label className="flex items-center gap-2 flex-1 cursor-pointer text-sm font-medium text-gray-800 min-w-0">
                <IndeterminateCheckbox checked={all} indeterminate={sel > 0} onChange={() => toggleRegion(names, all)} />
                <span className="truncate">{g.region}</span>
                <span className="ml-auto text-[10px] text-gray-400 flex-shrink-0">
                  {sel > 0 ? `${sel}/${names.length}` : names.length}
                </span>
              </label>
            </div>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="pl-7 pb-1">
                    {g.countries.map((c) => (
                      <label
                        key={c.name}
                        className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-50 cursor-pointer text-sm text-gray-600"
                      >
                        <input
                          type="checkbox"
                          checked={value.includes(c.name)}
                          onChange={() => toggleCountry(c.name)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <img
                          src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                          alt={`${c.name} flag`}
                          className="w-4 h-auto rounded-sm"
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ── Single dual-thumb range bar (fixed bounds, no numeric boxes) ── */

export function RangeControl({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  suffix = '',
  label = 'Range',
}: {
  value: RangeFilter;
  onChange: (r: RangeFilter) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  suffix?: string;
  label?: string;
}) {
  const lo = clamp(value.min ?? min, min, max);
  const hi = clamp(value.max ?? max, min, max);
  const span = max - min || 1;
  const pctLo = ((lo - min) / span) * 100;
  const pctHi = ((hi - min) / span) * 100;

  const setMin = (n: number) => {
    const next = n >= hi ? hi : n;
    onChange({ ...value, min: next <= min ? null : next });
  };
  const setMax = (n: number) => {
    const next = n <= lo ? lo : n;
    onChange({ ...value, max: next >= max ? null : next });
  };

  const fmt = useMemo(() => {
    return (n: number) => {
      if (unit === '$') {
        if (n >= 1000) {
          const b = n / 1000;
          return `$${Number.isInteger(b) ? b : b.toFixed(1)}B`;
        }
        return `$${n.toLocaleString('en-US')}M`;
      }
      const num = Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(1);
      return `${num}${suffix}`;
    };
  }, [unit, suffix]);

  const atMax = value.max === null;

  return (
    <div className="px-3 py-3 min-w-[240px] space-y-2.5">
      <div className="relative h-4 flex items-center">
        <div className="absolute h-1.5 w-full rounded-full bg-gray-200" />
        <div className="absolute h-1.5 rounded-full bg-indigo-500" style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }} />
        <input
          type="range"
          className="range-slider"
          aria-label={`${label} minimum`}
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => setMin(Number(e.target.value))}
        />
        <input
          type="range"
          className="range-slider"
          aria-label={`${label} maximum`}
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => setMax(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-between text-xs font-semibold text-gray-700 tabular-nums">
        <span>{fmt(lo)}</span>
        <span>
          {fmt(hi)}
          {atMax ? '+' : ''}
        </span>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(n, hi));
}
