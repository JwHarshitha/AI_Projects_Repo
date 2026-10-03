import React from 'react';
import { SentimentType } from '../../types';
import { Smile, Meh, Frown } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: SentimentType | string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({
  sentiment,
  confidence,
  size = 'md',
  showIcon = true,
}) => {
  const norm = sentiment.toLowerCase() as SentimentType;

  const styles = {
    positive: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      icon: Smile,
      label: 'Positive',
    },
    neutral: {
      bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
      dot: 'bg-slate-400',
      icon: Meh,
      label: 'Neutral',
    },
    negative: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400',
      icon: Frown,
      label: 'Negative',
    },
  }[norm] || {
    bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
    icon: Meh,
    label: sentiment,
  };

  const IconComponent = styles.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${styles.bg} ${sizeClasses}`}>
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{styles.label}</span>
      {confidence !== undefined && (
        <span className="opacity-70 font-mono text-[10px] ml-0.5">
          {Math.round(confidence > 1 ? confidence : confidence * 100)}%
        </span>
      )}
    </span>
  );
};
