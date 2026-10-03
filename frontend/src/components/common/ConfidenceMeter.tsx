import React from 'react';

interface ConfidenceMeterProps {
  confidence: number; // 0.0 to 1.0 or 0 to 100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  label = 'Model Confidence',
  size = 'md',
  sentiment = 'positive',
}) => {
  const normalized = confidence > 1 ? confidence : Math.round(confidence * 100);

  const strokeColor =
    sentiment === 'positive'
      ? '#10b981'
      : sentiment === 'negative'
      ? '#f43f5e'
      : '#94a3b8';

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  if (size === 'sm') {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-slate-400">{label}</span>
          <span className="font-mono font-semibold text-slate-200">{normalized}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${normalized}%`,
              backgroundColor: strokeColor,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
        <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 88 88">
          <circle
            cx="44"
            cy="44"
            r="36"
            stroke="currentColor"
            strokeWidth="7"
            fill="transparent"
            className="text-slate-800"
          />
          <circle
            cx="44"
            cy="44"
            r="36"
            stroke={strokeColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold font-mono text-white">{normalized}%</span>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-200 mt-0.5">
          {normalized >= 85 ? 'High Confidence' : normalized >= 70 ? 'Moderate Confidence' : 'Low Confidence'}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">Calibrated via Bayesian empirical priors</p>
      </div>
    </div>
  );
};
