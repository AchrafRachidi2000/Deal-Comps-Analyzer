import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Scale, Download, FileText, FileSpreadsheet, SlidersHorizontal, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DealCompFilters } from '@/dealCompsV1/data/types';
import { EMPTY_FILTERS } from '@/dealCompsV1/data/types';
import { makeCustomCompany } from '@/dealCompsV1/data/companies';
import { filterTransactions } from '@/dealCompsV1/lib/filtering';
import { computeAllStats } from '@/dealCompsV1/lib/stats';
import { COLUMN_DEFS, defaultVisibleColumns } from '@/dealCompsV1/lib/columns';
import { buildCsv, buildWorkbook, downloadCsv, downloadWorkbook } from '@/dealCompsV1/lib/export';
import { FilterGrid } from '@/dealCompsV1/components/FilterGrid';
import { SummaryStatsTable } from '@/dealCompsV1/components/SummaryStatsTable';
import { ColumnPicker } from '@/dealCompsV1/components/ColumnPicker';
import { ResultsTable } from '@/dealCompsV1/components/ResultsTable';

// Pre-generated screening filters proposed for the target (analyst validates/edits before running).
const GENERATED_FILTERS: DealCompFilters = {
  ...EMPTY_FILTERS,
  transactionAge: { min: null, max: 6 },
  buyerType: ['Strategic', 'Financial'],
  revenue: { min: null, max: 3000 },
  evRevenue: { min: 2, max: 25 },
  evEbitda: { min: 8, max: 60 },
};

export function DealCompsPage({ companyName, onBack }: { companyName: string; onBack: () => void }) {
  const [filters, setFilters] = useState<DealCompFilters>(GENERATED_FILTERS);
  const [validated, setValidated] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => defaultVisibleColumns());
  const [showExportMenu, setShowExportMenu] = useState(false);

  const transactions = useMemo(() => makeCustomCompany(companyName).transactions, [companyName]);
  const filteredRows = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const stats = useMemo(() => computeAllStats(filteredRows), [filteredRows]);
  const visibleCols = COLUMN_DEFS.filter((c) => visibleColumns.has(c.key));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/60">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Assess</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span>{companyName}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Deal Comps</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {/* Title */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-indigo-600 uppercase">Deal Comps</p>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Precedent transactions · {companyName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                We pre-generated a set of screening filters. Validate or edit them, then review the comparable transactions.
              </p>
            </div>
          </div>

          {!validated ? (
            /* Phase 1 — validate filters */
            <motion.section key="validate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="space-y-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">Validate filters</h2>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  Pre-generated
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {filteredRows.length} of {transactions.length} comps match
                </span>
              </div>
              <FilterGrid filters={filters} onChange={setFilters} />
              <div className="flex justify-end">
                <button
                  onClick={() => setValidated(true)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all active:scale-[0.97]"
                >
                  Validate &amp; view comparables <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.section>
          ) : (
            /* Phase 2 — comparables */
            <motion.section key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Comparables</h2>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-full shadow-sm">
                    {filteredRows.length} of {transactions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setValidated(false)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm flex items-center gap-2 transition-all active:scale-[0.97]"
                  >
                    <Pencil className="w-4 h-4" /> Edit filters
                  </button>
                  <ColumnPicker visible={visibleColumns} onChange={setVisibleColumns} />
                  <div className="relative">
                    <AnimatePresence>
                      {showExportMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.13 }}
                            style={{ transformOrigin: 'top right' }}
                            className="absolute top-full right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20"
                          >
                            <button
                              onClick={() => {
                                downloadCsv('Deal_Comps.csv', buildCsv(filteredRows, visibleCols));
                                setShowExportMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-gray-500" /> Export to CSV
                            </button>
                            <button
                              onClick={() => {
                                downloadWorkbook('Deal_Comps.xlsx', buildWorkbook(filteredRows, visibleCols, stats));
                                setShowExportMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export to Excel
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => setShowExportMenu((s) => !s)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2 transition-all active:scale-[0.97]"
                    >
                      <Download className="w-4 h-4" /> Export
                    </button>
                  </div>
                </div>
              </div>

              <SummaryStatsTable stats={stats} scope={filteredRows.length} />

              <div className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
                <ResultsTable transactions={filteredRows} visibleColumns={visibleColumns} />
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}
