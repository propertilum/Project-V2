import { useState, useEffect } from 'react';
import {
  Mail, RefreshCw, X, CheckCircle2,
} from 'lucide-react';
import { sendUserEmailVerification, reloadCurrentUser } from '../../lib/authService';

export default function VerifyEmailModal({
  isOpen,
  onClose,
  currentUser,
  onEmailVerified,
  showToast,
}) {
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    const res = await sendUserEmailVerification();
    setIsSending(false);

    if (res.success) {
      setCooldown(60);
      showToast?.(`Verification link sent to ${currentUser?.email}!`, 'success');
    } else {
      showToast?.(res.error || 'Failed to dispatch verification email.', 'warning');
      setCooldown(30);
    }
  };

  // BUG-03 FIX: Only real Firebase verification check — no bypass button
  const handleCheckStatus = async () => {
    if (isChecking) return;
    setIsChecking(true);
    const updatedUser = await reloadCurrentUser();
    setIsChecking(false);

    if (updatedUser?.emailVerified) {
      onEmailVerified?.();
      showToast?.('Email successfully verified!', 'success');
      onClose();
    } else {
      showToast?.('Verification pending. Please click the link inside your email.', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white text-center">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-lg shadow-indigo-600/20">
          <Mail className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Verify Your Email</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          We've sent a verification link to:
          <span className="block text-indigo-300 font-mono font-semibold mt-1">
            {currentUser?.email || 'your email'}
          </span>
        </p>

        {/* Benefits Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 mb-6 text-left space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Removes daily transaction throttle limits</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Enables international multi-currency settlement</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authorizes instant wallet top-ups over $1,000</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Verification…' : "I've Clicked the Verification Link"}</span>
          </button>

          <button
            onClick={handleResend}
            disabled={isSending || cooldown > 0}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : isSending ? 'Sending…' : 'Resend Verification Email'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
