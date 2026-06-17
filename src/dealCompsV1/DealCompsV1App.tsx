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

  if (phase === 'setup' || !company || !filters) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <LandingPage companies={PRESET_COMPANIES} onRun={handleRun} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
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
              Comp set for <span className="font-medium text-gray-900">{company.name}</span> — {transactions.length} precedent
              transactions, filtered live by your criteria.
            </p>
            <p>
              The min / median / max multiples recompute across the <span className="italic">included</span> comps whenever you
              change a filter or toggle a row in or out.
            </p>
          </>
        }
        suggestedPrompts={['Only strategic buyers', 'EV/EBITDA under 15x', 'Last 3 years', 'North America only']}
        autoReplyText="Got it — in a full build I'd apply that to the comp set and refresh the stats. For now, use the filters above to refine the table live."
        collapsed={assistantCollapsed}
        onToggleCollapsed={() => setAssistantCollapsed((c) => !c)}
      />
    </div>
  );
}
