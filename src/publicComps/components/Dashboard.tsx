import React, { useMemo, useState } from 'react';
import {
  Download,
  Settings2,
  FileSpreadsheet,
  Bookmark,
  CalendarClock,
  Users,
  ArrowLeft,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Peer } from '@/publicComps/data/mockData';
import { computeAllStats, formatMultiple } from '@/publicComps/lib/stats';
import { ParsedFilters, CustomConstraint } from '@/publicComps/lib/api';
import { SummaryStatsGrid } from './SummaryStatsGrid';
import { MultiplesTable } from './MultiplesTable';
import { InsightsPanel } from './InsightsPanel';
import { FilterBar } from './FilterBar';

interface DashboardProps {
  targetCompany: string;
  referenceDate: string;
  peers: Peer[];
  onTogglePeer: (ticker: string) => void;
  onSaveArtifact: () => void;
  insights?: string | null;
  insightsLoading?: boolean;
  insightsError?: string | null;
  onRegenerateInsights?: () => void;
  appliedFilters?: ParsedFilters;
  appliedCustomFilters?: CustomConstraint[];
  appliedDescription?: string;
  onRediscover?: (
    filters: ParsedFilters,
    customFilters: CustomConstraint[],
    description: string
  ) => void;
  isRediscovering?: boolean;
  rediscoverError?: string | null;
  onBackToLanding?: () => void;
}

export function PublicCompsDashboard({
  targetCompany,
  referenceDate,
  peers,
  onTogglePeer,
  onSaveArtifact,
  insights = null,
  insightsLoading = false,
  insightsError = null,
  onRegenerateInsights,
  appliedFilters,
  appliedCustomFilters = [],
  appliedDescription = '',
  onRediscover,
  isRediscovering = false,
  rediscoverError = null,
  onBackToLanding,
}: DashboardProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const stats = useMemo(() => computeAllStats(peers), [peers]);
  const includedCount = peers.filter((p) => p.status === 'Included').length;

  const handleExportToExcel = () => {
    const summaryRows = stats.map((s) => ({
      Multiple: s.label,
      Min: s.sampleSize > 0 ? s.min : null,
      P25: s.sampleSize > 0 ? s.p25 : null,
      Median: s.sampleSize > 0 ? s.median : null,
      Mean: s.sampleSize > 0 ? s.mean : null,
      P75: s.sampleSize > 0 ? s.p75 : null,
      Max: s.sampleSize > 0 ? s.max : null,
      'Sample Size': `${s.sampleSize} of ${s.totalPeers}`,
    }));

    const peerRows = peers.map((p) => ({
      Ticker: p.ticker,
      Company: p.companyName,
      Description: p.description,
      Country: p.country,
      Status: p.status,
      'Reference Date': p.referenceDate,
      'Fiscal Year End': p.fiscalYearEnd,
      'Market Cap ($M)': p.marketCap,
      'EV ($M)': p.enterpriseValue,
      'LTM Revenue ($M)': p.revenueLTM,
      'LTM EBITDA ($M)': p.ebitdaLTM,
      'EBITDA Margin (%)': p.ebitdaMargin,
      'Rev Growth YoY (%)': p.revenueGrowthYoY,
      'EV/Rev (LTM)': p.evRevenueLTM,
      'EV/EBITDA (LTM)': p.evEbitdaLTM,
      'P/E (LTM)': p.peLTM,
      'NTM Revenue ($M)': p.revenueNTM,
      'NTM EBITDA ($M)': p.ebitdaNTM,
      'NTM Rev Growth (%)': p.ntmRevenueGrowth,
      'EV/Rev (NTM)': p.evRevenueNTM,
      'EV/EBITDA (NTM)': p.evEbitdaNTM,
      'Net Debt / EBITDA (x)': p.netDebtToEbitda,
    }));

    const wb = XLSX.utils.book_new();

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 22 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Stats');

    const wsPeers = XLSX.utils.json_to_sheet(peerRows);
    wsPeers['!cols'] = Object.keys(peerRows[0] ?? {}).map((k) => ({
      wch: Math.min(Math.max(k.length + 2, 12), 50),
    }));
    XLSX.utils.book_append_sheet(wb, wsPeers, 'Peers');

    XLSX.writeFile(wb, `Public_Comps_${targetCompany.replace(/\s+/g, '_')}.xlsx`);
    setShowExportMenu(false);
  };

  const medianEvEbitda = stats.find((s) => s.multiple === 'evEbitdaLTM');
  const medianEvRevenue = stats.find((s) => s.multiple === 'evRevenueLTM');
  const medianPe = stats.find((s) => s.multiple === 'peLTM');

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50/50">
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                title="Back to setup — start a new analysis"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> New analysis
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">{targetCompany}</h1>
            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
              {peers.length} peers in universe
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100"
              title="Latest reported quarter across the peer set"
            >
              <CalendarClock className="w-3 h-3" />
              Latest reported: {referenceDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {appliedFilters && onRediscover && (
          <FilterBar
            filters={appliedFilters}
            customFilters={appliedCustomFilters}
            description={appliedDescription}
            onRediscover={onRediscover}
            isRediscovering={isRediscovering}
            error={rediscoverError}
          />
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <PeerCountCard value={includedCount} total={peers.length} />
          <KpiCard label="Median EV / Rev (LTM)" value={medianEvRevenue && medianEvRevenue.sampleSize > 0 ? formatMultiple(medianEvRevenue.median) : '—'} sublabel={medianEvRevenue ? `${medianEvRevenue.sampleSize} of ${medianEvRevenue.totalPeers}` : ''} />
          <KpiCard label="Median EV / EBITDA (LTM)" value={medianEvEbitda && medianEvEbitda.sampleSize > 0 ? formatMultiple(medianEvEbitda.median) : '—'} sublabel={medianEvEbitda ? `${medianEvEbitda.sampleSize} of ${medianEvEbitda.totalPeers}` : ''} />
          <KpiCard label="Median P / E (LTM)" value={medianPe && medianPe.sampleSize > 0 ? formatMultiple(medianPe.median) : '—'} sublabel={medianPe ? `${medianPe.sampleSize} of ${medianPe.totalPeers}` : ''} />
        </div>

        <SummaryStatsGrid stats={stats} />
      </div>

      <div className="px-6 pb-4 space-y-4">
        <div className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
          <MultiplesTable peers={peers} onTogglePeer={onTogglePeer} />
        </div>

        <InsightsPanel
          peers={peers}
          insights={insights}
          loading={insightsLoading}
          error={insightsError}
          onRegenerate={onRegenerateInsights}
        />

        <div className="flex justify-between items-center pt-1">
          <button
            onClick={onSaveArtifact}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm"
          >
            <Bookmark className="w-4 h-4" />
            Save as Artifact
          </button>

          <div className="flex gap-3 relative">
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
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
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900 tabular-nums">{value}</div>
      <div className="text-[10px] text-gray-400 mt-1">{sublabel}</div>
    </div>
  );
}

function PeerCountCard({ value, total }: { value: number; total: number }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50">
        <Users className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Peers Included</div>
        <div className="text-lg font-bold text-gray-900 leading-tight">
          {value}
          <span className="text-xs font-normal text-gray-500"> / {total}</span>
        </div>
        <div className="text-[10px] text-gray-400">Listed peers</div>
      </div>
    </div>
  );
}
