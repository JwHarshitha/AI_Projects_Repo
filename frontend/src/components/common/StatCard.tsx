import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  comparison?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: 'emerald' | 'rose' | 'indigo' | 'amber' | 'cyan' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendDirection = 'neutral',
  comparison = 'vs previous period',
  icon,
  subtitle,
  color = 'indigo',
}) => {
  const isUp = trendDirection === 'up';
  const isDown = trendDirection === 'down';

  const badgeColor = isUp
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : isDown
    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    : 'text-slate-400 bg-slate-500/10 border-slate-500/20';

  const iconBg = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  }[color];

  return (
    <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800/80 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</span>
            {trend && (
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
                {isUp && <ArrowUpRight className="w-3 h-3" />}
                {isDown && <ArrowDownRight className="w-3 h-3" />}
                {!isUp && !isDown && <Minus className="w-3 h-3" />}
                {trend}
              </span>
            )}
          </div>
          {comparison && <p className="mt-1 text-xs text-slate-500">{comparison}</p>}
          {subtitle && <p className="mt-1 text-xs text-indigo-400/90 font-medium">{subtitle}</p>}
        </div>

        {icon && (
          <div className={`p-2.5 rounded-lg border ${iconBg} transition-transform group-hover:scale-105 duration-200`}>
            {icon}
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
