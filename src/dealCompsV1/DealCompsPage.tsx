import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Scale,
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DealCompFilters } from '@/dealCompsV1/data/types';
import { EMPTY_FILTERS } from '@/dealCompsV1/data/types';
import { makeCustomCompany } from '@/dealCompsV1/data/companies';
import { filterTransactions } from '@/dealCompsV1/lib/filtering';
import { computeAllStats } from '@/dealCompsV1/lib/stats';
import { COLUMN_DEFS, defaultVisibleColumns } from '@/dealCompsV1/lib/columns';
import { buildCsv, buildWorkbook, downloadCsv, downloadWorkbook } from '@/dealCompsV1/lib/export';
import { FilterBar } from '@/dealCompsV1/components/FilterBar';
import { SummaryStatsTable } from '@/dealCompsV1/components/SummaryStatsTable';
import { ColumnPicker } from '@/dealCompsV1/components/ColumnPicker';
import { ResultsTable } from '@/dealCompsV1/components/ResultsTable';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Pre-generated screening filters proposed for the target; editable inline on this page.
const GENERATED_FILTERS: DealCompFilters = {
  ...EMPTY_FILTERS,
  transactionAge: { min: null, max: 6 },
  buyerType: ['Strategic', 'Financial'],
  revenue: { min: null, max: 3000 },
  evRevenue: { min: 2, max: 25 },
  evEbitda: { min: 8, max: 60 },
};

// A prominent loading screen that cycles through step messages.
function BigLoader({ messages, variant }: { messages: string[]; variant: 'screen' | 'card' }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => setI((x) => (x + 1) % messages.length), 1100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={
        variant === 'screen'
          ? 'flex-1 flex flex-col items-center justify-center gap-5 text-center px-6 py-24'
          : 'rounded-xl border border-gray-200 bg-white shadow-sm py-20 px-6 flex flex-col items-center justify-center gap-5 text-center'
      }
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={messages[i]}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold text-gray-900"
          >
            {messages[i]}
          </motion.div>
        </AnimatePresence>
        <div className="text-sm text-gray-400 mt-1.5">This usually takes a few seconds.</div>
      </div>
    </motion.div>
  );
}

export function DealCompsPage({ companyName, onBack }: { companyName: string; onBack: () => void }) {
  const [filters, setFilters] = useState<DealCompFilters>(GENERATED_FILTERS);
  // Extraction of the screening criteria happens as the workflow opens.
  const [extractingFilters, setExtractingFilters] = useState(true);
  // The filter set the currently-shown comp list was generated from (null until first validated).
  const [committedFilters, setCommittedFilters] = useState<DealCompFilters | null>(null);
  const [generating, setGenerating] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => defaultVisibleColumns());
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    let active = true;
    sleep(2100).then(() => active && setExtractingFilters(false));
    return () => {
      active = false;
    };
  }, []);

  const transactions = useMemo(() => makeCustomCompany(companyName).transactions, [companyName]);
  const previewCount = useMemo(() => filterTransactions(transactions, filters).length, [transactions, filters]);
  const committedRows = useMemo(
    () => (committedFilters ? filterTransactions(transactions, committedFilters) : []),
    [transactions, committedFilters]
  );
  const stats = useMemo(() => computeAllStats(committedRows), [committedRows]);
  const visibleCols = COLUMN_DEFS.filter((c) => visibleColumns.has(c.key));

  const dirty = committedFilters !== null && JSON.stringify(filters) !== JSON.stringify(committedFilters);

  const validate = async () => {
    if (generating) return;
    const snapshot = filters;
    setGenerating(true);
    await sleep(1800);
    setCommittedFilters(snapshot);
    setGenerating(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/60">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors active:scale-95"
          >
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

      {extractingFilters ? (
        /* Workflow opening — extract screening criteria */
        <div className="flex-1 flex flex-col">
          <BigLoader messages={['Extracting screening criteria…', 'Building filters…']} variant="screen" />
        </div>
      ) : (
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
                  Review and refine the extracted screening filters, then validate to generate the comparable transactions.
                </p>
              </div>
            </div>

            {/* Inline, editable filters */}
            <FilterBar filters={filters} onChange={setFilters} />

            {/* Validate / regenerate */}
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs text-gray-400">
                {previewCount} of {transactions.length} comps match
              </span>
              <button
                onClick={validate}
                disabled={generating || (committedFilters !== null && !dirty)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Extracting…
                  </>
                ) : committedFilters === null ? (
                  <>
                    Validate &amp; generate transactions <ArrowRight className="w-4 h-4" />
                  </>
                ) : dirty ? (
                  <>
                    <RefreshCw className="w-4 h-4" /> Regenerate transactions
                  </>
                ) : (
                  <>Transactions up to date</>
                )}
              </button>
            </div>

            {/* Results area — no placeholder before first validation */}
            {generating ? (
              <BigLoader
                messages={['Extracting transactions…', 'Computing valuation multiples…']}
                variant="card"
              />
            ) : committedFilters !== null ? (
              <motion.section
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-900">Comparables</h2>
                    <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-full shadow-sm">
                      {committedRows.length} of {transactions.length}
                    </span>
                    {dirty && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Filters changed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
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
                                  downloadCsv('Deal_Comps.csv', buildCsv(committedRows, visibleCols));
                                  setShowExportMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4 text-gray-500" /> Export to CSV
                              </button>
                              <button
                                onClick={() => {
                                  downloadWorkbook('Deal_Comps.xlsx', buildWorkbook(committedRows, visibleCols, stats));
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

                <SummaryStatsTable stats={stats} scope={committedRows.length} />

                <div className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
                  <ResultsTable transactions={committedRows} visibleColumns={visibleColumns} />
                </div>
              </motion.section>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
