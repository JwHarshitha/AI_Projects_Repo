import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FileSpreadsheet,
  TableProperties,
  Lightbulb,
  TrendingUp,
  Cpu,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Analyze',
      items: [
        { label: 'Single Analysis', path: '/analyze', icon: Sparkles },
        { label: 'Batch Analysis', path: '/batch-analysis', icon: FileSpreadsheet },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        { label: 'Feedback Explorer', path: '/feedback', icon: TableProperties },
        { label: 'AI Insights', path: '/insights', icon: Lightbulb },
        { label: 'Trends', path: '/trends', icon: TrendingUp },
      ],
    },
    {
      group: 'Models',
      items: [
        { label: 'Model Performance', path: '/models', icon: Cpu },
      ],
    },
    {
      group: 'Reports',
      items: [
        { label: 'Generated Reports', path: '/reports', icon: FileText },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div
            onClick={() => handleNavClick('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">Sentinel</span>
                <span className="font-bold text-base tracking-tight text-indigo-400">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Sentiment Platform
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((grp) => (
            <div key={grp.group}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {grp.group}
              </div>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const isActive = currentPath === item.path;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
                {user?.name ? user.name.slice(0, 2) : 'AV'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Alex Vance'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Lead Analyst'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
