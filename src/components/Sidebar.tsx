import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  FileText, 
  Search, 
  Settings, 
  HelpCircle, 
  User, 
  Menu,
  Database,
  History,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  return (
    <div className="w-16 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 z-20 flex-shrink-0">
      <div className="mb-8">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 w-full items-center">
        <NavItem icon={<Home className="w-5 h-5" />} label="Home" />
        <NavItem icon={<div className="w-5 h-5 bg-indigo-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>} label="Workspace" active />
        <NavItem icon={<FileText className="w-5 h-5" />} label="Documents" />
        <NavItem icon={<Search className="w-5 h-5" />} label="Search" />
        <NavItem icon={<History className="w-5 h-5" />} label="History" />
        <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Analytics" />
      </div>

      <div className="mt-auto flex flex-col gap-4 w-full items-center mb-4">
        <NavItem icon={<HelpCircle className="w-5 h-5" />} label="Help" />
        <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mt-2">
          JD
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button 
      className={cn(
        "p-2 rounded-lg transition-colors relative group",
        active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
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
