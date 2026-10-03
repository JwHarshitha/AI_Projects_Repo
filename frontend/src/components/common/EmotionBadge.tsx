import React from 'react';
import { EmotionType } from '../../types';

interface EmotionBadgeProps {
  emotion: EmotionType | string;
  confidence?: number;
  size?: 'sm' | 'md';
}

const EMOTION_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  Joy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25' },
  Trust: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/25' },
  Anger: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25' },
  Sadness: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/25' },
  Fear: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/25' },
  Surprise: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/25' },
  Disgust: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25' },
  Satisfied: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/25' },
  Frustrated: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/25' },
  Neutral: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/25' },
};

export const EmotionBadge: React.FC<EmotionBadgeProps> = ({
  emotion,
  confidence,
  size = 'md',
}) => {
  const config = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.Neutral;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{emotion}</span>
      {confidence !== undefined && (
        <span className="opacity-60 text-[10px] font-mono">
          {Math.round(confidence > 1 ? confidence : confidence * 100)}%
        </span>
      )}
    </span>
  );
};
