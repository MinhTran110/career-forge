import React, { useState } from 'react';
import { loginUser, registerUser, setAuthToken } from '@/services/api';
import { User } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChanged: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        await registerUser(email, password, fullName);
      }
      await loginUser(email, password);
      onUserChanged();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = async (accEmail: string, accPass: string) => {
    try {
      setLoading(true);
      setError(null);
      await loginUser(accEmail, accPass);
      onUserChanged();
      onClose();
    } catch (err: any) {
      setError('Could not switch account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>👤</span>
              <span>Candidate Account & Session</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active User: <span className="text-sky-400 font-semibold">{currentUser?.email || 'Guest Mode'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Switch Profiles */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Switch Candidate Profile:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickSwitch('alex.engineer@careerforge.dev', 'SecurePassword123!')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-[11px] font-semibold text-slate-300 hover:text-white transition-all text-left truncate cursor-pointer"
            >
              💼 Alex (Senior AI)
            </button>
            <button
              onClick={() => handleQuickSwitch('minh.platform@careerforge.dev', 'SecurePassword123!')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-[11px] font-semibold text-slate-300 hover:text-white transition-all text-left truncate cursor-pointer"
            >
              🚀 Minh (Full-Stack)
            </button>
          </div>
        </div>

        {/* Form Tab */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === 'register'
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Senior Engineer"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@careerforge.dev"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white outline-none"
            />
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                setAuthToken(null);
                onUserChanged();
                onClose();
              }}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Sign Out
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
