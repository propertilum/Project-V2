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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1C1C1E] border border-[#38383A] rounded-[16px] overflow-hidden p-6 text-white text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-[#8E8E93] hover:text-white rounded-[8px] hover:bg-[#2C2C2E] transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="w-12 h-12 rounded-[12px] bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center mx-auto mb-3.5 text-[#0A84FF]">
          <Mail className="w-6 h-6" />
        </div>

        <h3 className="text-[17px] font-semibold text-white mb-1">Verify Your Email</h3>
        <p className="text-[12px] text-[#8E8E93] mb-5 leading-relaxed">
          We've sent a verification link to:
          <span className="block text-[#0A84FF] font-mono font-medium mt-1">
            {currentUser?.email || 'your email'}
          </span>
        </p>

        {/* Benefits Box */}
        <div className="bg-[#2C2C2E] border border-[#38383A] rounded-[8px] p-3.5 mb-5 text-left space-y-2 text-[12px] text-[#F5F5F7]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
            <span>Removes daily transaction throttle limits</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
            <span>Enables international multi-currency settlement</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
            <span>Authorizes instant wallet top-ups over $1,000</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium rounded-[8px] text-[13px] flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Verification…' : "I've Clicked the Verification Link"}</span>
          </button>

          <button
            onClick={handleResend}
            disabled={isSending || cooldown > 0}
            className="w-full py-2 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] font-medium rounded-[8px] text-[12px] border border-[#38383A] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mail className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : isSending ? 'Sending…' : 'Resend Verification Email'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
