import React, { useState } from 'react';
import { ChevronRight, Save, Plus, FileText, ChevronDown } from 'lucide-react';
import { Artifact } from './ArtifactView';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  breadcrumbs: string[];
  artifacts?: Artifact[];
  activeView?: 'dashboard' | 'artifact';
  showTabs?: boolean;
  onViewDashboard?: () => void;
  onViewArtifact?: (id: string) => void;
}

export function Header({ title, breadcrumbs, artifacts = [], activeView, showTabs = true, onViewDashboard, onViewArtifact }: HeaderProps) {
  const [showArtifactMenu, setShowArtifactMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            <span className={index === breadcrumbs.length - 1 ? "text-gray-900 font-medium" : ""}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Tab Switcher - only on dashboard mode */}
        {showTabs && (
          <>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={onViewDashboard}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeView === 'dashboard'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Dashboard
              </button>

              {artifacts.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowArtifactMenu(!showArtifactMenu)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
                      activeView === 'artifact'
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Artifacts
                    <span className="ml-0.5 px-1.5 py-0 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-semibold">
                      {artifacts.length}
                    </span>
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {showArtifactMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowArtifactMenu(false)} />
                      <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {artifacts.map((artifact) => (
                          <button
                            key={artifact.id}
                            onClick={() => { onViewArtifact?.(artifact.id); setShowArtifactMenu(false); }}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-start gap-2"
                          >
                            <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate">{artifact.name}</div>
                              <div className="text-xs text-gray-500">{artifact.date} &middot; {artifact.transactions.length} txns</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200" />

            <span className="text-sm text-gray-500">Unsaved changes</span>
          </>
        )}
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">
          <Save className="w-4 h-4" />
          Save
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          New workflow
        </button>
      </div>
    </header>
  );
}
