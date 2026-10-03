import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import {
  MessageSquare,
  TrendingUp,
  Smile,
  Frown,
  CheckCircle,
  Heart,
  Layers,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardMetrics, FeedbackRecord } from '../types';
import { StatCard } from '../components/common/StatCard';
import { SentimentBadge } from '../components/common/SentimentBadge';
import { EmotionBadge } from '../components/common/EmotionBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { FeedbackDetailDrawer } from '../components/modals/FeedbackDetailDrawer';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('30d');
  const [selectedRecord, setSelectedRecord] = useState<FeedbackRecord | null>(null);

  const fetchMetrics = async (range: string) => {
    setLoading(true);
    try {
      const data = await api.getDashboardMetrics(range);
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedRange);
  }, [selectedRange]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{getTimeGreeting()}, Analyst</span>
            <span className="inline-block animate-pulse text-indigo-400">✨</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Here's what SentinelAI discovered from your latest customer feedback touchpoints.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Demo Analysis Button */}
          <button
            onClick={() => onNavigate('/analyze')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Test Single Analysis</span>
          </button>

          {/* Date Range Selector */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
            {['today', '7d', '30d', '90d', 'all'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1 rounded-lg transition ${
                  selectedRange === r
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'today'
                  ? 'Today'
                  : r === '7d'
                  ? '7 Days'
                  : r === '30d'
                  ? '30 Days'
                  : r === '90d'
                  ? '90 Days'
                  : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading || !metrics ? (
        <LoadingSkeleton rows={5} height="h-28" />
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            <StatCard
              title="Total Feedback"
              value={metrics.total_feedback.toLocaleString()}
              trend={metrics.total_trend}
              trendDirection="up"
              icon={<MessageSquare className="w-4 h-4 text-indigo-400" />}
              color="indigo"
            />
            <StatCard
              title="Positive Sentiment"
              value={`${metrics.positive_rate}%`}
              trend={metrics.positive_trend}
              trendDirection="up"
              icon={<Smile className="w-4 h-4 text-emerald-400" />}
              color="emerald"
            />
            <StatCard
              title="Negative Sentiment"
              value={`${metrics.negative_rate}%`}
              trend={metrics.negative_trend}
              trendDirection="down"
              icon={<Frown className="w-4 h-4 text-rose-400" />}
              color="rose"
            />
            <StatCard
              title="Average Confidence"
              value={`${metrics.average_confidence}%`}
              subtitle="Calibrated priors"
              icon={<CheckCircle className="w-4 h-4 text-cyan-400" />}
              color="cyan"
            />
            <StatCard
              title="Dominant Emotion"
              value={metrics.dominant_emotion}
              subtitle="Leading emotional tone"
              icon={<Heart className="w-4 h-4 text-amber-400" />}
              color="amber"
            />
            <StatCard
              title="Top Aspect"
              value={metrics.top_aspect}
              subtitle="Highest volume topic"
              icon={<Layers className="w-4 h-4 text-slate-300" />}
              color="slate"
            />
          </div>

          {/* Charts Row: Sentiment Donut & Sentiment Trend Line */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Donut Chart: Sentiment Distribution */}
            <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Sentiment Distribution</h3>
                  <span className="text-[11px] font-mono text-slate-500">Proportional Share</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregate breakdown across all processed feedback channels
                </p>
              </div>

              <div className="relative h-60 my-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.sentiment_distribution}
                      innerRadius={68}
                      outerRadius={92}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {metrics.sentiment_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0a0f1d" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs">
                              <p className="font-semibold text-white">{data.name}</p>
                              <p className="font-mono text-slate-300">
                                {data.value} reviews ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center KPI */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {metrics.positive_rate}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Positive
                  </span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60 text-center">
                {metrics.sentiment_distribution.map((item) => (
                  <div key={item.name} className="p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-medium text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Chart: Sentiment Trend */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Sentiment Trajectory Over Time</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Daily percentage distribution of positive, neutral, and negative sentiment
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/trends')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  Deep dive <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-64 my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.sentiment_trend}>
                    <XAxis
                      dataKey="date"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      domain={[0, 100]}
                      tickFormatter={(val) => `${val}%`}
                      tickLine={false}
                    />
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
                    <Line
                      type="monotone"
                      dataKey="positive"
                      name="Positive"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="neutral"
                      name="Neutral"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="negative"
                      name="Negative"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-emerald-500 rounded-full" />
                  <span>Positive Sentiment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-slate-400 rounded-full" />
                  <span>Neutral Baseline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-rose-500 rounded-full" />
                  <span>Negative Sentiment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row: Emotion Distribution & Top Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Horizontal Bar: Emotion Distribution */}
            <div className="lg:col-span-6 glass-card rounded-2xl p-5 border border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Emotion Spectrum Analysis</h3>
                  <p className="text-xs text-slate-400">
                    Prevalence of Plutchik & Ekman emotional drivers in feedback
                  </p>
                </div>
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Multivariate
                </span>
              </div>

              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.emotion_distribution}
                    layout="vertical"
                    margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                  >
                    <XAxis type="number" stroke="#475569" fontSize={11} domain={[0, 'dataMax + 5']} />
                    <YAxis dataKey="emotion" type="category" stroke="#cbd5e1" fontSize={11} tickLine={false} width={65} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs">
                              <p className="font-semibold text-white">{d.emotion}</p>
                              <p className="text-slate-300 font-mono">
                                {d.count} reviews ({d.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {metrics.emotion_distribution.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Topics / Aspects Cards */}
            <div className="lg:col-span-6 glass-card rounded-2xl p-5 border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Dominant Operational Topics</h3>
                  <p className="text-xs text-slate-400">
                    Highest frequency themes cross-referenced with sentiment polarity
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/feedback')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {metrics.top_topics.map((t) => (
                  <div
                    key={t.topic}
                    onClick={() => onNavigate(`/feedback?category=${encodeURIComponent(t.topic)}`)}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {t.topic}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">
                        {t.mentions} mentions
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span className="text-emerald-400 font-medium">{t.positive_pct}% Pos</span>
                        <span className="text-rose-400 font-medium">{t.negative_pct}% Neg</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${t.positive_pct}%` }}
                          className="bg-emerald-500 h-full"
                        />
                        <div
                          style={{ width: `${100 - t.positive_pct - t.negative_pct}%` }}
                          className="bg-slate-600 h-full"
                        />
                        <div
                          style={{ width: `${t.negative_pct}%` }}
                          className="bg-rose-500 h-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Analyzed Feedback Table */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Feedback Stream</h3>
                <p className="text-xs text-slate-400">
                  Live ingestion stream with real-time NLP classification badges
                </p>
              </div>
              <button
                onClick={() => onNavigate('/feedback')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                Open Feedback Explorer <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Feedback Snippet</th>
                    <th className="py-3 px-4 font-semibold">Sentiment</th>
                    <th className="py-3 px-4 font-semibold">Emotion</th>
                    <th className="py-3 px-4 font-semibold">Confidence</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.recent_feedback.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition group"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-200 max-w-md truncate">
                        "{item.text}"
                      </td>
                      <td className="py-3.5 px-4">
                        <SentimentBadge sentiment={item.sentiment} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <EmotionBadge emotion={item.emotion} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {Math.round(item.confidence * 100)}%
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {item.date || 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition"
                        >
                          View analysis
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Slide-over Feedback Detail Drawer */}
      <FeedbackDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};
