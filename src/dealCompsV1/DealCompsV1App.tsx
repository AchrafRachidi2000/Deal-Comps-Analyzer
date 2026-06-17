import React, { useState } from 'react';
import type { CompTransaction, DealCompFilters, PresetCompany } from './data/types';
import { PRESET_COMPANIES } from './data/companies';
import { defaultVisibleColumns } from './lib/columns';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AssistantPanel } from '@/shared/AssistantPanel';

export function DealCompsV1App() {
  const [phase, setPhase] = useState<'setup' | 'dashboard'>('setup');
  const [company, setCompany] = useState<PresetCompany | null>(null);
  const [transactions, setTransactions] = useState<CompTransaction[]>([]);
  const [filters, setFilters] = useState<DealCompFilters | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => defaultVisibleColumns());
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);

  const handleRun = (c: PresetCompany, f: DealCompFilters) => {
    setCompany(c);
    setTransactions(c.transactions.map((t) => ({ ...t })));
    setFilters(f);
    setVisibleColumns(defaultVisibleColumns());
    setPhase('dashboard');
  };

  const toggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'Included' ? 'Excluded' : 'Included' } : t))
    );
  };

  const toggleAssistant = () => setAssistantCollapsed((c) => !c);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {phase === 'dashboard' && company && filters ? (
        // Keyed fragment so the assistant remounts (fresh, company-aware messages) on entering the dashboard.
        <React.Fragment key="dashboard">
          <Dashboard
            company={company}
            transactions={transactions}
            filters={filters}
            onFiltersChange={setFilters}
            onToggleStatus={toggleStatus}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
          />
          <AssistantPanel
            title="Deal Assistant"
            initialMessages={[
              {
                role: 'assistant',
                content: `I've loaded ${company.name}'s comp set — ${transactions.length} precedent transactions with your preset filters applied. Ask me to refine it (e.g. "only strategic buyers" or "EV/EBITDA under 15x"), or adjust the filters above.`,
                timestamp: 'Just now',
              },
            ]}
            reasoningContent={
              <>
                <p className="mb-2">
                  Comp set for <span className="font-medium text-gray-900">{company.name}</span> — {transactions.length}{' '}
                  precedent transactions, filtered live by your criteria.
                </p>
                <p>
                  The min / median / max multiples recompute across the <span className="italic">included</span> comps whenever
                  you change a filter or toggle a row in or out.
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
          <LandingPage companies={PRESET_COMPANIES} onRun={handleRun} />
          <AssistantPanel
            title="Deal Assistant"
            initialMessages={[
              {
                role: 'assistant',
                content:
                  "Pick a target company to pull its precedent transactions. Each target comes with a tailored set of filters already applied — you can fine-tune them before running. Ask me about any metric or which screen fits your mandate.",
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
            suggestedPrompts={['What is EV/EBITDA?', 'Suggest a screen for medtech', 'How recent should comps be?', 'Which sectors can I pick?']}
            autoReplyText="Good question — in a full build I'd walk you through that. For now, pick a target company and tune the filters to build your comp set."
            collapsed={assistantCollapsed}
            onToggleCollapsed={toggleAssistant}
          />
        </React.Fragment>
      )}
    </div>
  );
}
