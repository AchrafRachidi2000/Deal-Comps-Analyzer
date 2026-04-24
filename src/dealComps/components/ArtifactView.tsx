import React from 'react';
import { ArrowLeft, Calendar, Hash } from 'lucide-react';
import { Transaction } from '@/dealComps/data/mockData';
import { cn } from '@/lib/utils';

export interface Artifact {
  id: string;
  name: string;
  date: string;
  transactions: Transaction[];
}

interface ArtifactViewProps {
  artifact: Artifact;
  onBack: () => void;
}

export function ArtifactView({ artifact, onBack }: ArtifactViewProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="px-6 py-4 space-y-4">
        {/* Back + Title */}
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
                <Hash className="w-3 h-3" /> {artifact.transactions.length} transactions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Read-only Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white flex flex-col">
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse min-w-[1600px]">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[300px]">Target</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[100px]">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">Deal Size</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">EV ($M)</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">LTM Rev ($M)</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">LTM EBITDA ($M)</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[100px]">TEV / Rev</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[100px]">TEV / EBITDA</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[200px]">Buyer</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[150px]">Location</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-[300px]">Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {artifact.transactions.map((tx) => (
                  <ArtifactRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtifactRow({ tx }: { tx: Transaction; key?: string }) {
  const isExcluded = tx.status === 'Excluded';

  return (
    <tr className={cn("hover:bg-gray-50 transition-colors", isExcluded && "bg-gray-50/50")}>
      <td className="p-4 align-top">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded flex items-center justify-center text-xs font-bold flex-shrink-0",
            isExcluded ? "bg-gray-200 text-gray-500 opacity-50" : "bg-gray-900 text-white"
          )}>
            {tx.targetCompany.substring(0, 2).toUpperCase()}
          </div>
          <div className={cn(isExcluded && "opacity-50")}>
            <div className="font-semibold text-gray-900">{tx.targetCompany}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-[200px]">{tx.targetDescription}</div>
          </div>
        </div>
      </td>
      <td className="p-4 align-top">
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          isExcluded ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
        )}>
          {tx.status}
        </span>
      </td>
      <td className="p-4 align-top whitespace-nowrap">
        {tx.dealSize !== null ? (
          <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.dealSize}M</span>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="p-4 align-top whitespace-nowrap">
        {tx.enterpriseValue !== null ? (
          <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.enterpriseValue}M</span>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="p-4 align-top whitespace-nowrap">
        {tx.revenue !== null ? (
          <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.revenue}M</span>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="p-4 align-top whitespace-nowrap">
        {tx.ebitda !== null ? (
          <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.ebitda}M</span>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="p-4 align-top">
        {tx.evRevenueMultiple !== null && tx.evRevenueMultiple > 0 ? (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            isExcluded ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-800"
          )}>
            {tx.evRevenueMultiple}x
          </span>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="p-4 align-top">
        {tx.evEbitdaMultiple !== null && tx.evEbitdaMultiple > 0 ? (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            isExcluded ? "bg-gray-100 text-gray-500" : "bg-indigo-100 text-indigo-800"
          )}>
            {tx.evEbitdaMultiple}x
          </span>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="p-4 align-top">
        <div className={cn("space-y-1", isExcluded && "opacity-50")}>
          <div className="font-medium text-gray-900">{tx.buyer}</div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            {tx.buyerType}
          </span>
        </div>
      </td>
      <td className="p-4 align-top">
        <div className={cn("flex items-center gap-2", isExcluded && "opacity-50")}>
          <img
            src={`https://flagcdn.com/w20/${tx.countryCode.toLowerCase()}.png`}
            alt={tx.countryCode}
            className="w-5 h-auto rounded-sm shadow-sm"
          />
          <span className="text-sm text-gray-700">{tx.location}</span>
        </div>
      </td>
      <td className="p-4 align-top">
        <div className={cn("text-sm text-gray-600 leading-relaxed", isExcluded && "text-gray-400")}>
          {tx.reasoning}
        </div>
      </td>
    </tr>
  );
}
