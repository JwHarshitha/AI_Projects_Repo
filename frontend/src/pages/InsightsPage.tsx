import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { InsightsData } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const InsightsPage: React.FC = () => {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await api.getInsights();
      setInsightsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Lightbulb className="w-6 h-6 text-indigo-400" />
          <span>AI Business Insights</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Algorithmic synthesis transforming raw sentiment distributions into high-conviction strategic and operational intelligence.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-32" />
      ) : !insightsData || !insightsData.has_enough_data ? (
        <EmptyState
          icon={<ShieldAlert className="w-8 h-8 text-amber-400" />}
          title="Not enough data to generate a reliable insight"
          description="SentinelAI requires a minimum threshold of analyzed customer records to compute statistically valid momentum signals and emerging issue alerts."
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insightsData.insights.map((item, idx) => {
              const isPositive = item.type === 'positive_momentum';
              const isNegative = item.type === 'negative_signal';

              const badgeColor = isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';

              const Icon = isPositive ? TrendingUp : isNegative ? AlertOctagon : Compass;

              return (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor} flex items-center gap-1.5`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.badge}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Impact: <strong className="text-slate-300">{item.impact}</strong>
                      </span>
                    </div>

                    <h4 className="font-semibold text-base text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-semibold">{item.metric}</span>
                    <span className={isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-indigo-400'}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Executive Summary */}
          {insightsData.executive_summary && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">AI Executive Summary</h3>
                  <p className="text-xs text-slate-400">
                    High-level synthesis for department leads and product leadership
                  </p>
                </div>
              </div>

              {/* Overall distribution pill */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Baseline Sentiment Balance
                </span>
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-800/40">
                  {insightsData.executive_summary.overall_sentiment}
                </span>
              </div>

              {/* Major Positive & Major Negative Themes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Positive themes */}
                <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Major Positive Themes</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {insightsData.executive_summary.major_positive_themes.map((th, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">{th}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Negative themes */}
                <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Major Friction Themes</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {insightsData.executive_summary.major_negative_themes.map((th, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">{th}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Emerging Issues & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                    Emerging Friction Patterns
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {insightsData.executive_summary.emerging_issues.map((iss, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">{iss}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide block">
                    Actionable Recommendations
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {insightsData.executive_summary.actionable_recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
