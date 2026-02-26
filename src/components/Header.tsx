import React from 'react';
import { ChevronRight, Save, Plus } from 'lucide-react';

export function Header({ title, breadcrumbs }: { title: string, breadcrumbs: string[] }) {
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

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Unsaved changes</span>
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
