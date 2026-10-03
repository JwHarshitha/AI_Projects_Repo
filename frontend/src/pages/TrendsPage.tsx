import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Filter,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const TrendsPage: React.FC = () => {
  const [trendsData, setTrendsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState('all');
  const [source, setSource] = useState('all');
  const [emotion, setEmotion] = useState('all');

  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);

  useEffect(() => {
    api.getFeedbackFilters().then((opts) => {
      setCategories(opts.categories);
      setSources(opts.sources);
      setEmotions(opts.emotions);
    });
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const data = await api.getTrends({ category, source, emotion });
      setTrendsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [category, source, emotion]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          <span>Temporal Trends & Longitudinal Analysis</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Investigate sentiment shifts over time, emotional variance trajectories, and statistical anomaly spikes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filter Trends:</span>
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Emotions</option>
            {emotions.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} height="h-32" />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Anomaly Alerts Section */}
          {trendsData?.anomalies && trendsData.anomalies.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Statistical Anomaly Signal Detected</span>
              </div>
              <div className="space-y-2">
                {trendsData.anomalies.map((anom: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <p className="text-slate-200">{anom.message}</p>
                    <span className="text-[11px] font-mono text-amber-300/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      Recommendation: {anom.recommendation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment Over Time Area Chart */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
            <h3 className="text-sm font-semibold text-white mb-1">Sentiment Volume Composition</h3>
            <p className="text-xs text-slate-400 mb-4">Volume distribution across dates</p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData?.timeline || []}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-white mb-1">{label}</p>
                            {payload.map((p: any) => (
                              <div key={p.name} className="flex justify-between gap-4 font-mono">
                                <span style={{ color: p.color }}>{p.name}:</span>
                                <span className="text-white font-bold">{p.value}%</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    name="Positive"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    name="Neutral"
                    stackId="1"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    name="Negative"
                    stackId="1"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emotion Trajectory Line Chart */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
            <h3 className="text-sm font-semibold text-white mb-1">Emotion Dynamics Trajectory</h3>
            <p className="text-xs text-slate-400 mb-4">Progression of primary emotional signals over time</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData?.emotion_timeline || []}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-white mb-1">{label}</p>
                            {payload.map((p: any) => (
                              <div key={p.name} className="flex justify-between gap-4 font-mono">
                                <span style={{ color: p.color }}>{p.name}:</span>
                                <span className="text-white font-bold">{p.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="Joy" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Trust" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Anger" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Sadness" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Joy</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /><span>Trust</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span>Anger</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /><span>Sadness</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
