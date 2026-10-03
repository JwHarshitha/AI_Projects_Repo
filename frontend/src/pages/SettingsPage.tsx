import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Shield,
  Palette,
  Cpu,
  Database,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile Form
  const [name, setName] = useState(user?.name || 'Alex Vance');
  const [email, setEmail] = useState(user?.email || 'demo@sentinel.ai');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // AI Config
  const [aiProvider, setAiProvider] = useState(user?.ai_provider || 'hybrid');
  const [darkMode, setDarkMode] = useState(true);

  // System Data Stats
  const [systemStats, setSystemStats] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAiProvider(user.ai_provider || 'hybrid');
      setDarkMode(user.dark_mode ?? true);
    }
    api.getSettings().then((res) => {
      setSystemStats(res.data_stats);
    });
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ name, email, ai_provider: aiProvider, dark_mode: darkMode });
      setStatusMessage('Workspace preferences saved successfully.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In production calls /auth/change-password
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sentinel_token')}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Password change failed.');
      }
      setPasswordStatus('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordStatus(null), 3000);
    } catch (err: any) {
      setPasswordStatus(`Error: ${err.message}`);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear your single analysis test history? This action cannot be undone.')) {
      try {
        const res = await api.clearAnalysisHistory();
        alert(res.message);
        const updated = await api.getSettings();
        setSystemStats(updated.data_stats);
      } catch (err) {
        alert('Failed to clear history.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          <span>Platform Settings & Workspace Controls</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage your analyst profile, AI engine preferences, empirical confidence thresholds, and stored telemetry data.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Profile & Identity Section */}
      <form onSubmit={handleSaveProfile} className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm text-white">Analyst Identity & Organization</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[11px] uppercase font-semibold text-slate-400 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase font-semibold text-slate-400 block mb-1">
              Enterprise Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* AI & Model Configuration Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm text-white">AI Engine & Model Architecture Selection</h3>
        </div>

        <div className="space-y-3">
          <label className="text-xs text-slate-400 block">
            Select Active Sentiment & Emotion Inference Engine:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'hybrid',
                name: 'Sentinel Neural Hybrid',
                desc: 'Local calibrated TF-IDF + Logistic Regression with linguistic valence shifters.',
                latency: '1.2ms latency',
              },
              {
                id: 'tfidf',
                name: 'Pure TF-IDF + LogReg',
                desc: 'Standard scikit-learn pipeline with L2 regularization.',
                latency: '0.8ms latency',
              },
              {
                id: 'transformer',
                name: 'DistilRoBERTa Encoder',
                desc: '6-layer deep transformer architecture for conversational nuance.',
                latency: '42ms latency (Cloud)',
              },
            ].map((engine) => (
              <div
                key={engine.id}
                onClick={() => setAiProvider(engine.id)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition ${
                  aiProvider === engine.id
                    ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-slate-200">{engine.name}</span>
                  {aiProvider === engine.id && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">{engine.desc}</p>
                <span className="text-[10px] font-mono text-indigo-400">{engine.latency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security: Password Change */}
      <form onSubmit={handleChangePassword} className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm text-white">Security & Password Management</h3>
        </div>

        {passwordStatus && (
          <p className="text-xs text-indigo-400 font-mono">{passwordStatus}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[11px] uppercase font-semibold text-slate-400 block mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase font-semibold text-slate-400 block mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!currentPassword || !newPassword}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Data Management Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Database className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm text-white">Data Management & Cache Control</h3>
        </div>

        {systemStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Single Analyses</span>
              <span className="text-base font-bold font-mono text-white">{systemStats.single_analyses}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Datasets</span>
              <span className="text-base font-bold font-mono text-white">{systemStats.datasets}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Feedback Records</span>
              <span className="text-base font-bold font-mono text-white">{systemStats.feedback_records}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Reports</span>
              <span className="text-base font-bold font-mono text-white">{systemStats.reports}</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-300">Clear Single Analysis History</h4>
            <p className="text-[11px] text-slate-500">
              Remove cached ad-hoc test reviews without affecting batch datasets.
            </p>
          </div>
          <button
            onClick={handleClearHistory}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
