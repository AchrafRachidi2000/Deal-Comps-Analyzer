import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Info, Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const AVAILABLE_FILTERS: { key: string; label: string; defaultValue: string }[] = [
  { key: 'sector', label: 'Sector', defaultValue: 'Medical Devices, Diagnostics' },
  { key: 'buyerType', label: 'Buyer Type', defaultValue: 'Strategic, Financial' },
  { key: 'dealSize', label: 'Deal Size', defaultValue: '> $50M' },
  { key: 'evRange', label: 'Enterprise Value', defaultValue: '$100M – $2B' },
  { key: 'geography', label: 'Geography', defaultValue: 'North America, Europe' },
  { key: 'announcementDate', label: 'Date Range', defaultValue: 'Last 5 years' },
  { key: 'revenueRange', label: 'Revenue', defaultValue: '$10M – $500M' },
  { key: 'ebitdaRange', label: 'EBITDA', defaultValue: '$5M – $100M' },
  { key: 'employeeRange', label: 'Employees', defaultValue: '50 – 2,000' },
  { key: 'evEbitdaMultiple', label: 'EV / EBITDA Multiple', defaultValue: '8x – 20x' },
  { key: 'evRevenueMultiple', label: 'EV / Revenue Multiple', defaultValue: '2x – 10x' },
  { key: 'status', label: 'Status', defaultValue: 'Included, Excluded' },
];

interface WorkflowSetupProps {
  onClose: () => void;
  onStart: () => void;
}

export function WorkflowSetup({ onClose, onStart }: WorkflowSetupProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [targetCompany, setTargetCompany] = useState('NovaPulse Medical');
  
  // Fake state for generated filters
  const [hardFilters, setHardFilters] = useState<Record<string, string>>({
    sector: 'Medical Devices, Diagnostics',
    buyerType: 'Strategic, Financial',
    dealSize: '> $50M',
    evRange: '$100M – $2B',
    geography: 'North America, Europe',
    announcementDate: 'Last 5 years',
    revenueRange: '$10M – $500M',
    ebitdaRange: '$5M – $100M',
  });
  const [showAddFilter, setShowAddFilter] = useState(false);
  const addFilterRef = useRef<HTMLDivElement>(null);

  // Close add-filter dropdown on outside click
  useEffect(() => {
    if (!showAddFilter) return;
    const handler = (e: MouseEvent) => {
      if (addFilterRef.current && !addFilterRef.current.contains(e.target as Node)) {
        setShowAddFilter(false);
      }
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler); };
  }, [showAddFilter]);
  
  const [softFilters, setSoftFilters] = useState({
    companyBrief: 'Companies specializing in non-invasive respiratory monitoring hardware and software for ICU and home-care settings.',
    transactionBrief: 'Strategic acquisitions of high-growth medtech companies with proprietary sensor technology or AI-driven diagnostics.'
  });

  const handleNext = () => {
    if (step === 1) {
      setIsLoading(true);
      // Simulate AI generation
      setTimeout(() => {
        setIsLoading(false);
        setStep(2);
      }, 1500);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-indigo-100 p-1.5 rounded-lg">
                <Search className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Precedent Transactions Analysis</h2>
            </div>
            <p className="text-gray-500 text-sm">Automated deal comps workflow</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1 flex-shrink-0">
          <div 
            className="bg-indigo-600 h-1 transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">1. Select Target & Source</h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Target Company / Sector</label>
                    <input 
                      type="text" 
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="e.g. Project Alpha"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Upload Source Documents</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">CIM, Teasers, Management Presentations (PDF, PPTX)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Recent Uploads</label>
                    <div className="space-y-2">
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <FileText className="w-5 h-5 text-red-500 mr-3" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">NovaPulse_CIM_Final.pdf</div>
                          <div className="text-xs text-gray-500">2.4 MB • Uploaded 2 hours ago</div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">2. Generated Filters</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      AI Generated
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                      Hard Filters
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(hardFilters).map(([key, value]) => {
                        const def = AVAILABLE_FILTERS.find(f => f.key === key);
                        return (
                          <div key={key} className="space-y-1 group">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-gray-500 uppercase tracking-wide">{def?.label ?? key}</label>
                              <button
                                onClick={() => {
                                  const next = { ...hardFilters };
                                  delete next[key];
                                  setHardFilters(next);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5"
                                title="Remove filter"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setHardFilters({ ...hardFilters, [key]: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Add filter button */}
                    {AVAILABLE_FILTERS.filter(f => !(f.key in hardFilters)).length > 0 && (
                      <div className="relative" ref={addFilterRef}>
                        <button
                          onClick={() => setShowAddFilter(!showAddFilter)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-dashed border-gray-300 rounded-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add filter
                        </button>
                        {showAddFilter && (
                          <div className="absolute top-full left-0 mt-1.5 z-50 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] py-1 max-h-[200px] overflow-y-auto">
                            {AVAILABLE_FILTERS.filter(f => !(f.key in hardFilters)).map((f) => (
                              <button
                                key={f.key}
                                onClick={() => {
                                  setHardFilters({ ...hardFilters, [f.key]: f.defaultValue });
                                  setShowAddFilter(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                      Soft Filters (Context)
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wide">Company Brief</label>
                        <textarea 
                          value={softFilters.companyBrief}
                          onChange={(e) => setSoftFilters({...softFilters, companyBrief: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wide">Transaction Brief</label>
                        <textarea 
                          value={softFilters.transactionBrief}
                          onChange={(e) => setSoftFilters({...softFilters, transactionBrief: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">3. Validation Summary</h3>
                  
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3">
                    <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-indigo-800">
                      The system will search for precedent transactions matching these criteria. You can refine these filters later in the dashboard.
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    <div className="p-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Target</span>
                      <span className="text-sm font-medium text-gray-900">{targetCompany}</span>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Source</span>
                      <span className="text-sm font-medium text-gray-900">NovaPulse_CIM_Final.pdf</span>
                    </div>
                    <div className="p-4">
                      <span className="text-sm text-gray-500 block mb-2">Hard Filters</span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(hardFilters).map(([key, value]) => (
                          <span key={key} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-sm text-gray-500 block mb-2">Context</span>
                      <p className="text-sm text-gray-700 line-clamp-2 italic">
                        "{softFilters.companyBrief}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  step >= i ? "bg-indigo-600" : "bg-gray-300"
                )} 
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                onClick={handleNext}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px] justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={onStart}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2"
              >
                Run Analysis <PlayIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
