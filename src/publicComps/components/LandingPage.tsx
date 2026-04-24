import React, { useState } from 'react';
import {
  LineChart,
  Info,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  MinusCircle,
  PlusCircle,
  AlertTriangle,
  Search,
  Wand2,
  Building2,
  Plus,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  discoverPeers,
  parseQuery,
  enrichCompany,
  DiscoveredPeer,
  DiscoveryFilters,
  ParsedFilters,
  CustomConstraint,
} from '@/publicComps/lib/api';

type Mode = 'quick' | 'query';

interface LandingPageProps {
  onRunAnalysis: (args: {
    targetCompany: string;
    discovered: DiscoveredPeer[];
    selectedTickers: Set<string>;
    filters: ParsedFilters;
    customFilters: CustomConstraint[];
    description: string;
  }) => void;
  isRunning?: boolean;
}

const EMPTY_FILTERS: ParsedFilters = {
  company: null,
  sector: null,
  geography: null,
  marketCap: null,
  revenue: null,
  qualitative: null,
};

export function PublicCompsLandingPage({ onRunAnalysis, isRunning = false }: LandingPageProps) {
  const [mode, setMode] = useState<Mode>('quick');

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 px-6 py-8 overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col max-h-full overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-indigo-100 p-1.5 rounded-lg">
              <LineChart className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Public Comps Analysis</h2>
          </div>
          <p className="text-gray-500 text-sm">Trading comps workflow — peer set, multiples, benchmarking</p>
        </div>

        <div className="flex border-b border-gray-100 bg-gray-50/40 px-3 pt-3 flex-shrink-0">
          <ModeTab
            active={mode === 'quick'}
            icon={<Building2 className="w-4 h-4" />}
            label="By Company"
            sublabel="Enter a target — we research and infer the peer set"
            onClick={() => setMode('quick')}
          />
          <ModeTab
            active={mode === 'query'}
            icon={<Wand2 className="w-4 h-4" />}
            label="By Query"
            sublabel="Describe a sector + constraints"
            onClick={() => setMode('query')}
          />
        </div>

        {mode === 'quick' ? (
          <QuickWizard onRunAnalysis={onRunAnalysis} isRunning={isRunning} />
        ) : (
          <QueryWizard onRunAnalysis={onRunAnalysis} isRunning={isRunning} />
        )}
      </div>
    </div>
  );
}

function ModeTab({
  active,
  icon,
  label,
  sublabel,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 px-4 py-3 text-left rounded-t-md border-b-2 -mb-px transition-colors',
        active
          ? 'border-indigo-600 bg-white'
          : 'border-transparent text-gray-500 hover:bg-white/60 hover:text-gray-700'
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className={active ? 'text-indigo-600' : 'text-gray-400'}>{icon}</span>
        <span className={active ? 'text-gray-900' : ''}>{label}</span>
      </div>
      <div className="text-[11px] text-gray-500 mt-0.5">{sublabel}</div>
    </button>
  );
}

/* ============ PATH 1: QUICK (BY COMPANY) ============ */

