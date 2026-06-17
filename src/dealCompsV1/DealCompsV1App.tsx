import React, { useState, useEffect } from 'react';
import type { DealCompFilters, PresetCompany } from './data/types';
import { PRESET_COMPANIES } from './data/companies';
import { defaultVisibleColumns } from './lib/columns';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AssistantPanel } from '@/shared/AssistantPanel';

type View = 'target' | 'filters' | 'review' | 'dashboard';
const STEP_OF: Record<Exclude<View, 'dashboard'>, number> = { target: 1, filters: 2, review: 3 };

export function DealCompsV1App() {
  const [view, setView] = useState<View>('target');
  const [company, setCompany] = useState<PresetCompany | null>(null);
  const [filters, setFilters] = useState<DealCompFilters | null>(null);
  const [committedFilters, setCommittedFilters] = useState<DealCompFilters | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => defaultVisibleColumns());
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);

  // Sync the active view with browser history so the back/forward arrows work.
  useEffect(() => {
    window.history.replaceState({ v: 'target' }, '');
    const onPop = (e: PopStateEvent) => {
      const v = (e.state && (e.state as { v?: View }).v) || 'target';
      setView(v);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (v: View) => {
    window.history.pushState({ v }, '');
    setView(v);
  };

  const handleSelectCompany = (c: PresetCompany) => {
    setCompany(c);
    setFilters(c.presetFilters);
  };
  const goNext = () => {
    if (view === 'target') navigate('filters');
    else if (view === 'filters') navigate('review');
  };
  const goBack = () => window.history.back();
  const handleRun = () => {
    if (!company || !filters) return;
    setCommittedFilters(filters);
    navigate('dashboard');
  };
  const handleRegenerate = () => filters && setCommittedFilters(filters);
  const handleReset = () => committedFilters && setFilters(committedFilters);
  const toggleAssistant = () => setAssistantCollapsed((c) => !c);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {view === 'dashboard' && company && filters && committedFilters ? (
        <React.Fragment key="dashboard">
          <Dashboard
            company={company}
            filters={filters}
            committedFilters={committedFilters}
            onFiltersChange={setFilters}
            onRegenerate={handleRegenerate}
            onReset={handleReset}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
          />
          <AssistantPanel
            title="Deal Assistant"
            initialMessages={[
              {
                role: 'assistant',
                content: `I've loaded ${company.name}'s comp set — ${company.transactions.length} precedent transactions with your preset filters applied. Ask me to refine it (e.g. "only strategic buyers" or "EV/EBITDA under 15x"), or adjust the filters above.`,
                timestamp: 'Just now',
              },
            ]}
            reasoningContent={
              <>
                <p className="mb-2">
                  Comp set for <span className="font-medium text-gray-900">{company.name}</span> —{' '}
                  {company.transactions.length} precedent transactions, filtered live by your criteria.
                </p>
                <p>
                  The min / median / max multiples recompute across the shown comps whenever you change a filter. Use
                  Regenerate to lock a new baseline or Reset to revert.
                </p>
              </>
            }
            suggestedPrompts={['Only strategic buyers', 'EV/EBITDA under 15x', 'Last 3 years', 'North America only']}
            autoReplyText="Got it — in a full build I'd apply that to the comp set and refresh the stats. For now, use the filters above to refine the table live."
            collapsed={assistantCollapsed}
            onToggleCollapsed={toggleAssistant}
          />
        </React.Fragment>
      ) : (
        <React.Fragment key="setup">
          <LandingPage
            companies={PRESET_COMPANIES}
            step={view === 'dashboard' ? 3 : STEP_OF[view]}
            company={company}
            filters={filters}
            onSelectCompany={handleSelectCompany}
            onFiltersChange={setFilters}
            onNext={goNext}
            onBack={goBack}
            onRun={handleRun}
          />
          <AssistantPanel
            title="Deal Assistant"
            initialMessages={[
              {
                role: 'assistant',
                content:
                  "Pick a target company to pull its precedent transactions. Each target comes with a tailored set of filters already applied — fine-tune them before running. Ask me about any metric or which screen fits your mandate.",
                timestamp: 'Just now',
              },
            ]}
            reasoningContent={
              <>
                <p className="mb-2">
                  You're setting up a <span className="font-medium text-gray-900">precedent transactions</span> comp set.
                  Choose a target, then tune the hard filters — sector, geography, size, recency, and valuation multiples.
                </p>
                <p>Nothing runs until you hit Run Analysis, so explore the presets freely.</p>
              </>
            }
            suggestedPrompts={['What is EV/EBITDA?', 'How recent should comps be?', 'Which sectors can I pick?', 'Compare two targets']}
            autoReplyText="Good question — in a full build I'd walk you through that. For now, pick a target company and tune the filters to build your comp set."
            collapsed={assistantCollapsed}
            onToggleCollapsed={toggleAssistant}
          />
        </React.Fragment>
      )}
    </div>
  );
}
