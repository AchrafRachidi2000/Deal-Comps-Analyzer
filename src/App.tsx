/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Sidebar, Module } from '@/shared/Sidebar';
import { DealCompsApp } from '@/dealComps/DealCompsApp';
import { DealCompsV1App } from '@/dealCompsV1/DealCompsV1App';

export default function App() {
  const [module, setModule] = useState<Module>('dealV1');
  const [assistantCollapsed, setAssistantCollapsed] = useState(true);
  const toggleAssistant = () => setAssistantCollapsed((c) => !c);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
        <Sidebar activeModule={module} onModuleChange={setModule} />
        {module === 'deal' ? (
          <DealCompsApp assistantCollapsed={assistantCollapsed} onToggleAssistant={toggleAssistant} />
        ) : (
          <DealCompsV1App />
        )}
      </div>
    </MotionConfig>
  );
}
