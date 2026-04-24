import React from 'react';
import { CheckCircle2, AlertTriangle, ClipboardList } from 'lucide-react';
import { DEAL_OVERVIEW, DEAL_IMPLICATIONS } from '@/dealComps/data/mockData';
import { cn } from '@/lib/utils';

interface DealImplicationsProps {
  transactionCount: number;
  onOpenClaimsEvidence: () => void;
}

export function DealImplications({ transactionCount, onOpenClaimsEvidence }: DealImplicationsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Deal Implications</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Key insights derived from {transactionCount} selected transactions
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Implied Ticket Size
          </div>
          <div className="text-xl font-bold text-gray-900">{DEAL_OVERVIEW.impliedTicketSize}</div>
          <div className="text-xs text-gray-500 mt-1">{DEAL_OVERVIEW.ticketSizeDescription}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Entry Multiple Range
          </div>
          <div className="text-xl font-bold text-gray-900">{DEAL_OVERVIEW.entryMultipleRange}</div>
          <div className="text-xs text-gray-500 mt-1">{DEAL_OVERVIEW.multipleDescription}</div>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="space-y-3">
        {DEAL_IMPLICATIONS.map((implication) => (
          <div
            key={implication.id}
            className={cn(
              "flex items-start gap-3 rounded-lg p-4 border",
              implication.type === 'opportunity'
                ? "bg-green-50/60 border-green-100"
                : "bg-amber-50/60 border-amber-100"
            )}
          >
            {implication.type === 'opportunity' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-gray-900 text-sm">{implication.title}</div>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{implication.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Claims & Evidence Button */}
      <div className="pt-1">
        <button
          onClick={onOpenClaimsEvidence}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          Claims & Evidence
        </button>
      </div>
    </div>
  );
}
