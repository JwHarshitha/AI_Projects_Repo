import React from 'react';
import { EvidenceResult } from '../../types';
import { Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface AnalysisEvidenceProps {
  evidence: EvidenceResult[];
  rawText?: string;
}

export const AnalysisEvidence: React.FC<AnalysisEvidenceProps> = ({ evidence, rawText }) => {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Analysis Evidence</h3>
            <p className="text-xs text-slate-400">
              Influential linguistic signals, sentiment cues, and aspect associations detected in the text
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          Explainable NLP
        </span>
      </div>

      <div className="space-y-3">
        {evidence.map((item, idx) => {
          const isPos = item.signal === 'positive';
          const isNeg = item.signal === 'negative';

          const badgeBg = isPos
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : isNeg
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            : 'bg-slate-500/10 text-slate-300 border-slate-500/30';

          const Icon = isPos ? CheckCircle2 : isNeg ? AlertCircle : Info;

          return (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-slate-400'}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">"{item.phrase}"</span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                      signal: {item.highlight}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.explanation}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeBg}`}>
                  {isPos ? 'Positive Signal' : isNeg ? 'Negative Signal' : 'Neutral Cue'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  weight: {Math.round(item.weight * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
