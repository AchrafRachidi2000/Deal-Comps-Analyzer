/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

  // Drive the in-app view stack through the browser History API so the back /
  // forward arrows walk through the app. Sub-modules that own their own history
  // (e.g. the Deal Comps V1 wizard) push entries without a `stack`; we leave those
  // to their handlers and only restore entries we created.
  useEffect(() => {
    window.history.replaceState({ stack: [{ kind: 'home' }] }, '');
    const onPop = (e: PopStateEvent) => {
      const next = (e.state as { stack?: View[] } | null)?.stack;
      if (next && next.length) setStack(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const view = stack[stack.length - 1];

  const navigate = (next: View[]) => {
    window.history.pushState({ stack: next }, '');
    setStack(next);
  };
  const push = (v: View) => navigate([...stack, v]);
  const back = () => window.history.back();

  const activeModule: Module =
    view.kind === 'home'
      ? 'home'
      : view.kind === 'assess' || view.kind === 'dealcomps'
        ? 'assess'
        : view.kind === 'deal'
          ? 'deal'
          : 'dealV1';

  const onModuleChange = (m: Module) => {
    if (m === 'home') navigate([{ kind: 'home' }]);
    else if (m === 'assess') navigate([{ kind: 'assess', company: DEFAULT_COMPANY }]);
    else if (m === 'deal') navigate([{ kind: 'deal' }]);
    else navigate([{ kind: 'dealV1' }]);
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
