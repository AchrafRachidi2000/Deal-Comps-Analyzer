import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  RotateCw,
  SlidersHorizontal,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParsedFilters, CustomConstraint } from '@/publicComps/lib/api';

interface FilterBarProps {
  filters: ParsedFilters;
  customFilters: CustomConstraint[];
  description: string;
  onRediscover: (
    filters: ParsedFilters,
    customFilters: CustomConstraint[],
    description: string
  ) => void;
  isRediscovering: boolean;
  error: string | null;
}

export function FilterBar({
  filters,
  customFilters,
  description,
  onRediscover,
  isRediscovering,
  error,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ParsedFilters>(filters);
  const [draftCustom, setDraftCustom] = useState<CustomConstraint[]>(customFilters);
  const [draftDescription, setDraftDescription] = useState<string>(description);

  // Sync drafts when applied filters change (e.g. after re-discovery completes).
  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);
  useEffect(() => {
    setDraftCustom(customFilters);
  }, [customFilters]);
  useEffect(() => {
    setDraftDescription(description);
  }, [description]);

  const dirty =
    JSON.stringify(draftFilters) !== JSON.stringify(filters) ||
    JSON.stringify(draftCustom) !== JSON.stringify(customFilters) ||
    draftDescription !== description;

  const summaryChips: { label: string; value: string }[] = [];
  if (draftFilters.sector) summaryChips.push({ label: 'Sector', value: draftFilters.sector });
  if (draftFilters.geography) summaryChips.push({ label: 'Geo', value: draftFilters.geography });
  if (draftFilters.marketCap) summaryChips.push({ label: 'Mkt Cap', value: draftFilters.marketCap });
  if (draftFilters.revenue) summaryChips.push({ label: 'Revenue', value: draftFilters.revenue });
  for (const c of draftCustom) {
    if (c.label && c.value) summaryChips.push({ label: c.label, value: c.value });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors rounded-lg"
      >
        <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Filters</span>
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {summaryChips.length === 0 ? (
            <span className="text-xs text-gray-400 italic">No filters applied</span>
          ) : (
            summaryChips.map((chip, i) => (
              <span
                key={`${chip.label}-${i}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] border border-gray-200"
              >
                <span className="text-gray-500">{chip.label}:</span>
                <span className="font-medium truncate max-w-[180px]">{chip.value}</span>
              </span>
            ))
          )}
        </div>
        {dirty && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200">
            Unsaved
          </span>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
          {description !== '' && (
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500">Description</label>
              <textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 min-h-[50px]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Field
              label="Sector"
              value={draftFilters.sector ?? ''}
              onChange={(v) => setDraftFilters({ ...draftFilters, sector: v || null })}
              placeholder="e.g. AI software for PE"
            />
            <Field
              label="Geography"
              value={draftFilters.geography ?? ''}
              onChange={(v) => setDraftFilters({ ...draftFilters, geography: v || null })}
              placeholder="e.g. United States"
            />
            <Field
              label="Market cap"
              value={draftFilters.marketCap ?? ''}
              onChange={(v) => setDraftFilters({ ...draftFilters, marketCap: v || null })}
              placeholder="e.g. > $1B"
            />
            <Field
              label="Revenue"
              value={draftFilters.revenue ?? ''}
              onChange={(v) => setDraftFilters({ ...draftFilters, revenue: v || null })}
              placeholder="e.g. > $100M"
            />
            <Field
              label="Target company"
              value={draftFilters.company ?? ''}
              onChange={(v) => setDraftFilters({ ...draftFilters, company: v || null })}
              placeholder="(optional)"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] uppercase tracking-wide text-gray-500">Qualitative</label>
            <textarea
              value={draftFilters.qualitative ?? ''}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, qualitative: e.target.value || null })
              }
              placeholder="(optional) extra business-model context"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 min-h-[50px]"
            />
          </div>

          {draftCustom.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500">Custom filters</label>
              {draftCustom.map((c, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={c.label}
                    onChange={(e) =>
                      setDraftCustom(draftCustom.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))
                    }
                    placeholder="Label"
                    className="w-1/3 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={c.value}
                    onChange={(e) =>
                      setDraftCustom(draftCustom.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)))
                    }
                    placeholder="Value"
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => setDraftCustom(draftCustom.filter((_, i) => i !== idx))}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setDraftCustom([...draftCustom, { label: '', value: '' }])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-dashed border-gray-300 rounded-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add filter
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDraftFilters(filters);
                  setDraftCustom(customFilters);
                  setDraftDescription(description);
                }}
                disabled={!dirty || isRediscovering}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                onClick={() => onRediscover(draftFilters, draftCustom, draftDescription)}
                disabled={isRediscovering}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
                  isRediscovering
                    ? 'bg-indigo-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                )}
              >
                {isRediscovering ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Re-running…
                  </>
                ) : (
                  <>
                    <RotateCw className="w-3.5 h-3.5" /> Re-run search
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2.5 flex gap-2 text-xs text-red-800">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] uppercase tracking-wide text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
