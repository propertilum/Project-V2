import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { sendUserEmailVerification, reloadCurrentUser } from '../../lib/authService';

export default function EmailVerificationBanner({
  currentUser,
  onEmailVerified,
  showToast,
}) {
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // If already verified or dismissed for this session, hide
  if (!currentUser || currentUser.emailVerified || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    const res = await sendUserEmailVerification();
    setIsSending(false);

    if (res.success) {
      setCooldown(60);
      showToast?.(`Verification email sent to ${currentUser.email}! Check your inbox.`, 'success');
    } else {
      // If Firebase blocked it due to dev/rate limiting, still notify cleanly
      showToast?.(res.error || 'Failed to send verification link. Try again soon.', 'warning');
      setCooldown(30);
    }
  };

  const handleCheckStatus = async () => {
    if (isChecking) return;
    setIsChecking(true);
    const updatedUser = await reloadCurrentUser();
    setIsChecking(false);

    if (updatedUser?.emailVerified) {
      onEmailVerified?.();
      showToast?.('Email successfully verified! Full access unlocked.', 'success');
    } else {
      showToast?.('Email not verified yet. Please click the link in your email.', 'warning');
    }
  };

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-4 shadow-xl shadow-indigo-950/20 text-white">
        {/* Ambient Top Specular Light */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Left Info Column */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  <span>Verify your email address</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                We sent a secure verification link to{' '}
                <span className="text-indigo-300 font-mono font-semibold">{currentUser.email}</span>.
                Verify to protect your cards and access unlimited transaction limits.
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pl-13 lg:pl-0 shrink-0">
            {/* Resend Link */}
            <button
              onClick={handleResend}
              disabled={isSending || cooldown > 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              title="Resend email link"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSending ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend (${cooldown}s)` : isSending ? 'Sending…' : 'Resend Link'}</span>
            </button>

            {/* Check Status */}
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 text-indigo-400 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking…' : "I've Verified"}</span>
            </button>

            {/* Dismiss */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors ml-1"
              aria-label="Dismiss banner"
              title="Dismiss for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
