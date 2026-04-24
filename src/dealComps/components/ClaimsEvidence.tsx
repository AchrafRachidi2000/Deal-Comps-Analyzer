import React from 'react';
import { X, Info, FileText } from 'lucide-react';
import { DEAL_IMPLICATIONS } from '@/dealComps/data/mockData';

interface ClaimsEvidenceProps {
  isOpen: boolean;
  onClose: () => void;
}

const REASONING_TEXT = `The deal implications are derived from an analysis of 15 comparable M&A transactions spanning 2024–2025, filtered by enterprise value ($65M–$2.2B), sector alignment (respiratory monitoring devices, connected care platforms, and adjacent verticals), and buyer profile (PE sponsors and strategic acquirers). Of the 15 transactions screened, 9 were included based on data completeness and relevance to the fund's mid-market PE mandate ($100M–$400M equity check, 11–15x entry EV/EBITDA target). Valuation multiples were benchmarked against median, interquartile, and outlier ranges to establish defensible entry pricing for the fund's Investment Committee. Opportunity signals were identified by mapping underserved segments where financial sponsors face limited competition from strategics. Risk factors were stress-tested against the fund's underwriting assumptions — including reimbursement sensitivity, regulatory timeline risk, and exit multiple compression for hardware-heavy portfolios without recurring revenue.`;

export function ClaimsEvidence({ isOpen, onClose }: ClaimsEvidenceProps) {
  if (!isOpen) return null;

  const allClaims = DEAL_IMPLICATIONS.flatMap((impl) =>
    impl.claims.map((claim) => ({
      ...claim,
      type: impl.type,
    }))
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Centered Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh]">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] max-h-[88vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">Claims & Evidence</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mt-1 -mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-7">
            {/* Reasoning Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900">Reasoning</span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <p className="text-[13px] text-gray-500 leading-[1.7]">
                {REASONING_TEXT}
              </p>
            </div>

            {/* Claims Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900">Claims</span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {allClaims.map((claim, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg pl-4 border-l-[3px] border-l-gray-300"
                  >
                    <div className="px-4 pt-4 pb-3">
                      <p className="text-[13.5px] text-gray-800 leading-[1.65]">
                        {claim.claim}
                      </p>
                    </div>
                    <div className="px-4 pb-3.5 flex flex-wrap gap-x-4 gap-y-2">
                      {claim.sources.map((source, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-500"
                        >
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span>{source.name}, {source.year}</span>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${source.verified ? 'bg-green-500' : 'bg-amber-400'}`} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
