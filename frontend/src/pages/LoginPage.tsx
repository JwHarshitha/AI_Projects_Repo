import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@sentinel.ai');
  const [password, setPassword] = useState('Sentinel@123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@sentinel.ai');
    setPassword('Sentinel@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-4">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-xl shadow-indigo-600/20 mb-4">
            <div className="w-full h-full bg-[#070a12] rounded-[15px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SentinelAI</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            AI Sentiment Intelligence Platform
          </p>
          <p className="text-xs text-indigo-400/90 mt-1 font-medium italic">
            "Turn feedback into intelligence."
          </p>
        </div>

        {/* Login Form Box */}
        <div className="glass-card rounded-2xl p-7 border border-slate-800/90 shadow-2xl space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white">Sign in to your workspace</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access deep sentiment analytics and real-time operational signals
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@organization.com"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to SentinelAI'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fill Demo Credentials (Instant Access)</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