function QuickWizard({ onRunAnalysis, isRunning }: LandingPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [company, setCompany] = useState('Alpha10x');
  const [description, setDescription] = useState<string>('');
  const [filters, setFilters] = useState<ParsedFilters>(EMPTY_FILTERS);
  const [customFilters, setCustomFilters] = useState<CustomConstraint[]>([]);

  const [discovered, setDiscovered] = useState<DiscoveredPeer[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<Set<string>>(new Set());

  const [researching, setResearching] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!company.trim()) return;
    setResearching(true);
    setError(null);
    try {
      const enriched = await enrichCompany(company.trim());
      setDescription(enriched.description);
      setFilters({ ...enriched.filters, company: enriched.filters.company ?? company.trim() });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setResearching(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError(null);
    try {
      const dFilters: DiscoveryFilters = {
        sector: filters.sector ?? undefined,
        geography: filters.geography ?? undefined,
        marketCap: filters.marketCap ?? undefined,
        revenue: filters.revenue ?? undefined,
        qualitative: filters.qualitative ?? description ?? undefined,
        customConstraints: customFilters,
      };
      const peers = await discoverPeers(filters.company ?? company, dFilters);
      if (peers.length === 0) {
        setError('No peers discovered. Try loosening the filters.');
        return;
      }
      setDiscovered(peers);
      setSelectedTickers(new Set(peers.map((p) => p.ticker)));
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed');
    } finally {
      setDiscovering(false);
    }
  };

  const togglePeer = (ticker: string) =>
    setSelectedTickers((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });

  const handleRun = () => {
    onRunAnalysis({
      targetCompany: filters.company ?? company,
      discovered,
      selectedTickers,
      filters,
      customFilters,
      description,
    });
  };

  return (
    <WizardShell
      step={step}
      totalSteps={3}
      footer={
        <WizardFooter
          step={step}
          totalSteps={3}
          onBack={() => setStep(((step - 1) || 1) as 1 | 2 | 3)}
          backDisabled={researching || discovering || isRunning}
          primary={
            step === 1
              ? {
                  label: researching ? 'Researching company…' : 'Research company',
                  busy: researching,
                  disabled: !company.trim(),
                  onClick: handleResearch,
                }
              : step === 2
              ? {
                  label: discovering ? 'Discovering peers…' : 'Discover peers',
                  busy: discovering,
                  disabled: false,
                  onClick: handleDiscover,
                }
              : {
                  label: isRunning ? 'Fetching live data…' : 'Run Analysis',
                  busy: isRunning,
                  disabled: selectedTickers.size === 0,
                  onClick: handleRun,
                  icon: <Search className="w-4 h-4" />,
                }
          }
        />
      }
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepShell key="quick-1">
            <h3 className="text-lg font-medium text-gray-900">1. Target company</h3>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wide text-gray-500">Company name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !researching) handleResearch();
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="e.g. Alpha10x, ResMed, Stripe"
                autoFocus
              />
            </div>
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-4 flex gap-3">
              <Wand2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-900 leading-relaxed">
                <div className="font-medium mb-0.5">Two-step discovery</div>
                <div className="text-xs text-indigo-800/80">
                  We'll research the company first (size, location, business model) and let you confirm the filters
                  before searching for comparables. This avoids matching small startups against mega-caps.
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell key="quick-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">2. Confirm profile + filters</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                <Sparkles className="w-3 h-3" /> Researched by Perplexity
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wide text-gray-500">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="(no description returned)"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 min-h-[60px]"
              />
            </div>

            <FilterGrid
              filters={filters}
              setFilters={setFilters}
              customFilters={customFilters}
              setCustomFilters={setCustomFilters}
              showCompany
            />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell key="quick-3">
            <PeerReview
              discovered={discovered}
              selectedTickers={selectedTickers}
              onToggle={togglePeer}
            />
          </StepShell>
        )}
      </AnimatePresence>
      {error && <ErrorBanner message={error} />}
    </WizardShell>
  );
}

/* ============ PATH 2: QUERY ============ */

