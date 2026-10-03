import React, { useState, useEffect } from 'react';
import {
  TableProperties,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { FeedbackRecord } from '../types';
import { SentimentBadge } from '../components/common/SentimentBadge';
import { EmotionBadge } from '../components/common/EmotionBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { FeedbackDetailDrawer } from '../components/modals/FeedbackDetailDrawer';

export const FeedbackExplorer: React.FC = () => {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState('all');
  const [emotion, setEmotion] = useState('all');
  const [source, setSource] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<{
    sources: string[];
    categories: string[];
    emotions: string[];
  }>({ sources: [], categories: [], emotions: [] });

  const [selectedRecord, setSelectedRecord] = useState<FeedbackRecord | null>(null);

  const fetchFilters = async () => {
    try {
      const opts = await api.getFeedbackFilters();
      setFilterOptions(opts);
    } catch {
      // ignore
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getFeedback({
        search,
        sentiment,
        emotion,
        source,
        category,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        limit: 12,
      });
      setRecords(data.records);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [search, sentiment, emotion, source, category, sortBy, sortOrder, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSentiment('all');
    setEmotion('all');
    setSource('all');
    setCategory('all');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const exportCurrentViewCSV = () => {
    if (records.length === 0) return;
    const headers = ['ID', 'Text', 'Sentiment', 'Confidence', 'Emotion', 'Aspect', 'Source', 'Date'];
    const rows = records.map((r) => [
      r.id,
      `"${r.text.replace(/"/g, '""')}"`,
      r.sentiment,
      r.confidence,
      r.emotion,
      r.dominant_aspect || r.category,
      r.source,
      r.date || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SentinelAI_Feedback_Export_Page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TableProperties className="w-6 h-6 text-indigo-400" />
            <span>Feedback Explorer</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Search, filter, and inspect verified multi-channel feedback records with granular NLP classification.
          </p>
        </div>

        <button
          onClick={exportCurrentViewCSV}
          disabled={records.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Current View</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-3.5">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search feedback content, keywords, or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Sentiment Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Sentiment
            </label>
            <select
              value={sentiment}
              onChange={(e) => {
                setSentiment(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Emotion Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Emotion
            </label>
            <select
              value={emotion}
              onChange={(e) => {
                setEmotion(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Emotions</option>
              {filterOptions.emotions.map((emo) => (
                <option key={emo} value={emo}>
                  {emo}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Channel Source
            </label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Sources</option>
              {filterOptions.sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="date">Date</option>
              <option value="confidence">Confidence</option>
              <option value="sentiment">Sentiment</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} height="h-10" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title="No matching feedback found"
            description="Try relaxing your search terms or clearing the selected sentiment and category filters."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Feedback Content</th>
                  <th className="py-3 px-4 font-semibold">Sentiment</th>
                  <th className="py-3 px-4 font-semibold">Emotion</th>
                  <th className="py-3 px-4 font-semibold">Confidence</th>
                  <th className="py-3 px-4 font-semibold">Primary Aspect</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-200 max-w-sm truncate">
                      "{r.text}"
                    </td>
                    <td className="py-3.5 px-4">
                      <SentimentBadge sentiment={r.sentiment} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <EmotionBadge emotion={r.emotion} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {Math.round(r.confidence * 100)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {r.dominant_aspect || r.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{r.source}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {r.date || 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="p-1 rounded text-slate-500 group-hover:text-indigo-400 inline-block transition">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{records.length}</strong> of{' '}
            <strong className="text-white">{total}</strong> total items
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Detail Slide-over Drawer */}
      <FeedbackDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};
