import React from 'react';
import { Info } from 'lucide-react';
import type { PresetCompany, DealCompFilters } from '@/dealCompsV1/data/types';
import { FILTER_DEFS } from '@/dealCompsV1/data/filterDefs';
import { filterValueLabel, hasFilterValue } from './filterShared';

export function ValidationSummary({
  company,
  filters,
}: {
  company: PresetCompany;
  filters: DealCompFilters;
}) {
  const activeDefs = FILTER_DEFS.filter((d) => hasFilterValue(d, filters));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg bg-indigo-50 border border-indigo-100 px-3.5 py-3 text-sm text-indigo-900">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600" />
        <span>The comp set will be built from transactions matching these criteria. You can refine the filters later on the dashboard.</span>
      </div>

      <div className="border border-gray-200 rounded-xl divide-y divide-gray-200">
        <Row label="Target">
          <span className="font-semibold text-gray-900">{company.name}</span>
        </Row>
        <Row label="Comp set">
          <span className="font-medium text-gray-900">{company.transactions.length} precedent transactions</span>
        </Row>
        <div className="p-4">
          <span className="text-sm text-gray-500 block mb-2">Filters</span>
          {activeDefs.length === 0 ? (
            <span className="text-sm text-gray-400 italic">No filters applied — all transactions included.</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeDefs.map((d) => (
                <span
                  key={d.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                >
                  {d.icon}
                  {d.shortLabel}: {filterValueLabel(d, filters)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-4 flex justify-between items-center gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      {children}
    </div>
  );
}
