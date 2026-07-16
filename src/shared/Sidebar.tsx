import React from 'react';
import { Handshake, Rocket, Radar, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Module = 'home' | 'assess' | 'deal' | 'dealV1';

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
}

const NAV: { id: Module; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'assess', label: 'Assess', icon: <Radar className="w-5 h-5" /> },
  { id: 'deal', label: 'Deal Comps initial POC', icon: <Handshake className="w-5 h-5" /> },
  { id: 'dealV1', label: 'Deal Comps MVP scope', icon: <Rocket className="w-5 h-5" /> },
];

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col py-4 z-20 flex-shrink-0">
      {/* Brand — clicking returns to the Home landing page */}
      <button
        onClick={() => onModuleChange('home')}
        className="mx-2 px-2 mb-6 flex items-center gap-2.5 rounded-lg py-1 hover:bg-gray-50 transition-all active:scale-[0.98] text-left"
        title="Home"
      >
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
          A
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-gray-900 leading-tight">ALPHA10X</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Deal workspace</div>
        </div>
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1">
        <div className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Workflows</div>
        {NAV.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeModule === item.id}
            onClick={() => onModuleChange(item.id)}
          />
        ))}
      </nav>

      {/* User */}
      <div className="mt-auto mx-2 pt-3 border-t border-gray-100 flex items-center gap-2.5 px-1">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
          JD
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">Jane Doe</div>
          <div className="text-[11px] text-gray-400 truncate">Analyst</div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]',
        active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
      title={label}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
