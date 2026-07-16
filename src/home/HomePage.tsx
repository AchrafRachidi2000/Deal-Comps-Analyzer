import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Pencil,
  Plus,
  X,
  Search,
  ArrowRight,
  Radar,
  ScanSearch,
  LineChart,
  ShieldCheck,
  FileText,
  Upload,
  Scale,
  Sparkles,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ARTIFACTS = [
  { title: 'Sanara MedTech Company Radar', kind: 'Company Radar', icon: <Radar className="w-4 h-4" /> },
  { title: 'Sanara MedTech Pre-Diligence', kind: 'Run Pre-Diligence', icon: <ShieldCheck className="w-4 h-4" /> },
  { title: 'Medtech Market niche analysis', kind: 'Analyze Niche', icon: <LineChart className="w-4 h-4" /> },
];

const WORKFLOWS: { title: string; icon: React.ReactNode; assess?: boolean; items: { name: string; date: string }[] }[] = [
  {
    title: 'Target - Source & Screen',
    icon: <ScanSearch className="w-4 h-4" />,
    items: [
      { name: 'Electric Vehicles', date: 'Jul 15, 2026' },
      { name: 'AI fintech', date: 'Jul 15, 2026' },
      { name: 'Medtech Targets', date: 'Jul 1, 2026' },
      { name: 'Top Medtech Companies', date: 'Jul 1, 2026' },
    ],
  },
  {
    title: 'Assess - Company Radar',
    icon: <Radar className="w-4 h-4" />,
    assess: true,
    items: [
      { name: 'Sanara MedTech', date: 'Jul 3, 2026' },
      { name: 'Anthropic', date: 'Jul 2, 2026' },
      { name: 'SpaceX', date: 'Jul 2, 2026' },
      { name: 'Stripe', date: 'Jul 2, 2026' },
    ],
  },
  {
    title: 'Research - Markets & Niches',
    icon: <LineChart className="w-4 h-4" />,
    items: [{ name: 'Medtech Market', date: 'Jul 3, 2026' }],
  },
  {
    title: 'Validate - Pre-Diligence',
    icon: <ShieldCheck className="w-4 h-4" />,
    items: [{ name: 'Sanara MedTech', date: 'Jul 2, 2026' }],
  },
];

// Clickable examples for the modal search bar.
const SUGGESTED_COMPANIES = [
  'Sanara MedTech',
  'Medtronic',
  'Stryker',
  'Boston Scientific',
  'ResMed',
  'Dexcom',
  'Anthropic',
  'Stripe',
  'SpaceX',
  'Databricks',
];

export function HomePage({
  onLaunchAssess,
  onLaunchDealComps,
}: {
  onLaunchAssess: (company: string) => void;
  onLaunchDealComps: (company: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/60">
      {/* Top bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
        <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm font-semibold text-gray-900">Medtech</span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
          <Pencil className="w-3.5 h-3.5" /> Edit workspace
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Where do you want to push your deal today?</h1>
          <p className="text-gray-500 mt-2">
            Pick a workflow to analyze a market, build a universe, screen targets, or turn a deal into an IC-ready story.
          </p>

          {/* Recent artifacts */}
          <div className="mt-8">
            <div className="text-sm font-medium text-gray-500 mb-3">Recent artifacts</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ARTIFACTS.map((a) => (
                <div key={a.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-indigo-200 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">{a.icon}</div>
                  <div className="text-sm font-semibold text-gray-900">{a.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{a.kind}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent documents */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500">Recent documents</div>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Upload a document
            </button>
          </div>
          <div className="mt-3 max-w-xs">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex items-center gap-3">
              <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-900">Sanara_MedTech_Invest…</div>
                <div className="text-xs text-gray-500">Teaser</div>
              </div>
            </div>
          </div>

          {/* Recent workflows */}
          <div className="mt-8 text-sm font-medium text-gray-500 mb-3">Recent workflows</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {WORKFLOWS.map((w) => (
              <div
                key={w.title}
                className={cn('rounded-xl border p-3', w.assess ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 bg-gray-50/60')}
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    {w.icon}
                    {w.title}
                  </div>
                  <button
                    onClick={() => w.assess && setModalOpen(true)}
                    className={cn(
                      'p-1 rounded-md border',
                      w.assess
                        ? 'border-indigo-300 text-indigo-600 hover:bg-indigo-100'
                        : 'border-gray-300 text-gray-400 hover:bg-gray-100'
                    )}
                    title="New"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {w.items.map((it) => (
                    <button
                      key={it.name}
                      onClick={() => w.assess && onLaunchAssess(it.name)}
                      disabled={!w.assess}
                      className={cn(
                        'w-full text-left bg-white rounded-lg border border-gray-200 px-3 py-2.5 transition-colors',
                        w.assess ? 'hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer' : 'cursor-default'
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                        {w.assess && <Radar className="w-3.5 h-3.5 text-indigo-500" />}
                        {it.name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                        <Clock className="w-3 h-3" /> {it.date}
                      </div>
                    </button>
                  ))}
                </div>
                <button className="w-full text-center text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2 py-1">See all</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <WorkflowModal
          onClose={() => setModalOpen(false)}
          onLaunchAssess={(c) => {
            setModalOpen(false);
            onLaunchAssess(c);
          }}
          onLaunchDealComps={(c) => {
            setModalOpen(false);
            onLaunchDealComps(c);
          }}
        />
      )}
    </div>
  );
}

function WorkflowModal({
  onClose,
  onLaunchAssess,
  onLaunchDealComps,
}: {
  onClose: () => void;
  onLaunchAssess: (company: string) => void;
  onLaunchDealComps: (company: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const name = query.trim();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const matches =
    name === '' ? SUGGESTED_COMPANIES : SUGGESTED_COMPANIES.filter((c) => c.toLowerCase().includes(name.toLowerCase()));

  const start = () => {
    if (name) onLaunchAssess(name);
  };
  const startDealComps = () => {
    if (name) onLaunchDealComps(name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Assess — Company Radar</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">Generate a 360° evidence-backed view of an organization.</p>

        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700">Search for an organization *</label>
          <div className="relative mt-1.5" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && start()}
              placeholder="Select by company name or company URL…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {open && matches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white rounded-lg border border-gray-200 shadow-lg py-1 max-h-56 overflow-y-auto">
                {matches.map((c) => (
                  <button
                    key={c}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQuery(c);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-indigo-50 text-sm"
                  >
                    <span className="w-7 h-7 rounded-md bg-gray-900 text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                      {c.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-medium text-gray-800">{c}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={start}
            disabled={!name}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
          >
            <Sparkles className="w-4 h-4" /> Start
          </button>
        </div>

        {/* Deal Comps — small secondary sub-workflow */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={startDealComps}
            disabled={!name}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-gray-50"
          >
            <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
              <Scale className="w-3.5 h-3.5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Sub-workflow</span>
              <span className="block text-sm text-gray-600 truncate">
                Generate <span className="font-medium text-indigo-600">deal comps</span> for {name || 'this company'}
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
