import React from 'react';
import { AspectResult } from '../../types';
import { SentimentBadge } from '../common/SentimentBadge';
import { Layers, Quote } from 'lucide-react';

export const AspectCard: React.FC<{ aspect: AspectResult }> = ({ aspect }) => {
  const isPositive = aspect.sentiment === 'positive';
  const isNegative = aspect.sentiment === 'negative';

  const borderColor = isPositive
    ? 'border-emerald-500/30 bg-emerald-500/5'
    : isNegative
    ? 'border-rose-500/30 bg-rose-500/5'
    : 'border-slate-700/50 bg-slate-800/20';

  return (
    <div className={`p-4 rounded-xl border ${borderColor} transition-all duration-200 hover:border-opacity-60 flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-slate-800/80 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100">{aspect.aspect}</h4>
            <span className="text-[11px] text-slate-500 font-mono">
              Confidence: {Math.round(aspect.confidence * 100)}%
            </span>
          </div>
        </div>

        <SentimentBadge sentiment={aspect.sentiment} size="sm" showIcon={true} />
      </div>

      {aspect.evidence && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-start gap-1.5 text-xs text-slate-400 italic">
          <Quote className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">"{aspect.evidence}"</span>
        </div>
      )}
    </div>
  );
};