function QueryWizard({ onRunAnalysis, isRunning }: LandingPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState(
    'AI infrastructure companies with market cap above $1B and revenue above $100M, listed in the US.'
  );
  const [filters, setFilters] = useState<ParsedFilters>(EMPTY_FILTERS);
  const [customFilters, setCustomFilters] = useState<CustomConstraint[]>([]);
  const [discovered, setDiscovered] = useState<DiscoveredPeer[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<Set<string>>(new Set());

  const [parsing, setParsing] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!query.trim()) return;
    setParsing(true);
    setError(null);
    try {
      const parsed = await parseQuery(query.trim());
      setFilters(parsed);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed');
    } finally {
      setParsing(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError(null);
    try {
      const dFilters: DiscoveryFilters = {
        sector: filters.sector ?? undefined,
        geography: filters.geography ?? undefined,
        marketCap: filters.marketCap ?? undefined,
        revenue: filters.revenue ?? undefined,
        qualitative: filters.qualitative ?? undefined,
        customConstraints: customFilters,
      };
      const company = filters.sector ?? 'sector peer set';
      const peers = await discoverPeers(company, dFilters);
      if (peers.length === 0) {
        setError('No peers discovered. Try loosening the filters.');
        return;
      }
      setDiscovered(peers);
      setSelectedTickers(new Set(peers.map((p) => p.ticker)));
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed');
    } finally {
      setDiscovering(false);
    }
  };

  const togglePeer = (ticker: string) =>
    setSelectedTickers((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });

  const handleRun = () => {
    const target = filters.sector ?? 'Custom Peer Set';
    onRunAnalysis({
      targetCompany: target,
      discovered,
      selectedTickers,
      filters,
      customFilters,
      description: query,
    });
  };

  return (
    <WizardShell
      step={step}
      totalSteps={3}
      footer={
        <WizardFooter
          step={step}
          totalSteps={3}
          onBack={() => setStep(((step - 1) || 1) as 1 | 2 | 3)}
          backDisabled={parsing || discovering || isRunning}
          primary={
            step === 1
              ? {
                  label: parsing ? 'Parsing query…' : 'Parse query',
                  busy: parsing,
                  disabled: !query.trim(),
                  onClick: handleParse,
                }
              : step === 2
              ? {
                  label: discovering ? 'Discovering peers…' : 'Discover peers',
                  busy: discovering,
                  disabled: false,
                  onClick: handleDiscover,
                }
              : {
                  label: isRunning ? 'Fetching live data…' : 'Run Analysis',
                  busy: isRunning,
                  disabled: selectedTickers.size === 0,
                  onClick: handleRun,
                  icon: <Search className="w-4 h-4" />,
                }
          }
        />
      }
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepShell key="query-1">
            <h3 className="text-lg font-medium text-gray-900">1. Describe the peer set</h3>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wide text-gray-500">Free-form query</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm min-h-[120px]"
                placeholder='e.g. "AI infrastructure companies with market cap above $1B and revenue above $100M, listed in the US"'
                autoFocus
              />
            </div>
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-4 flex gap-3">
              <Wand2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-900 leading-relaxed">
                <div className="font-medium mb-0.5">Auto-filled filters</div>
                <div className="text-xs text-indigo-800/80">
                  GPT-4o will extract sector, geography, market-cap and revenue ranges from your query so you can
                  review and adjust before discovery runs.
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell key="query-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">2. Review filters</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                <Sparkles className="w-3 h-3" /> Parsed by GPT-4o
              </span>
            </div>
            <div className="text-xs text-gray-500 italic">"{query}"</div>
            <FilterGrid
              filters={filters}
              setFilters={setFilters}
              customFilters={customFilters}
              setCustomFilters={setCustomFilters}
              showCompany={false}
            />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell key="query-3">
            <PeerReview
              discovered={discovered}
              selectedTickers={selectedTickers}
              onToggle={togglePeer}
            />
          </StepShell>
        )}
      </AnimatePresence>
      {error && <ErrorBanner message={error} />}
    </WizardShell>
  );
}

/* ============ SHARED WIZARD CHROME ============ */

function WizardShell({
  step,
  totalSteps,
  footer,
  children,
}: {
  step: number;
  totalSteps: number;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="w-full bg-gray-100 h-1 flex-shrink-0">
        <div
          className="bg-indigo-600 h-1 transition-all duration-300 ease-in-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>
      <div className="border-t border-gray-100 bg-gray-50 flex-shrink-0">{footer}</div>
    </>
  );
}

