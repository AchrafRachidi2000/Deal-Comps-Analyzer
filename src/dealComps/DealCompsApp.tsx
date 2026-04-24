import React, { useState } from 'react';
import { Header, ArtifactTab } from '@/shared/Header';
import { AssistantPanel } from '@/shared/AssistantPanel';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ArtifactView, Artifact } from './components/ArtifactView';
import { MOCK_TRANSACTIONS, CHAT_HISTORY } from './data/mockData';

interface DealCompsAppProps {
  assistantCollapsed: boolean;
  onToggleAssistant: () => void;
}

export function DealCompsApp({ assistantCollapsed, onToggleAssistant }: DealCompsAppProps) {
  const [mode, setMode] = useState<'landing' | 'dashboard'>('landing');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'artifact'>('dashboard');
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);

  const handleRunAnalysis = () => {
    setMode('dashboard');
  };

  const handleSaveArtifact = () => {
    const newArtifact: Artifact = {
      id: Date.now().toString(),
      name: `Deal Comps Snapshot – ${new Date().toLocaleDateString()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      transactions: [...MOCK_TRANSACTIONS],
    };
    setArtifacts(prev => [...prev, newArtifact]);
    setActiveArtifactId(newArtifact.id);
    setActiveView('artifact');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setActiveArtifactId(null);
  };

  const activeArtifact = artifacts.find(a => a.id === activeArtifactId);

  const artifactTabs: ArtifactTab[] = artifacts.map(a => ({
    id: a.id,
    name: a.name,
    subtitle: `${a.date} · ${a.transactions.length} txns`,
  }));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Header
        title="NovaPulse Medical"
        breadcrumbs={mode === 'landing'
          ? ['Medtech', 'Deal Comps']
          : ['Medtech', 'Deal Comps', 'NovaPulse Medical']
        }
        artifacts={artifactTabs}
        activeView={activeView}
        showTabs={mode === 'dashboard'}
        onViewDashboard={handleBackToDashboard}
        onViewArtifact={(id) => { setActiveArtifactId(id); setActiveView('artifact'); }}
      />

      <main className="flex-1 flex overflow-hidden">
        {mode === 'landing' ? (
          <>
            <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
              <LandingPage onRunAnalysis={handleRunAnalysis} />
            </div>
            <AssistantPanel
              initialMessages={CHAT_HISTORY}
              collapsed={assistantCollapsed}
              onToggleCollapsed={onToggleAssistant}
            />
          </>
        ) : (
          <>
            <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
              {activeView === 'dashboard' ? (
                <Dashboard onSaveArtifact={handleSaveArtifact} />
              ) : activeArtifact ? (
                <ArtifactView artifact={activeArtifact} onBack={handleBackToDashboard} />
              ) : (
                <Dashboard onSaveArtifact={handleSaveArtifact} />
              )}
            </div>
            <AssistantPanel
              initialMessages={CHAT_HISTORY}
              collapsed={assistantCollapsed}
              onToggleCollapsed={onToggleAssistant}
            />
          </>
        )}
      </main>
    </div>
  );
}
