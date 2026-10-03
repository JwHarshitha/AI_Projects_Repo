import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Upload,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Zap,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { ModelInfo, EvaluationRecord } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EvaluateModelModal } from '../components/modals/EvaluateModelModal';

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  const fetchModelsData = async () => {
    setLoading(true);
    try {
      const data = await api.getModels();
      setModels(data.models);
      setRecentEvaluations(data.recent_evaluations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelsData();
  }, []);

  // Format data for comparison chart
  const comparisonData = models.map((m) => ({
    name: m.name.split(' ')[0],
    fullName: m.name,
    Accuracy: Math.round(m.accuracy * 100),
    Precision: Math.round(m.precision * 100),
    Recall: Math.round(m.recall * 100),
    F1: Math.round(m.f1_score * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <span>Model Performance & Evaluation Hub</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Compare algorithmic architectures, inspect calibrated metrics, and upload labeled datasets for empirical benchmark verification.
          </p>
        </div>

        <button
          onClick={() => setIsEvalModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Evaluation Dataset</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-36" />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Model Architecture Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {models.map((m) => {
              const isCalibrated = m.benchmark_status.includes('Calibrated');

              return (
                <div
                  key={m.id}
                  className="glass-card rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    {/* Status & Framework Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {m.framework}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isCalibrated
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                        }`}
                      >
                        {m.benchmark_status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white mb-1">{m.name}</h3>
                    <p className="text-xs text-indigo-300 font-medium mb-3">{m.task}</p>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{m.description}</p>
                  </div>

                  {/* Metrics Row */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block uppercase">Acc</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {(m.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block uppercase">Prec</span>
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          {(m.precision * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block uppercase">Rec</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {(m.recall * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block uppercase">F1</span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {(m.f1_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Latency: {m.latency}</span>
                      <span>{m.parameters}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model Comparison Visualization */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-white">Comparative Benchmark Metrics</h3>
                <p className="text-xs text-slate-400">Accuracy, Precision, Recall, and F1 score across tested models</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Empirical validation scores</span>
              </div>
            </div>

            <div className="h-72 my-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} domain={[70, 100]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-white mb-1">{payload[0]?.payload?.fullName}</p>
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
                  <Legend />
                  <Bar dataKey="Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Precision" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Recall" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="F1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Past Model Evaluations Table */}
          {recentEvaluations.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
              <h3 className="text-sm font-semibold text-white mb-1">Empirical Evaluation History</h3>
              <p className="text-xs text-slate-400 mb-4">Historical benchmark runs generated from uploaded labeled datasets</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">Model Architecture</th>
                      <th className="py-2.5 px-3">Evaluation Dataset</th>
                      <th className="py-2.5 px-3">Accuracy</th>
                      <th className="py-2.5 px-3">Precision</th>
                      <th className="py-2.5 px-3">Recall</th>
                      <th className="py-2.5 px-3">F1 Score</th>
                      <th className="py-2.5 px-3">Samples</th>
                      <th className="py-2.5 px-3 font-mono">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {recentEvaluations.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-sans font-medium text-slate-200">{ev.model_name}</td>
                        <td className="py-3 px-3 text-indigo-400">{ev.dataset_name}</td>
                        <td className="py-3 px-3 text-emerald-400">{(ev.accuracy * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3 text-slate-300">{(ev.precision * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3 text-slate-300">{(ev.recall * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3 text-amber-400 font-bold">{(ev.f1_score * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3 text-slate-400">{ev.test_samples}</td>
                        <td className="py-3 px-3 text-slate-500 font-sans">{ev.created_at.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model Evaluation Modal */}
      <EvaluateModelModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        onEvaluationComplete={() => fetchModelsData()}
      />
    </div>
  );
};
