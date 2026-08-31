import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, FileText, Cpu, Settings, Layers } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="#8B5CF6" strokeWidth="2.5" fill="#8B5CF6" fillOpacity="0.1" />
    <rect x="8" y="8" width="14" height="14" rx="2" stroke="#C084FC" strokeWidth="2.5" fill="#000000" />
    <circle cx="15" cy="15" r="2" fill="#8B5CF6" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { name: 'DASHBOARD', path: '/dashboard', icon: LayoutDashboard },
    { name: 'NEW ANALYSIS', path: '/new-analysis', icon: PlusCircle },
    { name: 'WORKSPACE', path: '/workspace', icon: Layers },
    { name: 'HISTORY', path: '/history', icon: History },
    { name: 'REPORTS', path: '/reports', icon: FileText },
    { name: 'SYSTEM', path: '/system', icon: Cpu },
    { name: 'SETTINGS', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#08080a]/90 backdrop-blur-md border-r border-zinc-900 shadow-panel transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-900">
          <LogoIcon />
          <div>
            <h2 className="text-sm font-extrabold text-slate-100 tracking-widest uppercase font-mono">SATVISTAAR</h2>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto font-mono">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3.5 text-[11px] font-bold rounded transition duration-200 border ${
                  isActive 
                    ? 'bg-violet-950/20 border-violet-900/30 text-slate-100 shadow-[inset_0_0_10px_rgba(124,58,237,0.05)]' 
                    : 'border-transparent hover:bg-zinc-900/30 text-zinc-500 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 transition ${isActive ? 'text-violet-400' : 'text-zinc-650'}`} />
                  <span className="tracking-wider">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1 h-3 bg-violet-600 rounded" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Station info */}
        <div className="p-4 border-t border-zinc-900 bg-black/40">
          <div className="flex items-center justify-between p-3 rounded bg-zinc-950/60 border border-zinc-900/60">
            <div className="font-mono text-[10px] space-y-0.5">
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">STATION LOCK</p>
              <p className="text-emerald-400 font-extrabold">SQ-NODE-A49</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
