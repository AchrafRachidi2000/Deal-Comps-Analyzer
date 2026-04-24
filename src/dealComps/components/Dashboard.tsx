import React, { useState, useMemo } from 'react';
import {
  Download,
  Settings2,
  Plus,
  FileSpreadsheet,
  Bookmark
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { STATISTICS, MOCK_TRANSACTIONS, Transaction } from '@/dealComps/data/mockData';
import { cn } from '@/lib/utils';
import { ResultsTable } from './ResultsTable';
import { DealImplications } from './DealImplications';
import { ClaimsEvidence } from './ClaimsEvidence';
import { FilterBar } from './FilterBar';

interface DashboardProps {
  onSaveArtifact?: () => void;
}

export function Dashboard({ onSaveArtifact }: DashboardProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showClaimsEvidence, setShowClaimsEvidence] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  // Track which IDs were originally excluded (have incomplete data)
  const [originallyExcluded] = useState<Set<string>>(
    () => new Set(MOCK_TRANSACTIONS.filter(tx => tx.status === 'Excluded').map(tx => tx.id))
  );

  const toggleStatus = (id: string) => {
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === id
          ? { ...tx, status: tx.status === 'Included' ? 'Excluded' : 'Included' as const }
          : tx
      )
    );
  };

  // Compute KPIs from included transactions only
  const stats = useMemo(() => {
    const included = transactions.filter(tx => tx.status === 'Included');
    const multiples = included
      .map(tx => tx.evEbitdaMultiple)
      .filter((m): m is number => m !== null && m > 0);

    const count = included.length;

    if (multiples.length === 0) {
      return { mean: '—', median: '—', min: '—', max: '—', count };
    }

    const mean = (multiples.reduce((a, b) => a + b, 0) / multiples.length).toFixed(1);
    const sorted = [...multiples].sort((a, b) => a - b);
    const median = sorted.length % 2 === 1
      ? sorted[Math.floor(sorted.length / 2)].toFixed(1)
      : ((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2).toFixed(1);
    const min = sorted[0].toFixed(1);
    const max = sorted[sorted.length - 1].toFixed(1);

    return { mean, median, min, max, count };
  }, [transactions]);

  const handleExportToExcel = () => {
    const rows = transactions.map(tx => ({
      'Status': tx.status,
      'Target Company': tx.targetCompany,
      'Description': tx.targetDescription,
      'Deal Date': tx.dealDate,
      'Buyer': tx.buyer,
      'Buyer Type': tx.buyerType,
      'Advisor': tx.advisor,
      'Deal Size ($M)': tx.dealSize,
      'Currency': tx.currency,
      'EV ($M)': tx.enterpriseValue,
      'LTM Revenue ($M)': tx.revenue,
      'LTM EBITDA ($M)': tx.ebitda,
      'TEV / Revenue': tx.evRevenueMultiple,
      'TEV / EBITDA': tx.evEbitdaMultiple,
      'Location': tx.location,
      'Similarity Score': tx.similarityScore,
      'Reasoning': tx.reasoning,
      'Multiple Comment': tx.multipleComment,
      'Exclusion Reason': tx.exclusionReason ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-size columns based on header + content width
    const colWidths = Object.keys(rows[0]).map(key => {
      const maxLen = Math.max(
        key.length,
        ...rows.map(r => String(r[key as keyof typeof r] ?? '').length)
      );
      return { wch: Math.min(maxLen + 2, 50) };
    });
    ws['!cols'] = colWidths;

    // Summary sheet with KPIs
    const summaryRows = [
      { 'Metric': 'Mean EV/EBITDA', 'Value': `${stats.mean}x` },
      { 'Metric': 'Median EV/EBITDA', 'Value': `${stats.median}x` },
      { 'Metric': 'Min EV/EBITDA', 'Value': `${stats.min}x` },
      { 'Metric': 'Max EV/EBITDA', 'Value': `${stats.max}x` },
      { 'Metric': 'Included Transactions', 'Value': String(stats.count) },
      { 'Metric': 'Total Transactions', 'Value': String(transactions.length) },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    XLSX.writeFile(wb, 'Deal_Comps_Export.xlsx');
    setShowExportMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50/50">
      {/* Top Filter / Stats Bar */}
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">NovaPulse Medical</h1>
            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
              {STATISTICS.totalConsidered} Results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Summary Card */}
        <FilterBar />

        {/* Stats Summary Row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Mean EV/EBITDA" value={`${stats.mean}x`} subtext={`Across ${stats.count} included`} />
          <StatCard label="Median EV/EBITDA" value={`${stats.median}x`} subtext={`Across ${stats.count} included`} />
          <StatCard label="Min / Max" value={`${stats.min}x – ${stats.max}x`} subtext="Range" />
        </div>
      </div>

      {/* Main Content Area - Table */}
      <div className="px-6 pb-4">
        <div className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
          <ResultsTable
            transactions={transactions}
            originallyExcluded={originallyExcluded}
            onToggleStatus={toggleStatus}
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-700">
            <Plus className="w-4 h-4" /> Add to screening list
          </button>
          <div className="flex gap-3 relative">
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={handleExportToExcel}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Export to Excel
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 shadow-sm flex items-center gap-2">
              Run search
            </button>
          </div>
        </div>
      </div>

      {/* Deal Implications */}
      <div className="px-6 pb-4 space-y-4">
        <DealImplications
          transactionCount={stats.count}
          onOpenClaimsEvidence={() => setShowClaimsEvidence(true)}
        />

        {/* Save as Artifact */}
        {onSaveArtifact && (
          <button
            onClick={onSaveArtifact}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm w-fit"
          >
            <Bookmark className="w-4 h-4" />
            Save as Artifact
          </button>
        )}
      </div>

      {/* Claims & Evidence Panel */}
      <ClaimsEvidence isOpen={showClaimsEvidence} onClose={() => setShowClaimsEvidence(false)} />
    </div>
  );
}

function StatCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-[10px] text-gray-400 mt-1">{subtext}</div>
    </div>
  );
}