function WizardFooter({
  step,
  totalSteps,
  onBack,
  backDisabled,
  primary,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  backDisabled: boolean;
  primary: { label: string; busy: boolean; disabled: boolean; onClick: () => void; icon?: React.ReactNode };
}) {
  const Icon = primary.icon ?? <ArrowRight className="w-4 h-4" />;
  return (
    <div className="p-4 flex justify-between items-center">
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              step >= i ? 'bg-indigo-600' : 'bg-gray-300'
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {step > 1 && (
          <button
            onClick={onBack}
            disabled={backDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button
          onClick={primary.onClick}
          disabled={primary.busy || primary.disabled}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[170px] justify-center"
        >
          {primary.busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> {primary.label}
            </>
          ) : (
            <>
              {primary.label} {Icon}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function StepShell({ children, key: _ }: { children: React.ReactNode; key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {children}
    </motion.div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2.5 text-xs text-red-800 leading-relaxed">
      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
      <div>{message}</div>
    </div>
  );
}

function FilterGrid({
  filters,
  setFilters,
  customFilters,
  setCustomFilters,
  showCompany = true,
}: {
  filters: ParsedFilters;
  setFilters: (f: ParsedFilters) => void;
  customFilters: CustomConstraint[];
  setCustomFilters: (c: CustomConstraint[]) => void;
  showCompany?: boolean;
}) {
  const updateCustom = (idx: number, patch: Partial<CustomConstraint>) => {
    const next = customFilters.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    setCustomFilters(next);
  };
  const addCustom = () => setCustomFilters([...customFilters, { label: '', value: '' }]);
  const removeCustom = (idx: number) => setCustomFilters(customFilters.filter((_, i) => i !== idx));

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {showCompany && (
          <FilterField
            label="Target company"
            placeholder="(optional)"
            value={filters.company ?? ''}
            onChange={(v) => setFilters({ ...filters, company: v || null })}
          />
        )}
        <FilterField
          label="Sector"
          placeholder="e.g. AI software for PE"
          value={filters.sector ?? ''}
          onChange={(v) => setFilters({ ...filters, sector: v || null })}
        />
        <FilterField
          label="Geography"
          placeholder="e.g. United States"
          value={filters.geography ?? ''}
          onChange={(v) => setFilters({ ...filters, geography: v || null })}
        />
        <FilterField
          label="Market cap"
          placeholder="e.g. < $250M"
          value={filters.marketCap ?? ''}
          onChange={(v) => setFilters({ ...filters, marketCap: v || null })}
        />
        <FilterField
          label="Revenue"
          placeholder="e.g. < $50M"
          value={filters.revenue ?? ''}
          onChange={(v) => setFilters({ ...filters, revenue: v || null })}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs uppercase tracking-wide text-gray-500">Qualitative</label>
        <textarea
          value={filters.qualitative ?? ''}
          onChange={(e) => setFilters({ ...filters, qualitative: e.target.value || null })}
          placeholder="(optional) extra business-model context"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 min-h-[60px]"
        />
      </div>

      {customFilters.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wide text-gray-500">Custom filters</label>
          {customFilters.map((c, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input
                type="text"
                value={c.label}
                onChange={(e) => updateCustom(idx, { label: e.target.value })}
                placeholder="Label (e.g. Growth rate)"
                className="w-1/3 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={c.value}
                onChange={(e) => updateCustom(idx, { value: e.target.value })}
                placeholder="Value (e.g. > 30% YoY)"
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => removeCustom(idx)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addCustom}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-dashed border-gray-300 rounded-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add filter
      </button>
    </>
  );
}

function FilterField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs uppercase tracking-wide text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

function PeerReview({
  discovered,
  selectedTickers,
  onToggle,
}: {
  discovered: DiscoveredPeer[];
  selectedTickers: Set<string>;
  onToggle: (ticker: string) => void;
}) {
  const selectedCount = discovered.filter((p) => selectedTickers.has(p.ticker)).length;
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">3. Review discovered peers</h3>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
          <Sparkles className="w-3 h-3" /> {selectedCount} of {discovered.length} selected
        </span>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-2.5 text-xs text-indigo-800 leading-relaxed">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <p>
          Discovered via Perplexity from your filters. Deselect any whose business model isn't a true fit before
          pulling financials from Yahoo.
        </p>
      </div>

      <div className="space-y-2">
        {discovered.map((peer) => {
          const included = selectedTickers.has(peer.ticker);
          return (
            <PeerCard
              key={peer.ticker}
              ticker={peer.ticker}
              companyName={peer.companyName}
              description={peer.description || peer.rationale}
              similarityScore={peer.similarityScore}
              included={included}
              onToggle={() => onToggle(peer.ticker)}
            />
          );
        })}
      </div>
    </>
  );
}

function PeerCard({
  ticker,
  companyName,
  description,
  similarityScore,
  included,
  onToggle,
}: {
  ticker: string;
  companyName: string;
  description: string;
  similarityScore: number;
  included: boolean;
  onToggle: () => void;
  key?: string;
}) {
  return (
    <div
      className={cn(
        'border rounded-lg p-3 flex items-start gap-3 transition-colors',
        included ? 'bg-white border-gray-200' : 'bg-gray-50/60 border-gray-200 opacity-70'
      )}
    >
      <div className="w-14 h-10 rounded bg-gray-900 text-white text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 px-1">
        {ticker}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{companyName}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{description}</p>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={cn(
              'text-[11px] font-bold',
              similarityScore > 85 ? 'text-green-600' : similarityScore > 70 ? 'text-emerald-600' : 'text-amber-600'
            )}
          >
            {similarityScore}% match
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-1 rounded-full',
                  similarityScore / 20 >= i ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border flex-shrink-0',
          included
            ? 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100'
            : 'bg-white border-gray-300 text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
        )}
      >
        {included ? <><MinusCircle className="w-3 h-3" /> Exclude</> : <><PlusCircle className="w-3 h-3" /> Include</>}
      </button>
    </div>
  );
}
