import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Layers,
  Hash,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { SingleAnalysisResponse } from '../types';
import { SentimentBadge } from '../components/common/SentimentBadge';
import { EmotionBadge } from '../components/common/EmotionBadge';
import { ConfidenceMeter } from '../components/common/ConfidenceMeter';
import { AspectCard } from '../components/analysis/AspectCard';
import { AnalysisEvidence } from '../components/analysis/AnalysisEvidence';
import { KeywordsList } from '../components/analysis/KeywordsList';

const PRESET_EXAMPLES = [
  {
    label: 'Mixed Multi-Aspect Review',
    text: 'The product quality is excellent, but delivery was extremely slow and customer support did not respond.',
  },
  {
    label: 'High-Praise Support Experience',
    text: 'Customer support was incredibly patient and resolved our enterprise billing dispute within minutes. Truly world-class service!',
  },
  {
    label: 'Critical Checkout & App Crash',
    text: 'Terrible experience. The software crashed repeatedly during checkout and our card was charged twice without confirmation.',
  },
];

const PROCESSING_STEPS = [
  'Understanding context & syntax...',
  'Detecting sentiment polarity...',
  'Identifying Plutchik emotion drivers...',
  'Extracting multi-clause aspects...',
  'Generating explainable evidence...',
];

export const SingleAnalysis: React.FC = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState<SingleAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 3) {
      setError('Please enter at least 3 characters of feedback text to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setLoadingStepIndex(0);

    // Progressive step indicator
    const stepInterval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 350);

    try {
      const data = await api.analyzeText(text.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete sentiment analysis.');
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
    }
  };

  const loadExample = (exText: string) => {
    setText(exText);
    setError(null);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <span>Analyze Feedback</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Understand the sentiment, emotion, and key drivers behind any piece of feedback using calibrated local NLP intelligence.
        </p>
      </div>

      {/* Input Panel */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Raw Customer Feedback</span>
          </label>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">Load Example:</span>
            {PRESET_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadExample(ex.text)}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste customer feedback, review, comment, survey response or any text..."
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800/90 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 p-4 placeholder-slate-500 leading-relaxed outline-none transition"
          />

          {text && (
            <button
              onClick={handleCopyText}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 transition"
              title="Copy text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>{text.length} characters</span>
            <span>•</span>
            <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  setResult(null);
                  setError(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 group"
            >
              {isAnalyzing ? (
                <>
                  <BrainCircuit className="w-4 h-4 animate-spin text-indigo-300" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
                  <span>Analyze with SentinelAI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Animated Loading State */}
        {isAnalyzing && (
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300">
                {PROCESSING_STEPS[loadingStepIndex]}
              </span>
              <span className="font-mono text-indigo-400">
                Step {loadingStepIndex + 1} of {PROCESSING_STEPS.length}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((loadingStepIndex + 1) / PROCESSING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Section */}
      {result && (
        <div className="space-y-5 animate-fade-in">
          {/* Main Primary Score Panel */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
              {/* Overall Sentiment */}
              <div className="space-y-3 pb-4 md:pb-0">
                <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
                  Overall Sentiment Classification
                </span>
                <div className="flex items-center gap-3">
                  <SentimentBadge sentiment={result.sentiment} size="lg" />
                </div>
                <p className="text-xs text-slate-500">
                  Calculated from semantic polarity vectors and valence shifting rules
                </p>
              </div>

              {/* Confidence Meter */}
              <div className="py-4 md:py-0 md:px-6">
                <ConfidenceMeter
                  confidence={result.sentiment_confidence}
                  sentiment={result.sentiment}
                  label="Sentiment Confidence"
                />
              </div>

              {/* Emotion Indicator */}
              <div className="space-y-3 pt-4 md:pt-0 md:pl-6">
                <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
                  Dominant Emotional State
                </span>
                <div className="flex items-center gap-2">
                  <EmotionBadge emotion={result.emotion} size="md" />
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-500">Emotion Confidence:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {Math.round(result.emotion_confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Aspect-Based Sentiment Analysis (ABSA) */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Aspect-Based Sentiment (ABSA)</h3>
                  <p className="text-xs text-slate-400">
                    Fine-grained sentiment isolation per functional operational aspect
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {result.aspects.length} Aspects Identified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {result.aspects.map((asp, idx) => (
                <AspectCard key={idx} aspect={asp} />
              ))}
            </div>
          </div>

          {/* Explainable AI: Analysis Evidence */}
          <AnalysisEvidence evidence={result.evidence} rawText={result.text} />

          {/* Extracted Key Drivers & Keywords */}
          <KeywordsList keywords={result.keywords} />
        </div>
      )}
    </div>
  );
};
