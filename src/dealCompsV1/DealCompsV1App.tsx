import React, { useState } from 'react';
import type { CompTransaction, DealCompFilters, PresetCompany } from './data/types';
import { PRESET_COMPANIES } from './data/companies';
import { defaultVisibleColumns } from './lib/columns';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';

export function DealCompsV1App() {
  const [phase, setPhase] = useState<'setup' | 'dashboard'>('setup');
  const [company, setCompany] = useState<PresetCompany | null>(null);
  const [transactions, setTransactions] = useState<CompTransaction[]>([]);
  const [filters, setFilters] = useState<DealCompFilters | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => defaultVisibleColumns());

  const handleRun = (c: PresetCompany, f: DealCompFilters) => {
    setCompany(c);
    setTransactions(c.transactions.map((t) => ({ ...t })));
    setFilters(f);
    setVisibleColumns(defaultVisibleColumns());
    setPhase('dashboard');
  };

  const toggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Included' ? 'Excluded' : 'Included' } : t
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {phase === 'setup' || !company || !filters ? (
        <LandingPage companies={PRESET_COMPANIES} onRun={handleRun} />
      ) : (
        <Dashboard
          company={company}
          transactions={transactions}
          filters={filters}
          onFiltersChange={setFilters}
          onToggleStatus={toggleStatus}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={setVisibleColumns}
        />
      )}
    </div>
  );
}
