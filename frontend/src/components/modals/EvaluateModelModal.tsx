import React, { useState } from 'react';
import { X, Upload, Cpu, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { api } from '../../services/api';

interface EvaluateModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEvaluationComplete?: (result: any) => void;
}

export const EvaluateModelModal: React.FC<EvaluateModelModalProps> = ({
  isOpen,
  onClose,
  onEvaluationComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState('TF-IDF + Logistic Regression (Calibrated)');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleRunEvaluation = async () => {
    if (!file) {
      setError('Please select a labeled evaluation CSV file.');
      return;
    }

    setIsEvaluating(true);
    setError(null);
    try {
      const res = await api.evaluateModelFile(file, modelName);
      setEvalResult(res);
      if (onEvaluationComplete) {
        onEvaluationComplete(res);
      }
    } catch (err: any) {
      setError(err.message || 'Evaluation failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Evaluate Model on Labeled Dataset</h3>
              <p className="text-xs text-slate-400">Compute empirical Accuracy, Precision, Recall, and Confusion Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!evalResult ? (
            <>
              {/* Model selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Target Architecture
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="TF-IDF + Logistic Regression (Calibrated)">TF-IDF + Logistic Regression (Calibrated)</option>
                  <option value="Ensemble Random Forest Classifier">Ensemble Random Forest Classifier</option>
                  <option value="DistilRoBERTa Sentiment Transformer">DistilRoBERTa Sentiment Transformer</option>
                </select>
              </div>

              {/* File upload drag area */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Upload Labeled CSV (Required: 'text', 'label')
                </label>
                <label className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40">
                  <FileSpreadsheet className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-slate-200">
                    {file ? file.name : 'Choose labeled evaluation CSV'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Accepts columns: text, label (positive, neutral, negative)
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Need an evaluation dataset?</span>
                  <span className="text-indigo-400 font-mono">Use data/evaluation_sample.csv</span>
                </div>
              </div>
            </>
          ) : (
            /* Results View */
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Evaluation Succeeded</span>
                </div>
                <span className="text-xs font-mono">{evalResult.sample_count} samples validated</span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Accuracy</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {(evalResult.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Precision</span>
                  <span className="text-xl font-bold font-mono text-indigo-400">
                    {(evalResult.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Recall</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">
                    {(evalResult.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">F1 Score</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {(evalResult.f1_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Confusion Matrix Table */}
              {evalResult.confusion_matrix && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Confusion Matrix (Actual vs. Predicted)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2 px-3 text-left">Actual \ Predicted</th>
                          <th className="py-2 px-3 text-rose-400">Negative</th>
                          <th className="py-2 px-3 text-slate-300">Neutral</th>
                          <th className="py-2 px-3 text-emerald-400">Positive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evalResult.confusion_matrix.matrix.map((row: any, i: number) => (
                          <tr key={i} className="border-b border-slate-800/60 font-mono">
                            <td className="py-2 px-3 text-left font-sans font-medium text-slate-300 capitalize">
                              {row.actual}
                            </td>
                            <td className="py-2 px-3 text-slate-200 bg-slate-900/40">
                              {row.predicted_negative}
                            </td>
                            <td className="py-2 px-3 text-slate-200 bg-slate-900/40">
                              {row.predicted_neutral}
                            </td>
                            <td className="py-2 px-3 text-slate-200 bg-slate-900/40">
                              {row.predicted_positive}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            {evalResult ? 'Done' : 'Cancel'}
          </button>

          {!evalResult && (
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating || !file}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Cpu className="w-4 h-4" />
              {isEvaluating ? 'Evaluating Metrics...' : 'Run Empirical Evaluation'}
            </button>
          )}

          {evalResult && (
            <button
              onClick={() => {
                setEvalResult(null);
                setFile(null);
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              Evaluate Another File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
