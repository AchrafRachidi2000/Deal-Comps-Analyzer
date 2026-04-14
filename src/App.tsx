/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { AssistantPanel } from '@/components/AssistantPanel';
import { ArtifactView, Artifact } from '@/components/ArtifactView';
import { MOCK_TRANSACTIONS } from '@/data/mockData';

export default function App() {
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

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="NovaPulse Medical"
          breadcrumbs={mode === 'landing'
            ? ['Medtech', 'Deal Comps']
            : ['Medtech', 'Deal Comps', 'NovaPulse Medical']
          }
          artifacts={artifacts}
          activeView={activeView}
          showTabs={mode === 'dashboard'}
          onViewDashboard={handleBackToDashboard}
          onViewArtifact={(id) => { setActiveArtifactId(id); setActiveView('artifact'); }}
        />

        <main className="flex-1 flex overflow-hidden">
          {mode === 'landing' ? (
            /* Landing page — full width with assistant panel */
            <>
              <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
                <LandingPage onRunAnalysis={handleRunAnalysis} />
              </div>
              <div className="w-[400px] flex-shrink-0 bg-white h-full shadow-xl z-10">
                <AssistantPanel />
              </div>
            </>
          ) : (
            /* Dashboard / Artifact view */
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
              <div className="w-[400px] flex-shrink-0 bg-white h-full shadow-xl z-10">
                <AssistantPanel />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
