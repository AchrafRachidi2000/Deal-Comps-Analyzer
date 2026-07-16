/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Sidebar, Module } from '@/shared/Sidebar';
import { HomePage } from '@/home/HomePage';
import { AssessApp } from '@/assess/AssessApp';
import { DealCompsPage } from '@/dealCompsV1/DealCompsPage';
import { DealCompsApp } from '@/dealComps/DealCompsApp';
import { DealCompsV1App } from '@/dealCompsV1/DealCompsV1App';

type View =
  | { kind: 'home' }
  | { kind: 'assess'; company: string }
  | { kind: 'dealcomps'; company: string }
  | { kind: 'deal' }
  | { kind: 'dealV1' };

const DEFAULT_COMPANY = 'Sanara MedTech';

export default function App() {
  // Simple in-app navigation stack (Back pops; sidebar sets a fresh root).
  const [stack, setStack] = useState<View[]>([{ kind: 'home' }]);
  const [assistantCollapsed, setAssistantCollapsed] = useState(true);
  const toggleAssistant = () => setAssistantCollapsed((c) => !c);

  const view = stack[stack.length - 1];
  const push = (v: View) => setStack((s) => [...s, v]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const activeModule: Module =
    view.kind === 'home'
      ? 'home'
      : view.kind === 'assess' || view.kind === 'dealcomps'
        ? 'assess'
        : view.kind === 'deal'
          ? 'deal'
          : 'dealV1';

  const onModuleChange = (m: Module) => {
    if (m === 'home') setStack([{ kind: 'home' }]);
    else if (m === 'assess') setStack([{ kind: 'assess', company: DEFAULT_COMPANY }]);
    else if (m === 'deal') setStack([{ kind: 'deal' }]);
    else setStack([{ kind: 'dealV1' }]);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
        <Sidebar activeModule={activeModule} onModuleChange={onModuleChange} />
        {view.kind === 'home' ? (
          <HomePage
            onLaunchAssess={(company) => push({ kind: 'assess', company })}
            onLaunchDealComps={(company) => push({ kind: 'dealcomps', company })}
          />
        ) : view.kind === 'assess' ? (
          <AssessApp
            companyName={view.company}
            onBack={back}
            onGenerateDealComps={() => push({ kind: 'dealcomps', company: view.company })}
          />
        ) : view.kind === 'dealcomps' ? (
          <DealCompsPage companyName={view.company} onBack={back} />
        ) : view.kind === 'deal' ? (
          <DealCompsApp assistantCollapsed={assistantCollapsed} onToggleAssistant={toggleAssistant} />
        ) : (
          <DealCompsV1App />
        )}
      </div>
    </MotionConfig>
  );
}
