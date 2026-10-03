import React from 'react';
import { FeedbackRecord } from '../../types';
import { SentimentBadge } from '../common/SentimentBadge';
import { EmotionBadge } from '../common/EmotionBadge';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import { X, Calendar, Globe, Tag, Layers, Sparkles } from 'lucide-react';

interface FeedbackDetailDrawerProps {
  record: FeedbackRecord | null;
  onClose: () => void;
}

export const FeedbackDetailDrawer: React.FC<FeedbackDetailDrawerProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#0d1424] border-l border-slate-800 h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0d1424]/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Feedback Record #{record.id}</h3>
              <p className="text-xs text-slate-500">Comprehensive Sentiment & Linguistic Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Feedback Quote */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs uppercase font-medium text-slate-500 mb-2">Customer Feedback</p>
            <p className="text-sm text-slate-100 leading-relaxed font-sans italic">
              "{record.text}"
            </p>
          </div>

          {/* Sentiment & Emotion Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs text-slate-500 block mb-2">Overall Sentiment</span>
              <SentimentBadge sentiment={record.sentiment} size="md" />
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs text-slate-500 block mb-2">Detected Emotion</span>
              <EmotionBadge emotion={record.emotion} size="md" />
            </div>
          </div>

          {/* Model Confidence */}
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
            <ConfidenceMeter
              confidence={record.confidence}
              sentiment={record.sentiment}
              label="Classification Confidence"
            />
          </div>

          {/* Aspect Analysis */}
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Aspect Classification
              </h4>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-sm font-medium text-white">{record.dominant_aspect || record.category}</span>
              <span className="text-xs font-mono text-indigo-400">
                {Math.round((record.aspect_confidence || 0.88) * 100)}% relevance
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Ingestion Metadata
            </h4>
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date Recorded
              </span>
              <span className="font-mono text-slate-300">{record.date || 'Recent'}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Source Channel
              </span>
              <span className="text-slate-300">{record.source}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Operational Category
              </span>
              <span className="text-slate-300">{record.category}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0f1d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
