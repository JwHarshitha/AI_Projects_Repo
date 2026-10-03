import React from 'react';
import { KeywordResult } from '../../types';
import { Hash } from 'lucide-react';

export const KeywordsList: React.FC<{ keywords: KeywordResult[] }> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800/80">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-indigo-400" />
        <h4 className="text-sm font-semibold text-white">Extracted Key Drivers & Terms</h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => {
          const intensity = kw.weight;
          const bgAlpha = Math.max(0.12, intensity * 0.25);
          const borderAlpha = Math.max(0.2, intensity * 0.4);

          return (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-200 transition-transform hover:scale-105"
              style={{
                backgroundColor: `rgba(99, 102, 241, ${bgAlpha})`,
                border: `1px solid rgba(129, 140, 248, ${borderAlpha})`,
              }}
            >
              <span>{kw.word}</span>
              <span className="text-[10px] font-mono text-indigo-300/80">
                {Math.round(kw.weight * 100)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
