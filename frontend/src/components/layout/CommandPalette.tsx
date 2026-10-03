import React, { useState, useEffect, useRef } from 'react';
import { Search, LayoutDashboard, Sparkles, FileSpreadsheet, TableProperties, Lightbulb, TrendingUp, Cpu, FileText, Settings, X, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Static searchable pages
  const pages = [
    { label: 'Intelligence Dashboard', path: '/dashboard', category: 'Pages', icon: LayoutDashboard },
    { label: 'Single Text Analysis', path: '/analyze', category: 'Pages', icon: Sparkles },
    { label: 'Batch CSV Analysis', path: '/batch-analysis', category: 'Pages', icon: FileSpreadsheet },
    { label: 'Feedback Explorer', path: '/feedback', category: 'Pages', icon: TableProperties },
    { label: 'AI Business Insights', path: '/insights', category: 'Pages', icon: Lightbulb },
    { label: 'Temporal Sentiment Trends', path: '/trends', category: 'Pages', icon: TrendingUp },
    { label: 'Model Performance & Benchmark', path: '/models', category: 'Pages', icon: Cpu },
    { label: 'Generated Reports', path: '/reports', category: 'Pages', icon: FileText },
    { label: 'Platform Settings', path: '/settings', category: 'Pages', icon: Settings },
  ];

  // Perform search across pages & feedback
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(pages);
      return;
    }

    const q = query.toLowerCase();
    const matchedPages = pages.filter((p) => p.label.toLowerCase().includes(q));

    // Async search backend feedback if query length >= 3
    let cancel = false;
    if (query.trim().length >= 3) {
      api.getFeedback({ search: query, limit: 4 })
        .then((res) => {
          if (!cancel) {
            const feedbackItems = (res.records || []).map((r) => ({
              label: r.text.slice(0, 75) + '...',
              path: `/feedback?search=${encodeURIComponent(query)}`,
              category: `Feedback (${r.sentiment})`,
              icon: TableProperties,
            }));
            setSearchResults([...matchedPages, ...feedbackItems]);
          }
        })
        .catch(() => {
          if (!cancel) setSearchResults(matchedPages);
        });
    } else {
      setSearchResults(matchedPages);
    }

    return () => {
      cancel = true;
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, or feedback keyword (e.g. 'delivery', 'pricing')..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {searchResults.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              No matching pages, commands, or feedback found.
            </p>
          ) : (
            searchResults.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigate(item.path);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs hover:bg-indigo-600/15 hover:border-indigo-500/30 border border-transparent transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-950/60 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 group-hover:text-white truncate">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-500">{item.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">↓</kbd></span>
          <span>Close with <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
