/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, Module } from '@/shared/Sidebar';
import { DealCompsApp } from '@/dealComps/DealCompsApp';

export default function App() {
  const [module, setModule] = useState<Module>('deal');
  const [assistantCollapsed, setAssistantCollapsed] = useState(true);
  const toggleAssistant = () => setAssistantCollapsed((c) => !c);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar activeModule={module} onModuleChange={setModule} />
      <DealCompsApp assistantCollapsed={assistantCollapsed} onToggleAssistant={toggleAssistant} />
    </div>
  );
}
