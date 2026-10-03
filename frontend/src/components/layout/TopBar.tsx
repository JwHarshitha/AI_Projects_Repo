import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

interface TopBarProps {
  currentPath: string;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onNavigate: (path: string) => void;
}

const PAGE_TITLES: Record<string, { title: string; category: string }> = {
  '/dashboard': { title: 'Intelligence Overview', category: 'Overview' },
  '/analyze': { title: 'Single Feedback Analysis', category: 'Analyze' },
  '/batch-analysis': { title: 'Batch CSV Analysis', category: 'Analyze' },
  '/feedback': { title: 'Feedback Explorer', category: 'Intelligence' },
  '/insights': { title: 'AI Business Insights', category: 'Intelligence' },
  '/trends': { title: 'Temporal Trends & Signals', category: 'Intelligence' },
  '/models': { title: 'Model Performance & Benchmark', category: 'Models' },
  '/reports': { title: 'Generated Reports', category: 'Reports' },
  '/settings': { title: 'Workspace Settings', category: 'System' },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentPath,
  onOpenMobileMenu,
  onOpenSearch,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const pageInfo = PAGE_TITLES[currentPath] || { title: 'Sentiment Analytics', category: 'Dashboard' };

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Platform</span>
            <span>/</span>
            <span>{pageInfo.category}</span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs transition group"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          <span className="hidden sm:inline">Search platform...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#090d16]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => markRead(note.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        note.read
                          ? 'bg-slate-950/40 border-slate-800/50 text-slate-400'
                          : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-white">{note.title}</span>
                        {!note.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{note.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar indicator */}
        <div
          onClick={() => onNavigate('/settings')}
          className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px]">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-white">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AV'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
