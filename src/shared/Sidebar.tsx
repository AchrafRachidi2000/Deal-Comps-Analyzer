import React from 'react';
import { Handshake, Rocket, Radar, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Module = 'home' | 'assess' | 'deal' | 'dealV1';

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-16 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 z-20 flex-shrink-0">
      <div className="flex-1 flex flex-col gap-4 w-full items-center">
        <NavItem
          icon={<Home className="w-5 h-5" />}
          label="Home"
          active={activeModule === 'home'}
          onClick={() => onModuleChange('home')}
        />
        <NavItem
          icon={<Radar className="w-5 h-5" />}
          label="Assess"
          active={activeModule === 'assess'}
          onClick={() => onModuleChange('assess')}
        />
        <NavItem
          icon={<Handshake className="w-5 h-5" />}
          label="Deal Comps"
          active={activeModule === 'deal'}
          onClick={() => onModuleChange('deal')}
        />
        <NavItem
          icon={<Rocket className="w-5 h-5" />}
          label="Deal Comps V1"
          active={activeModule === 'dealV1'}
          onClick={() => onModuleChange('dealV1')}
        />
      </div>

      <div className="mt-auto flex flex-col items-center mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
          JD
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
        'p-2 rounded-lg transition-colors relative group',
        active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      )}
      title={label}
    >
      {icon}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full -ml-4" />
      )}
    </button>
  );
}
