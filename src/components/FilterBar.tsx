import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, X, Calendar, DollarSign, Users, BarChart3, TrendingUp, Globe, Building2, Briefcase, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ── */

interface RangeFilter {
  min: string;
  max: string;
}

interface DateRange {
  from: string;
  to: string;
}

interface HardFilters {
  sector: string[];
  buyerType: string[];
  evRange: RangeFilter;
  dealSize: RangeFilter;
  employeeRange: RangeFilter;
  revenueRange: RangeFilter;
  ebitdaRange: RangeFilter;
  geography: string[];
  announcementDate: DateRange;
  evEbitdaMultiple: RangeFilter;
  evRevenueMultiple: RangeFilter;
  status: string[];
}

type FilterKey = keyof HardFilters;

/* ── Filter definitions ── */

interface FilterDef {
  key: FilterKey;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  type: 'multi' | 'range' | 'date';
  options?: string[];
  rangeUnit?: string;
  rangeSuffix?: string;
  rangePlaceholder?: { min: string; max: string };
  step?: string;
}

const ALL_FILTERS: FilterDef[] = [
  { key: 'sector', label: 'Sector', shortLabel: 'Sector', icon: <Building2 className="w-3 h-3" />, type: 'multi', options: ['Medical Devices', 'Diagnostics', 'Health IT / SaaS', 'Medical Supplies', 'Pharmaceuticals', 'Wearables'] },
  { key: 'buyerType', label: 'Buyer Type', shortLabel: 'Buyer', icon: <Briefcase className="w-3 h-3" />, type: 'multi', options: ['Strategic', 'Financial', 'Hybrid'] },
  { key: 'evRange', label: 'Enterprise Value', shortLabel: 'EV', icon: <DollarSign className="w-3 h-3" />, type: 'range', rangeUnit: '$', rangeSuffix: 'M' },
  { key: 'dealSize', label: 'Deal Size', shortLabel: 'Deal Size', icon: <DollarSign className="w-3 h-3" />, type: 'range', rangeUnit: '$', rangeSuffix: 'M' },
  { key: 'employeeRange', label: 'Employees', shortLabel: 'Employees', icon: <Users className="w-3 h-3" />, type: 'range', rangeUnit: '', rangeSuffix: '', rangePlaceholder: { min: 'Min headcount', max: 'Max headcount' } },
  { key: 'revenueRange', label: 'Revenue', shortLabel: 'Revenue', icon: <BarChart3 className="w-3 h-3" />, type: 'range', rangeUnit: '$', rangeSuffix: 'M' },
  { key: 'ebitdaRange', label: 'EBITDA', shortLabel: 'EBITDA', icon: <BarChart3 className="w-3 h-3" />, type: 'range', rangeUnit: '$', rangeSuffix: 'M' },
  { key: 'geography', label: 'Geography', shortLabel: 'Geo', icon: <Globe className="w-3 h-3" />, type: 'multi', options: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'] },
  { key: 'announcementDate', label: 'Announcement Date', shortLabel: 'Date', icon: <Calendar className="w-3 h-3" />, type: 'date' },
  { key: 'evEbitdaMultiple', label: 'EV / EBITDA Multiple', shortLabel: 'EV/EBITDA', icon: <TrendingUp className="w-3 h-3" />, type: 'range', rangeUnit: '', rangeSuffix: 'x', rangePlaceholder: { min: 'Min (e.g. 8)', max: 'Max (e.g. 20)' }, step: '0.1' },
  { key: 'evRevenueMultiple', label: 'EV / Revenue Multiple', shortLabel: 'EV/Rev', icon: <TrendingUp className="w-3 h-3" />, type: 'range', rangeUnit: '', rangeSuffix: 'x', rangePlaceholder: { min: 'Min (e.g. 2)', max: 'Max (e.g. 10)' }, step: '0.1' },
  { key: 'status', label: 'Status', shortLabel: 'Status', icon: <Activity className="w-3 h-3" />, type: 'multi', options: ['Included', 'Excluded'] },
];

// Default visible filters — user can add more via the "+" button
const DEFAULT_VISIBLE: FilterKey[] = ['sector', 'buyerType', 'dealSize', 'geography', 'announcementDate'];

/* ── Defaults ── */

const DEFAULT_FILTERS: HardFilters = {
  sector: [],
  buyerType: [],
  evRange: { min: '', max: '' },
  dealSize: { min: '', max: '' },
  employeeRange: { min: '', max: '' },
  revenueRange: { min: '', max: '' },
  ebitdaRange: { min: '', max: '' },
  geography: [],
  announcementDate: { from: '', to: '' },
  evEbitdaMultiple: { min: '', max: '' },
  evRevenueMultiple: { min: '', max: '' },
  status: [],
};

/* ── Helpers ── */

function chipDisplayValue(def: FilterDef, filters: HardFilters): string {
  const val = filters[def.key];
  if (def.type === 'multi') {
    const arr = val as string[];
    if (arr.length === 0) return 'Any';
    if (arr.length <= 2) return arr.join(', ');
    return `${arr.slice(0, 2).join(', ')} +${arr.length - 2}`;
  }
  if (def.type === 'range') {
    const r = val as RangeFilter;
    const u = def.rangeUnit ?? '';
    const s = def.rangeSuffix ?? '';
    if (r.min && r.max) return `${u}${r.min}${s} – ${u}${r.max}${s}`;
    if (r.min) return `>= ${u}${r.min}${s}`;
    if (r.max) return `<= ${u}${r.max}${s}`;
    return 'Any';
  }
  if (def.type === 'date') {
    const d = val as DateRange;
    if (d.from && d.to) return `${d.from} to ${d.to}`;
    if (d.from) return `From ${d.from}`;
    if (d.to) return `Until ${d.to}`;
    return 'Any';
  }
  return 'Any';
}

function hasValue(def: FilterDef, filters: HardFilters): boolean {
  const val = filters[def.key];
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object' && val !== null) return Object.values(val).some(x => x !== '');
  return false;
}

/* ── Main Component ── */

export function FilterBar() {
  const [hardFilters, setHardFilters] = useState<HardFilters>(DEFAULT_FILTERS);
  const [visibleKeys, setVisibleKeys] = useState<FilterKey[]>(DEFAULT_VISIBLE);
  const [softFilter, setSoftFilter] = useState(
    'Companies specializing in non-invasive respiratory monitoring hardware and software for ICU and home-care settings...'
  );
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [editingSoft, setEditingSoft] = useState(false);
  const [softDraft, setSoftDraft] = useState(softFilter);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close add-filter menu on outside click
  useEffect(() => {
    if (!showAddMenu) return;
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler); };
  }, [showAddMenu]);

  const closePopover = () => setActivePopover(null);
  const togglePopover = (name: string) => setActivePopover(prev => (prev === name ? null : name));

  const handleSaveSoft = () => { setSoftFilter(softDraft); setEditingSoft(false); };
  const handleCancelSoft = () => { setSoftDraft(softFilter); setEditingSoft(false); };

  const updateRange = (key: FilterKey, field: 'min' | 'max', value: string) => {
    setHardFilters(f => ({ ...f, [key]: { ...(f[key] as RangeFilter), [field]: value } }));
  };

  const updateDate = (field: 'from' | 'to', value: string) => {
    setHardFilters(f => ({ ...f, announcementDate: { ...f.announcementDate, [field]: value } }));
  };

  const toggleMulti = (key: FilterKey, value: string) => {
    setHardFilters(f => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const addFilter = (key: FilterKey) => {
    setVisibleKeys(prev => [...prev, key]);
    setShowAddMenu(false);
    // auto-open the popover for the newly added filter
    setTimeout(() => setActivePopover(key), 50);
  };

  const removeFilter = (key: FilterKey) => {
    setVisibleKeys(prev => prev.filter(k => k !== key));
    // Reset the removed filter's value
    setHardFilters(f => ({ ...f, [key]: DEFAULT_FILTERS[key] }));
    if (activePopover === key) closePopover();
  };

  const visibleDefs = visibleKeys.map(k => ALL_FILTERS.find(f => f.key === k)!).filter(Boolean);
  const hiddenDefs = ALL_FILTERS.filter(f => !visibleKeys.includes(f.key));

  const activeCount = visibleDefs.filter(d => hasValue(d, hardFilters)).length;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
      <div className="flex flex-wrap gap-4 items-start">
        {/* Hard Filters */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Hard Filters</span>
            {activeCount > 0 && (
              <span className="text-[10px] font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                {activeCount} active
              </span>
            )}
          </div>

          {/* Horizontal scrollable row */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {visibleDefs.map((def) => (
              <FilterChip
                key={def.key}
                icon={def.icon}
                label={`${def.shortLabel}: ${chipDisplayValue(def, hardFilters)}`}
                active={activePopover === def.key}
                hasValue={hasValue(def, hardFilters)}
                onClick={() => togglePopover(def.key)}
                onRemove={() => removeFilter(def.key)}
              >
                {activePopover === def.key && (
                  <Popover onClose={closePopover}>
                    {def.type === 'multi' && (
                      <MultiSelect
                        options={def.options!}
                        selected={hardFilters[def.key] as string[]}
                        onToggle={(v) => toggleMulti(def.key, v)}
                      />
                    )}
                    {def.type === 'range' && (
                      <RangeInput
                        label={def.label}
                        range={hardFilters[def.key] as RangeFilter}
                        onChange={(field, val) => updateRange(def.key, field, val)}
                        placeholder={def.rangePlaceholder}
                        step={def.step}
                      />
                    )}
                    {def.type === 'date' && (
                      <div className="p-3 space-y-3 min-w-[220px]">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Announcement Date</p>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">From</label>
                            <input
                              type="date"
                              value={(hardFilters.announcementDate as DateRange).from}
                              onChange={(e) => updateDate('from', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">To</label>
                            <input
                              type="date"
                              value={(hardFilters.announcementDate as DateRange).to}
                              onChange={(e) => updateDate('to', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Popover>
                )}
              </FilterChip>
            ))}

            {/* Add filter button */}
            {hiddenDefs.length > 0 && (
              <div className="relative flex-shrink-0" ref={addMenuRef}>
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" /> Add filter
                </button>
                {showAddMenu && (
                  <div className="absolute top-full left-0 mt-1.5 z-30 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] py-1">
                    <div className="p-1 space-y-0.5">
                      {hiddenDefs.map((def) => (
                        <button
                          key={def.key}
                          onClick={() => addFilter(def.key)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
                        >
                          {def.icon}
                          {def.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Soft Filters */}
        <div className="flex-1 min-w-[300px] border-l border-gray-100 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Soft Filters (Context)</span>
          </div>
          {editingSoft ? (
            <div className="space-y-2">
              <textarea
                value={softDraft}
                onChange={(e) => setSoftDraft(e.target.value)}
                rows={3}
                autoFocus
                className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveSoft}
                  className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelSoft}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => { setSoftDraft(softFilter); setEditingSoft(true); }}
              className="text-sm text-gray-600 italic line-clamp-2 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1 -mx-2 -my-1 transition-colors"
              title="Click to edit"
            >
              "{softFilter}"
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
          Keywords <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
        {activeCount > 0 && (
          <>
            <div className="h-6 w-px bg-gray-300 mx-1 flex-shrink-0" />
            <button
              onClick={() => setHardFilters(DEFAULT_FILTERS)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 whitespace-nowrap transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Reusable sub-components ── */

function MultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-0.5 p-1">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <label
            key={opt}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(opt)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function RangeInput({
  label,
  range,
  onChange,
  placeholder,
  step,
}: {
  label: string;
  range: RangeFilter;
  onChange: (field: 'min' | 'max', value: string) => void;
  placeholder?: { min: string; max: string };
  step?: string;
}) {
  return (
    <div className="p-3 space-y-3 min-w-[220px]">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={range.min}
          onChange={(e) => onChange('min', e.target.value)}
          placeholder={placeholder?.min ?? 'Min'}
          step={step}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
        />
        <span className="text-gray-400 text-xs flex-shrink-0">–</span>
        <input
          type="number"
          value={range.max}
          onChange={(e) => onChange('max', e.target.value)}
          placeholder={placeholder?.max ?? 'Max'}
          step={step}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
        />
      </div>
    </div>
  );
}

/* ── Filter chip ── */

function FilterChip({
  icon,
  label,
  active,
  hasValue,
  onClick,
  onRemove,
  children,
}: {
  key?: React.Key;
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  hasValue?: boolean;
  onClick: () => void;
  onRemove?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative flex-shrink-0">
      <div className="flex items-center">
        <button
          onClick={onClick}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border transition-colors whitespace-nowrap',
            onRemove ? 'rounded-l-md' : 'rounded-md',
            active
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200'
              : hasValue
                ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
          )}
        >
          {icon}
          <span className="max-w-[180px] truncate">{label}</span>
        </button>
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className={cn(
              'px-1 py-1 border border-l-0 rounded-r-md transition-colors',
              active
                ? 'bg-indigo-50 text-indigo-400 border-indigo-200 hover:text-indigo-700 hover:bg-indigo-100'
                : hasValue
                  ? 'bg-indigo-50/50 text-indigo-300 border-indigo-100 hover:text-indigo-600 hover:bg-indigo-50'
                  : 'bg-gray-100 text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-200'
            )}
            title="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Popover wrapper ── */

function Popover({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.closest('[data-filter-chip]')) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1.5 z-30 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] py-1"
    >
      {children}
    </div>
  );
}
