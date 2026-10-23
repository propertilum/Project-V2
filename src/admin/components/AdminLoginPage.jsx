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
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center p-4 font-sans text-[#F5F5F7] relative">
      <div className="w-full max-w-md relative">
        <div className="bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-[#38383A] p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#FF453A] rounded-[12px] flex items-center justify-center text-white font-semibold">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-[20px] font-semibold text-white tracking-tight mb-1">Administrator Access</h1>
            <p className="text-[#8E8E93] text-[13px]">Restricted portal for platform operators</p>
            
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] text-[11px] font-medium">
              <UserCheck className="w-3.5 h-3.5" />
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-3.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px]">
            <div className="flex items-center gap-2 text-[11px] text-[#FF9F0A] mb-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-semibold">Security Protocol Active</span>
            </div>
            <ul className="text-[11px] text-[#8E8E93] space-y-1 pl-3.5 list-disc">
              <li>Administrator credentials are cryptographically verified</li>
              <li>Failed attempts trigger progressive lockout (5 attempts = 5 min)</li>
              <li>All sessions are audited and logged</li>
              <li>Raw credentials never stored; Bcrypt salted hashes only</li>
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-5 p-3 bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] text-[12px] rounded-[8px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold block text-[11px] uppercase tracking-wider">Authentication Alert</span>
                <span className="leading-snug text-white/90">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
            <div>
              <label className="block font-medium text-[#8E8E93] mb-1.5 text-[12px]">Admin Email</label>
              <input
                type="email"
                required
                disabled={isLocked}
                placeholder="admin@cardhub.io"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] focus:border-[#FF453A] rounded-[8px] text-[13px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#FF453A] transition disabled:opacity-50 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-[#8E8E93] mb-1.5 text-[12px]">Admin Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 pr-10 py-2 bg-[#2C2C2E] border border-[#38383A] focus:border-[#FF453A] rounded-[8px] text-[13px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#FF453A] transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-2.5 bg-[#FF453A] hover:bg-[#D70015] active:scale-[0.98] text-white font-medium rounded-[8px] transition disabled:opacity-50 text-[13px] mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying…</span>
                </>
              ) : isLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Locked ({remainingLockTime}s)</span>
                </>
              ) : (
                <span>Authenticate to Admin Console</span>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
