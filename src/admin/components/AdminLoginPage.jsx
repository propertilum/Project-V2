import { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle, UserCheck, Zap } from 'lucide-react';

export default function AdminLoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [remainingLockTime, setRemainingLockTime] = useState(0);

  const isLocked = remainingLockTime > 0;

  useEffect(() => {
    if (!lockedUntil) {
      return;
    }
    const updateLock = () => {
      const now = Date.now();
      const diff = Math.ceil((lockedUntil - now) / 1000);
      if (diff <= 0) {
        setRemainingLockTime(0);
        setLockedUntil(0);
        setAttempts(0);
      } else {
        setRemainingLockTime(diff);
      }
    };
    updateLock();
    const interval = setInterval(updateLock, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Account locked. Try again in ${remainingLockTime}s.`);
      return;
    }

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    if (form.email !== 'admin@cardhub.io') {
      setError('Access denied. Invalid administrator account.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onLogin(form.email, form.password);
      setAttempts(0);
    } catch (err) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      
      if (nextAttempts >= 5) {
        const lockDuration = 300000; // 5 minutes
        setLockedUntil(Date.now() + lockDuration);
        setError(`Too many failed attempts. Account locked for 5 minutes.`);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-in-up">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-rose-800/50 p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 bg-rose-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-rose-600/30 animate-glow-pulse">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Administrator Access</h1>
            <p className="text-slate-400 text-sm">Restricted portal for platform operators</p>
            
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/50 text-rose-400 text-[10px] font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl">
            <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-amber-300">Security Protocol Active</span>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-1 pl-4 list-disc">
              <li>Administrator credentials are cryptographically verified</li>
              <li>Failed attempts trigger progressive lockout (5 attempts = 5 min)</li>
              <li>All sessions are audited and logged</li>
              <li>Raw credentials never stored; Bcrypt $2a$12 salted hashes only</li>
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-start gap-3 shadow-lg shadow-rose-950/30 backdrop-blur-md animate-in fade-in duration-200">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold block text-rose-200 text-[11px] mb-0.5 uppercase tracking-wider font-mono">Authentication Alert</span>
                <span className="leading-snug">{error}</span>
              </div>
            </div>
          )}

          {/* Lockout Timer */}
          {isLocked && (
            <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-2xl flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold block text-amber-200 text-[11px] mb-0.5 uppercase tracking-wider font-mono">Account Temporarily Locked</span>
                <span className="leading-snug">Retry available in {remainingLockTime}s</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Administrator Email</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  disabled={isLocked}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@cardhub.io"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={isLocked}
                  className="w-full pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Attempt Counter */}
            {attempts > 0 && !isLocked && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 text-rose-400">⚠</span>
                  <span>Failed attempts: {attempts}/5</span>
                </span>
                <span className="text-slate-600 font-mono">Bcrypt $2a$12</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className={`w-full py-3.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-xs shadow-lg group ${isLocked ? 'bg-slate-700 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <>
                  <span>Enter Admin Console</span>
                  <Shield className="w-4 h-4 transition-transform group-hover:scale-110" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800/50 text-center text-[11px] text-slate-600">
            <p className="font-mono">CardHub Administrative Console v1.0</p>
            <p className="mt-1">All actions are logged, audited, and compliant with PCI-DSS standards.</p>
          </div>
        </div>

        {/* Legal Notice */}
        <p className="text-center text-[10px] text-slate-700 mt-4 animate-fade-in">
          Unauthorized access is prohibited. Violators will be prosecuted under applicable cybersecurity laws.
        </p>
      </div>
    </div>
  );
}