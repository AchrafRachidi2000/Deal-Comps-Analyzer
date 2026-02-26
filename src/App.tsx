/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { WorkflowSetup } from '@/components/WorkflowSetup';
import { Dashboard } from '@/components/Dashboard';
import { AssistantPanel } from '@/components/AssistantPanel';

export default function App() {
  const [mode, setMode] = useState<'setup' | 'dashboard'>('setup');
  const [showSetupModal, setShowSetupModal] = useState(true);

  const handleStartWorkflow = () => {
    setShowSetupModal(false);
    setMode('dashboard');
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          title="Respiratory Monitoring Devices" 
          breadcrumbs={['Medtech', 'Deal Comps', 'Respiratory Monitoring Devices']} 
        />
        
        <main className="flex-1 flex overflow-hidden relative">
          {/* Dashboard Area (Left 2/3) */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
             <Dashboard />
          </div>

          {/* Assistant Area (Right 1/3) */}
          <div className="w-[400px] flex-shrink-0 bg-white h-full shadow-xl z-10">
            <AssistantPanel />
          </div>

          {/* Setup Modal Overlay */}
          {showSetupModal && (
            <WorkflowSetup 
              onClose={() => setShowSetupModal(false)} 
              onStart={handleStartWorkflow} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
