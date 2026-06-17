import React, { useState } from 'react';
import { Rocket, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { PresetCompany, DealCompFilters } from '@/dealCompsV1/data/types';
import { cn } from '@/lib/utils';
import { CompanySelect } from './CompanySelect';
import { FilterBar } from './FilterBar';

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

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="min-h-full flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-sm">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-indigo-600 uppercase">Deal Comps · V1</p>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">Precedent Transactions</h2>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-3">Pick a target, tune the filters, run the comp set.</p>
          </div>

          {/* Stepper */}
          <div className="px-6 pt-5">
            <div className="flex items-center gap-3">
              <StepDot n={1} label="Target" done={step > 1} current={step === 1} />
              <div className={cn('flex-1 h-0.5 rounded-full transition-colors', step > 1 ? 'bg-indigo-600' : 'bg-gray-200')} />
              <StepDot n={2} label="Filters" done={false} current={step === 2} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-semibold text-gray-900">Select target company</h3>
                  <CompanySelect companies={companies} value={company} onSelect={handleSelect} />
                  {company && (
                    <div className="flex items-start gap-2.5 rounded-lg bg-indigo-50 border border-indigo-100 px-3.5 py-3 text-sm text-indigo-900">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                      <span>
                        Loaded <span className="font-semibold">{company.transactions.length}</span> precedent transactions and
                        preset filters for <span className="font-semibold">{company.name}</span>.
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && filters && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Tune the filters</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Pre-filled for {company?.name}. Click any filter to adjust it — you can also change these later on the dashboard.
                    </p>
                  </div>
                  <FilterBar filters={filters} onChange={setFilters} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/60 rounded-b-2xl">
            <span className="text-xs text-gray-400">Step {step} of 2</span>
            <div className="flex gap-2.5">
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
    </div>
  );
}

function StepDot({ n, label, done, current }: { n: number; label: string; done: boolean; current: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
          done
            ? 'bg-indigo-600 text-white'
            : current
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-500'
        )}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : n}
      </div>
      <span className={cn('text-sm font-medium', current || done ? 'text-gray-900' : 'text-gray-400')}>{label}</span>
    </div>
  );
}
