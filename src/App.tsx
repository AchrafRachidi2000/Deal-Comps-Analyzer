/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, Module } from '@/shared/Sidebar';
import { DealCompsApp } from '@/dealComps/DealCompsApp';
import { PublicCompsApp } from '@/publicComps/PublicCompsApp';

export default function App() {
  const [module, setModule] = useState<Module>('public');
  const [assistantCollapsed, setAssistantCollapsed] = useState(true);
  const toggleAssistant = () => setAssistantCollapsed((c) => !c);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar activeModule={module} onModuleChange={setModule} />
      {module === 'deal' ? (
        <DealCompsApp assistantCollapsed={assistantCollapsed} onToggleAssistant={toggleAssistant} />
      ) : (
        <PublicCompsApp assistantCollapsed={assistantCollapsed} onToggleAssistant={toggleAssistant} />
      )}
    </div>
  );
}
