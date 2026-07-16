import React from 'react';
import { Scale, Sparkles, ArrowRight } from 'lucide-react';

export function DealCompsSection({ companyName, onGenerate }: { companyName: string; onGenerate: () => void }) {
  return (
    <section id="deal-comps" className="scroll-mt-24">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-indigo-600" />
        <h2 className="text-sm font-semibold text-gray-900">Deal Comps</h2>
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
          Precedent transactions
        </span>
      </div>

      <button
        onClick={onGenerate}
        className="w-full text-left rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-indigo-50/70 hover:border-indigo-300 transition-colors group"
      >
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">Generate deal comps for {companyName}</h3>
          <p className="text-sm text-gray-500 mt-0.5 max-w-xl">
            Open the deal-comps workflow to validate the screening filters and benchmark {companyName} against comparable
            precedent transactions (EV/EBITDA, EV/Revenue).
          </p>
        </div>
        <span className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm flex items-center gap-2 flex-shrink-0 group-hover:bg-indigo-700 transition-colors">
          <Sparkles className="w-4 h-4" /> Generate deal comps <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </section>
  );
}
