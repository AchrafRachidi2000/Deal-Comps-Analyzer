import React, { useMemo, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { CompTransaction, RangeFilter, DateRange } from '@/dealCompsV1/data/types';

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
    <div className="p-1 min-w-[200px]">
      <button
        onClick={() => onChange(null)}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-left transition-colors ${
          value === null ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        Any
        {value === null && <Check className="w-3.5 h-3.5" />}
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-left transition-colors ${
            value === opt ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
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

/* ── Geography (regions with nested countries; selecting a region selects its countries) ── */

export function GeographyControl({
  value,
  onChange,
  transactions,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  transactions: CompTransaction[];
}) {
  const groups = useMemo(() => {
    const m = new Map<string, { name: string; code: string }[]>();
    for (const t of transactions) {
      const arr = m.get(t.region) ?? [];
      if (!arr.some((c) => c.name === t.location)) arr.push({ name: t.location, code: t.countryCode });
      m.set(t.region, arr);
    }
    return [...m.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([region, countries]) => ({ region, countries: countries.sort((a, b) => a.name.localeCompare(b.name)) }));
  }, [transactions]);

  const toggleCountry = (name: string) =>
    onChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name]);

  const toggleRegion = (names: string[], allSelected: boolean) => {
    if (allSelected) onChange(value.filter((v) => !names.includes(v)));
    else onChange([...new Set([...value, ...names])]);
  };

  return (
    <div className="p-1 min-w-[230px] max-h-[300px] overflow-y-auto">
      {groups.map((g) => (
        <RegionRow key={g.region} region={g.region} countries={g.countries} value={value} onToggleCountry={toggleCountry} onToggleRegion={toggleRegion} />
      ))}
    </div>
  );
}

function RegionRow({
  region,
  countries,
  value,
  onToggleCountry,
  onToggleRegion,
}: {
  key?: React.Key;
  region: string;
  countries: { name: string; code: string }[];
  value: string[];
  onToggleCountry: (name: string) => void;
  onToggleRegion: (names: string[], allSelected: boolean) => void;
}) {
  const names = countries.map((c) => c.name);
  const selectedCount = names.filter((n) => value.includes(n)).length;
  const all = selectedCount === names.length && names.length > 0;
  const some = selectedCount > 0 && !all;
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some;
  }, [some]);

  return (
    <div className="mb-1">
      <label className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-800">
        <input
          ref={ref}
          type="checkbox"
          checked={all}
          onChange={() => onToggleRegion(names, all)}
          className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        {region}
      </label>
      <div className="pl-5">
        {countries.map((c) => (
          <label
            key={c.name}
            className="flex items-center gap-2.5 px-3 py-1 rounded-md hover:bg-gray-50 cursor-pointer text-sm text-gray-600"
          >
            <input
              type="checkbox"
              checked={value.includes(c.name)}
              onChange={() => onToggleCountry(c.name)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <img src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} alt={c.code} className="w-4 h-auto rounded-sm" />
            {c.name}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ── Single dual-thumb range bar (no numeric boxes) ── */

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
  const lo = clamp(value.min ?? min, min, hiBound);
  const hi = clamp(value.max ?? hiBound, min, hiBound);
  const span = hiBound - min || 1;
  const pctLo = ((lo - min) / span) * 100;
  const pctHi = ((hi - min) / span) * 100;

  const setMin = (n: number) => {
    const next = n >= hi ? hi : n;
    onChange({ ...value, min: next <= min ? null : next });
  };
  const setMax = (n: number) => {
    const next = n <= lo ? lo : n;
    onChange({ ...value, max: next >= hiBound ? null : next });
  };

  const fmt = (n: number) => `${unit}${Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(1)}${suffix}`;

  return (
    <div className="p-3 min-w-[240px] space-y-2">
      <div className="relative h-4 flex items-center">
        <div className="absolute h-1 w-full rounded-full bg-gray-200" />
        <div className="absolute h-1 rounded-full bg-indigo-600" style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }} />
        <input
          type="range"
          className="range-slider"
          min={min}
          max={hiBound}
          step={step}
          value={lo}
          onChange={(e) => setMin(Number(e.target.value))}
        />
        <input
          type="range"
          className="range-slider"
          min={min}
          max={hiBound}
          step={step}
          value={hi}
          onChange={(e) => setMax(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-between text-[11px] font-medium text-gray-600">
        <span>{fmt(lo)}</span>
        <span>
          {fmt(hi)}
          {value.max === null && hi === hiBound ? '+' : ''}
        </span>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(n, hi));
}

/* ── Date range (from/to, clamped) ── */

export function DateRangeControl({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (d: DateRange) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const iso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
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
            max={value.to ?? undefined}
            onChange={(e) => {
              const from = e.target.value || null;
              onChange({ ...value, from: from && value.to && from > value.to ? value.to : from });
            }}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">To</label>
          <input
            type="date"
            value={value.to ?? ''}
            min={value.from ?? undefined}
            onChange={(e) => {
              const to = e.target.value || null;
              onChange({ ...value, to: to && value.from && to < value.from ? value.from : to });
            }}
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
