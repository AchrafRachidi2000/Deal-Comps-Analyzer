import React, { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, RotateCcw, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DealCompFilters, PresetCompany } from '@/dealCompsV1/data/types';
import { filterTransactions } from '@/dealCompsV1/lib/filtering';
import { computeAllStats } from '@/dealCompsV1/lib/stats';
import { COLUMN_DEFS } from '@/dealCompsV1/lib/columns';
import { buildCsv, buildWorkbook, downloadCsv, downloadWorkbook } from '@/dealCompsV1/lib/export';
import { StatsGrid } from './StatsGrid';
import { FilterBar } from './FilterBar';
import { ColumnPicker } from './ColumnPicker';
import { ResultsTable } from './ResultsTable';

interface DashboardProps {
  company: PresetCompany;
  filters: DealCompFilters;
  committedFilters: DealCompFilters;
  onFiltersChange: (f: DealCompFilters) => void;
  onRegenerate: () => void;
  onReset: () => void;
  visibleColumns: Set<string>;
  onVisibleColumnsChange: (v: Set<string>) => void;
}

export function Dashboard({
  company,
  filters,
  committedFilters,
  onFiltersChange,
  onRegenerate,
  onReset,
  visibleColumns,
  onVisibleColumnsChange,
}: DashboardProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const transactions = company.transactions;
  const filteredRows = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const stats = useMemo(() => computeAllStats(filteredRows), [filteredRows]);

  const dirty = JSON.stringify(filters) !== JSON.stringify(committedFilters);
  const visibleCols = COLUMN_DEFS.filter((c) => visibleColumns.has(c.key));

  const handleExportCsv = () => {
    downloadCsv('Deal_Comps_V1.csv', buildCsv(filteredRows, visibleCols));
    setShowExportMenu(false);
  };
  const handleExportExcel = () => {
    downloadWorkbook('Deal_Comps_V1.xlsx', buildWorkbook(filteredRows, visibleCols, stats));
    setShowExportMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50/50">
      <div className="px-6 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-indigo-600 uppercase">Precedent Transactions · V1</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{company.name}</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">{company.description}</p>
          </div>
          <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-full shadow-sm flex-shrink-0 whitespace-nowrap">
            {filteredRows.length} of {transactions.length} comps
          </span>
        </div>

        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Filters */}
        <FilterBar filters={filters} onChange={onFiltersChange} />

        {/* Regenerate / reset (shown when filters changed since the last run) */}
        <AnimatePresence>
          {dirty && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50"
            >
              <span className="text-sm text-indigo-900">Filters changed since the last run.</span>
              <div className="flex gap-2">
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all active:scale-[0.97]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-[0.97]"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <ColumnPicker visible={visibleColumns} onChange={onVisibleColumnsChange} />
          <div className="relative">
            <AnimatePresence>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.13, ease: 'easeOut' }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute top-full right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20"
                  >
                    <button
                      onClick={handleExportCsv}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-gray-500" /> Export to CSV
                    </button>
                    <button
                      onClick={handleExportExcel}
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
          <ResultsTable transactions={filteredRows} visibleColumns={visibleColumns} />
        </div>
      </div>
    </div>
  );
}
