import React, { useState, useMemo } from 'react';
import { Scale, Sparkles, Loader2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { makeCustomCompany } from '@/dealCompsV1/data/companies';
import { computeAllStats } from '@/dealCompsV1/lib/stats';
import { COLUMN_DEFS, defaultVisibleColumns } from '@/dealCompsV1/lib/columns';
import { buildCsv, buildWorkbook, downloadCsv, downloadWorkbook } from '@/dealCompsV1/lib/export';
import { SummaryStatsTable } from '@/dealCompsV1/components/SummaryStatsTable';
import { ColumnPicker } from '@/dealCompsV1/components/ColumnPicker';
import { ResultsTable } from '@/dealCompsV1/components/ResultsTable';

export function DealCompsSection({ companyName }: { companyName: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => defaultVisibleColumns());
  const [showExportMenu, setShowExportMenu] = useState(false);

  // The Assess company isn't one of our presets, so we screen it against the default comp set.
  const transactions = useMemo(() => makeCustomCompany(companyName).transactions, [companyName]);
  const stats = useMemo(() => computeAllStats(transactions), [transactions]);
  const visibleCols = COLUMN_DEFS.filter((c) => visibleColumns.has(c.key));

  const generate = () => {
    setStatus('loading');
    setTimeout(() => setStatus('ready'), 900);
  };

  return (
    <section id="deal-comps" className="scroll-mt-24">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-indigo-600" />
        <h2 className="text-sm font-semibold text-gray-900">Deal Comps</h2>
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
          Precedent transactions
        </span>
      </div>

      {status !== 'ready' ? (
        <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Generate deal comps for {companyName}</h3>
            <p className="text-sm text-gray-500 mt-0.5 max-w-xl">
              Pull precedent transactions comparable to {companyName} and benchmark valuation multiples (EV/EBITDA,
              EV/Revenue) with export.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={status === 'loading'}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-70 transition-all active:scale-[0.97] flex-shrink-0"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate deal comps
              </>
            )}
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
          <SummaryStatsTable stats={stats} scope={transactions.length} />

          <div className="flex items-center justify-between">
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
                          downloadCsv('Deal_Comps.csv', buildCsv(transactions, visibleCols));
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-gray-500" /> Export to CSV
                      </button>
                      <button
                        onClick={() => {
                          downloadWorkbook('Deal_Comps.xlsx', buildWorkbook(transactions, visibleCols, stats));
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

          <div className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
            <ResultsTable transactions={transactions} visibleColumns={visibleColumns} />
          </div>
        </motion.div>
      )}
    </section>
  );
}
