import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../services/api';
import { Dataset, BatchResults } from '../types';
import { StatCard } from '../components/common/StatCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const BatchAnalysis: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResults | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDatasets = async () => {
    try {
      const list = await api.listDatasets();
      setDatasets(list);
      // Auto-select first ready dataset if none selected
      if (!selectedDataset && list.length > 0) {
        const readyDs = list.find((d) => d.status === 'ready') || list[0];
        handleSelectDataset(readyDs);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleSelectDataset = async (ds: Dataset) => {
    setSelectedDataset(ds);
    setError(null);
    if (ds.status === 'ready') {
      try {
        const results = await api.getBatchResults(ds.id);
        setBatchResults(results);
      } catch (err: any) {
        setError(err.message || 'Failed to load batch results.');
      }
    } else {
      setBatchResults(null);
      if (ds.status === 'processing') {
        pollStatus(ds.id);
      }
    }
  };

  const pollStatus = (datasetId: number) => {
    setIsProcessing(true);
    const interval = setInterval(async () => {
      try {
        const status = await api.getDatasetStatus(datasetId);
        setProgress(status.progress);
        if (status.status === 'ready') {
          clearInterval(interval);
          setIsProcessing(false);
          const results = await api.getBatchResults(datasetId);
          setBatchResults(results);
          fetchDatasets();
        } else if (status.status === 'error') {
          clearInterval(interval);
          setIsProcessing(false);
          setError('Batch processing encountered an error.');
        }
      } catch {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 1000);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const newDataset = await api.uploadDataset(file);
      setSelectedDataset(newDataset);
      setBatchResults(null);
      await fetchDatasets();
    } catch (err: any) {
      setError(err.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!selectedDataset) return;
    setIsProcessing(true);
    setProgress(5);
    try {
      await api.triggerBatchAnalysis(selectedDataset.id);
      pollStatus(selectedDataset.id);
    } catch (err: any) {
      setError(err.message || 'Failed to start batch analysis.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
          <span>Batch CSV Analysis</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Ingest large feedback datasets, detect columns automatically, and execute sentiment and emotion modeling across thousands of records.
        </p>
      </div>

      {/* Upload & Dataset Selector Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Drag and drop upload card */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-slate-800/80">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">
              {isUploading ? 'Uploading & parsing dataset...' : 'Drop your CSV here, or browse files'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Auto-detects <span className="font-mono text-slate-400">text</span>,{' '}
              <span className="font-mono text-slate-400">date</span>,{' '}
              <span className="font-mono text-slate-400">source</span>, and{' '}
              <span className="font-mono text-slate-400">category</span> columns.
            </p>
          </div>

          {/* Active Dataset Inspection Bar */}
          {selectedDataset && (
            <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{selectedDataset.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {selectedDataset.row_count} rows
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span>Text: <strong className="text-indigo-400">{selectedDataset.detected_columns.text_column || 'text'}</strong></span>
                    <span>•</span>
                    <span>Date: <strong className="text-indigo-400">{selectedDataset.detected_columns.date_column || 'date'}</strong></span>
                    <span>•</span>
                    <span>Category: <strong className="text-indigo-400">{selectedDataset.detected_columns.category_column || 'category'}</strong></span>
                  </div>
                </div>

                {selectedDataset.status !== 'ready' && !isProcessing && (
                  <button
                    onClick={handleTriggerAnalysis}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Batch Analysis</span>
                  </button>
                )}
              </div>

              {/* Progress bar during processing */}
              {isProcessing && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-indigo-300 animate-pulse">
                      Analyzing feedback batches...
                    </span>
                    <span className="font-mono text-indigo-400">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Background asynchronous workers active. Interface remains responsive.
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Existing Datasets List */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-slate-800/80 flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-1">Uploaded Datasets</h3>
          <p className="text-xs text-slate-400 mb-4">Select a batch to inspect aggregated results</p>

          <div className="space-y-2 max-h-72 overflow-y-auto flex-1">
            {datasets.map((ds) => {
              const isSelected = selectedDataset?.id === ds.id;
              const isReady = ds.status === 'ready';

              return (
                <div
                  key={ds.id}
                  onClick={() => handleSelectDataset(ds)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="truncate">{ds.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isReady
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {ds.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 mt-1 font-mono text-[11px]">
                    <span>{ds.row_count} records</span>
                    <span>{ds.created_at.slice(0, 10)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Batch Results View */}
      {batchResults && (
        <div className="space-y-5 animate-fade-in">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <StatCard
              title="Total Records"
              value={batchResults.total_records.toLocaleString()}
              color="indigo"
            />
            <StatCard
              title="Positive Appraisals"
              value={`${batchResults.positive_pct}%`}
              subtitle={`${batchResults.positive_count} records`}
              color="emerald"
            />
            <StatCard
              title="Neutral Sentiments"
              value={`${batchResults.neutral_pct}%`}
              subtitle={`${batchResults.neutral_count} records`}
              color="slate"
            />
            <StatCard
              title="Negative Friction"
              value={`${batchResults.negative_pct}%`}
              subtitle={`${batchResults.negative_count} records`}
              color="rose"
            />
            <StatCard
              title="Average Confidence"
              value={`${Math.round(batchResults.average_confidence * 100)}%`}
              subtitle="Calibrated"
              color="cyan"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Sentiment by Category Bar */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-5 border border-slate-800/80">
              <h3 className="text-sm font-semibold text-white mb-0.5">Sentiment Polarity by Category</h3>
              <p className="text-xs text-slate-400 mb-4">Volume comparison of positive vs negative feedback</p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={batchResults.category_distribution}>
                    <XAxis dataKey="category" stroke="#475569" fontSize={11} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
                              <p className="font-semibold text-white">{label}</p>
                              <p className="text-emerald-400 font-mono">Positive: {payload[0]?.value}</p>
                              <p className="text-rose-400 font-mono">Negative: {payload[1]?.value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="positive" name="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="negative" name="Negative" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Positive & Negative Themes */}
            <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Dominant Polar Drivers</h3>
                <p className="text-xs text-slate-400">Leading contributors to customer delight and friction</p>
              </div>

              {/* Positive Drivers */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Top Positive Highlights</span>
                </div>
                <div className="space-y-1.5">
                  {batchResults.top_positive_topics.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-200">{t.topic}</span>
                      <span className="text-[11px] font-mono text-emerald-400">{t.share}% share</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Negative Drivers */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Top Negative Friction Points</span>
                </div>
                <div className="space-y-1.5">
                  {batchResults.top_negative_topics.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-200">{t.topic}</span>
                      <span className="text-[11px] font-mono text-rose-400">{t.share}% share</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
