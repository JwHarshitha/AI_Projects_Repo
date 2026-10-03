import React from 'react';
import { Database, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="glass-card rounded-xl p-10 text-center flex flex-col items-center justify-center border border-slate-800/80 my-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
        {icon || <Database className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
