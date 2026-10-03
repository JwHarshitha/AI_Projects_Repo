import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { ReportItem, Dataset } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | undefined>(undefined);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.listReports();
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
      const dsList = await api.listDatasets();
      setDatasets(dsList.filter((d) => d.status === 'ready'));
      if (dsList.length > 0) {
        setSelectedDatasetId(dsList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    if (!newTitle.trim()) return;
    setIsGenerating(true);
    try {
      const report = await api.createReport(newTitle.trim(), selectedDatasetId);
      setReports([report, ...reports]);
      setSelectedReport(report);
      setShowGenerateModal(false);
      setNewTitle('');
    } catch (err) {
      alert('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedReport) return;
    window.location.href = `/api/reports/${selectedReport.id}/export-csv`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Executive Reports & Intelligence Briefs</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Generate and export comprehensive intelligence dossiers with sentiment distributions, friction summaries, and data-backed recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} height="h-32" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reports Sidebar List */}
          <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-slate-800/80 space-y-3 no-print">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Published Intelligence Briefs
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="truncate">{rep.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{rep.metrics_json?.dataset_size || 120} records</span>
                      <span>{rep.created_at.slice(0, 10)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Report Document View */}
          <div className="lg:col-span-8">
            {selectedReport ? (
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800/80 space-y-6">
                {/* Document Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>SENTINELAI INTELLIGENCE REPORT #{selectedReport.id}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {selectedReport.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>Generated: {selectedReport.created_at.slice(0, 10)}</span>
                      <span>•</span>
                      <span>Dataset: {selectedReport.metrics_json?.dataset_name || 'Customer Omnichannel Batch'}</span>
                    </p>
                  </div>

                  {/* Export action buttons */}
                  <div className="flex items-center gap-2 no-print flex-shrink-0">
                    <button
                      onClick={handleDownloadCSV}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Download CSV</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Executive Summary & Dataset Scope
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-200 leading-relaxed">
                    {selectedReport.summary}
                  </div>
                </div>

                {/* Key Metrics Grid */}
                {selectedReport.metrics_json && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block uppercase">Analyzed Records</span>
                      <span className="text-xl font-bold font-mono text-white">
                        {selectedReport.metrics_json.dataset_size?.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block uppercase">Positive Share</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        {selectedReport.metrics_json.sentiment_distribution?.positive}%
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block uppercase">Negative Friction</span>
                      <span className="text-xl font-bold font-mono text-rose-400">
                        {selectedReport.metrics_json.sentiment_distribution?.negative}%
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block uppercase">Model Confidence</span>
                      <span className="text-xl font-bold font-mono text-cyan-400">
                        {Math.round((selectedReport.metrics_json.average_confidence || 0.91) * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Thematic Synthesis Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Positive themes */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Major Positive Highlights</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedReport.positive_themes.map((th, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          <span>{th}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Negative themes */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/25 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Primary Friction Drivers</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedReport.negative_themes.map((th, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                          <span>{th}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Top Functional Aspects Breakdown */}
                {selectedReport.metrics_json?.top_aspects && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Aspect-Level Sentiment Distribution
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {selectedReport.metrics_json.top_aspects.map((asp: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
                          <span className="font-semibold text-white block truncate">{asp.aspect}</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {asp.mentions} mentions ({asp.share}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center text-slate-500 text-xs">
                Select an executive report from the sidebar or generate a new brief.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-base text-white">Generate Intelligence Report</h3>
            <p className="text-xs text-slate-400">
              Select an analyzed dataset to synthesize sentiment KPIs, themes, and actionable findings.
            </p>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Q2 Customer Operations Analysis Brief"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                Source Dataset
              </label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.row_count} rows)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || !newTitle.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
              >
                {isGenerating ? 'Synthesizing...' : 'Generate Brief'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
