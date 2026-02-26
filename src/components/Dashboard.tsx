import React, { useState } from 'react';
import { 
  Filter, 
  MapPin, 
  Briefcase, 
  ChevronDown, 
  Download, 
  Settings2,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { STATISTICS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ResultsTable } from './ResultsTable';

export function Dashboard() {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportToExcel = () => {
    console.log("Exporting to Excel...");
    setShowExportMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      {/* Top Filter / Stats Bar */}
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Respiratory Monitoring Devices</h1>
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
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Hard Filters</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  Deal Size: &gt; $50M
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  Geo: North America, Europe
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  Type: M&A, Buyout
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  Recency: Last 5 years
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-[300px] border-l border-gray-100 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Soft Filters (Context)</span>
              </div>
              <p className="text-sm text-gray-600 italic line-clamp-2">
                "Companies specializing in non-invasive respiratory monitoring hardware and software for ICU and home-care settings..."
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
              Keywords <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <div className="h-6 w-px bg-gray-300 mx-1 flex-shrink-0" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-transparent rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-200 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add filters
            </button>
          </div>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Mean EV/EBITDA" value="12.8x" subtext="Across selected" />
          <StatCard label="Median EV/EBITDA" value="13.2x" subtext="Across selected" />
          <StatCard label="Min / Max" value="8.9x - 15.0x" subtext="Range" />
          <StatCard label="Excluded" value={`${STATISTICS.filteredOutHard + STATISTICS.filteredOutSoft}`} subtext="Due to filters" warning />
        </div>
      </div>

      {/* Main Content Area - Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white flex flex-col">
          <ResultsTable />
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
    </div>
  );
}

function StatCard({ label, value, subtext, warning }: { label: string, value: string, subtext: string, warning?: boolean }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className={cn("text-xl font-bold", warning ? "text-amber-600" : "text-gray-900")}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-1">{subtext}</div>
    </div>
  );
}
