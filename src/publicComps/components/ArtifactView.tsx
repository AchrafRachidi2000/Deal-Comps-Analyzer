import React from 'react';
import { ArrowLeft, Calendar, Hash, CalendarClock } from 'lucide-react';
import { Peer } from '@/publicComps/data/mockData';
import { computeAllStats, formatMultiple, formatPercent, formatNumber, formatMoney } from '@/publicComps/lib/stats';
import { SummaryStatsGrid } from './SummaryStatsGrid';
import { InsightsPanel } from './InsightsPanel';
import { cn } from '@/lib/utils';

export interface PublicCompsArtifact {
  id: string;
  name: string;
  date: string;
  targetCompany: string;
  referenceDate: string;
  peers: Peer[];
}

interface ArtifactViewProps {
  artifact: PublicCompsArtifact;
  onBack: () => void;
}

export function PublicCompsArtifactView({ artifact, onBack }: ArtifactViewProps) {
  const stats = computeAllStats(artifact.peers);
  const includedPeers = artifact.peers.filter((p) => p.status === 'Included');

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50/50">
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{artifact.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Saved {artifact.date}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" /> {includedPeers.length} peers
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock className="w-3 h-3" /> Latest reported: {artifact.referenceDate}
              </span>
            </div>
          </div>
        </div>

        <SummaryStatsGrid stats={stats} />

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Peer Snapshot</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[1600px]">
              <thead className="bg-gray-50">
                <tr>
                  <Th align="left">Ticker</Th>
                  <Th align="left">Company</Th>
                  <Th align="right">EV ($M)</Th>
                  <Th align="right">LTM Rev</Th>
                  <Th align="right">LTM EBITDA</Th>
                  <Th align="right">EBITDA Margin</Th>
                  <Th align="right">Rev Growth YoY</Th>
                  <Th align="right">EV / Rev (LTM)</Th>
                  <Th align="right">EV / EBITDA (LTM)</Th>
                  <Th align="right">P / E (LTM)</Th>
                  <Th align="right" tinted>NTM Rev Growth</Th>
                  <Th align="right" tinted>EV / Rev (NTM)</Th>
                  <Th align="right" tinted>EV / EBITDA (NTM)</Th>
                  <Th align="right">Net Debt / EBITDA</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {includedPeers.map((p) => (
                  <tr key={p.ticker} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs font-semibold text-gray-900">{p.ticker}</td>
                    <td className="p-3 text-sm text-gray-800">{p.companyName}</td>
                    <Td>{formatMoney(p.enterpriseValue)}</Td>
                    <Td>{formatMoney(p.revenueLTM)}</Td>
                    <Td>{formatMoney(p.ebitdaLTM)}</Td>
                    <Td>{formatPercent(p.ebitdaMargin)}</Td>
                    <Td>{formatPercent(p.revenueGrowthYoY)}</Td>
                    <Td>{formatMultiple(p.evRevenueLTM)}</Td>
                    <Td>{formatMultiple(p.evEbitdaLTM)}</Td>
                    <Td>{formatMultiple(p.peLTM)}</Td>
                    <Td tinted>{formatPercent(p.ntmRevenueGrowth)}</Td>
                    <Td tinted>{formatMultiple(p.evRevenueNTM)}</Td>
                    <Td tinted>{formatMultiple(p.evEbitdaNTM)}</Td>
                    <Td>{p.netDebtToEbitda !== null ? `${formatNumber(p.netDebtToEbitda)}x` : '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <InsightsPanel peers={artifact.peers} />
      </div>
    </div>
  );
}

function Th({ children, align, tinted }: { children: React.ReactNode; align: 'left' | 'right'; tinted?: boolean }) {
  return (
    <th
      className={cn(
        'p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200',
        align === 'left' ? 'text-left' : 'text-right',
        tinted && 'bg-indigo-50/30'
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, tinted }: { children: React.ReactNode; tinted?: boolean }) {
  return (
    <td className={cn('p-3 text-right tabular-nums text-sm text-gray-800', tinted && 'bg-indigo-50/20')}>
      {children}
    </td>
  );
}
