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
    <div className="mb-6 animate-in fade-in duration-200">
      <div className="relative rounded-[12px] bg-[#1C1C1E] border border-[#38383A] p-4 text-[#F5F5F7]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Left Info Column */}
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-[8px] bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-[13px] text-white">
                  Verify your email address
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" />
                  Action Required
                </span>
              </div>
              <p className="text-[12px] text-[#8E8E93] leading-relaxed max-w-2xl">
                We sent a secure verification link to{' '}
                <span className="text-[#0A84FF] font-mono font-medium">{currentUser.email}</span>.
                Verify to protect your cards and access unlimited transaction limits.
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pl-12 lg:pl-0 shrink-0">
            {/* Resend Link */}
            <button
              onClick={handleResend}
              disabled={isSending || cooldown > 0}
              className="px-3 py-1.5 rounded-[8px] bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] border border-[#38383A] text-[#F5F5F7] text-[12px] font-medium transition disabled:opacity-50 flex items-center gap-1.5"
              title="Resend email link"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0A84FF] ${isSending ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend (${cooldown}s)` : isSending ? 'Sending…' : 'Resend Link'}</span>
            </button>

            {/* Check Status */}
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="px-3 py-1.5 rounded-[8px] bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white text-[12px] font-medium transition flex items-center gap-1.5"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking…' : "I've Verified"}</span>
            </button>

            {/* Dismiss */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-[#8E8E93] hover:text-white p-1.5 rounded-[8px] hover:bg-[#2C2C2E] transition ml-1"
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
