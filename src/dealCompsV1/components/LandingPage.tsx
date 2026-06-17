import React, { useState } from 'react';
import { Rocket, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { PresetCompany, DealCompFilters, RangeFilter } from '@/dealCompsV1/data/types';
import { FILTER_DEFS } from '@/dealCompsV1/data/filterDefs';
import { extentOf } from '@/dealCompsV1/lib/filtering';
import { SingleSelect, MultiSelect, GeographyControl, RangeControl, DateRangeControl } from './FilterControls';
import { CompanySelect } from './CompanySelect';

interface LandingPageProps {
  companies: PresetCompany[];
  onRun: (company: PresetCompany, filters: DealCompFilters) => void;
}

export function LandingPage({ companies, onRun }: LandingPageProps) {
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState<PresetCompany | null>(null);
  const [filters, setFilters] = useState<DealCompFilters | null>(null);

  const handleSelect = (c: PresetCompany) => {
    setCompany(c);
    setFilters(c.presetFilters);
  };

  const update = <K extends keyof DealCompFilters>(key: K, val: DealCompFilters[K]) => {
    setFilters((f) => (f ? { ...f, [key]: val } : f));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 px-6 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-indigo-100 p-1.5 rounded-lg">
              <Rocket className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Precedent Transactions — V1</h2>
          </div>
          <p className="text-gray-500 text-sm">Pick a target, tune the filters, run the comp set.</p>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-100 h-1 flex-shrink-0">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-900">1. Select Target Company</h3>
                <CompanySelect companies={companies} value={company} onSelect={handleSelect} />
                {company && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-2.5 text-sm text-indigo-800">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Loaded <span className="font-medium">{company.transactions.length}</span> precedent transactions and
                      preset filters for <span className="font-medium">{company.name}</span>. Adjust them in the next step.
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && company && filters && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-900">2. Filters</h3>
                <div className="space-y-3">
                  {FILTER_DEFS.map((def) => (
                    <div key={def.key} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                        {def.icon}
                        {def.label}
                      </div>
                      {def.kind === 'single' && (
                        <SingleSelect
                          options={def.options!}
                          value={(filters[def.key] as string[])[0] ?? null}
                          onChange={(v) => update(def.key, (v ? [v] : []) as DealCompFilters[typeof def.key])}
                        />
                      )}
                      {def.kind === 'multi' && (
                        <MultiSelect
                          options={def.options!}
                          selected={filters[def.key] as string[]}
                          onChange={(next) => update(def.key, next as DealCompFilters[typeof def.key])}
                        />
                      )}
                      {def.kind === 'geo' && (
                        <GeographyControl
                          value={filters.geography}
                          onChange={(next) => update('geography', next)}
                          transactions={company.transactions}
                        />
                      )}
                      {def.kind === 'range' && (
                        <RangeControl
                          value={filters[def.key] as RangeFilter}
                          onChange={(r) => update(def.key, r as DealCompFilters[typeof def.key])}
                          {...extentOf(company.transactions, def.field!)}
                          step={def.step}
                          unit={def.unit}
                          suffix={def.suffix}
                        />
                      )}
                      {def.kind === 'date' && (
                        <DateRangeControl
                          value={filters.announcementDate}
                          onChange={(d) => update('announcementDate', d)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <div className="flex gap-1">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${step >= i ? 'bg-indigo-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!company}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => company && filters && onRun(company, filters)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2"
              >
                Run Analysis <Rocket className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
