import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const TOAST_THEMES = {
  success: {
    accentColor: '#34C759',
    iconColor: 'text-[#34C759]',
    badgeBg: 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30',
    title: 'Success',
    icon: CheckCircle2,
  },
  error: {
    accentColor: '#FF453A',
    iconColor: 'text-[#FF453A]',
    badgeBg: 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30',
    title: 'System Alert',
    icon: XCircle,
  },
  warning: {
    accentColor: '#FF9F0A',
    iconColor: 'text-[#FF9F0A]',
    badgeBg: 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30',
    title: 'Notice',
    icon: AlertTriangle,
  },
  info: {
    accentColor: '#0A84FF',
    iconColor: 'text-[#0A84FF]',
    badgeBg: 'bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/30',
    title: 'CardHub',
    icon: Info,
  },
};

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  const [progress, setProgress] = useState(100);
  const [prevMessage, setPrevMessage] = useState(message);
  const [isExiting, setIsExiting] = useState(false);

  if (message !== prevMessage) {
    setPrevMessage(message);
    setProgress(100);
    setIsExiting(false);
  }

  const triggerClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
      setIsExiting(false);
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!message) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        triggerClose();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [message, duration, triggerClose]);

  if (!message && !isExiting) return null;

  const config = TOAST_THEMES[type] || TOAST_THEMES.success;
  const IconComponent = config.icon;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full px-4 sm:px-0 pointer-events-none select-none transition-all duration-300">
      <div
        className={`pointer-events-auto relative overflow-hidden bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[12px] p-3.5 border border-[#38383A] shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex flex-col gap-2.5 ${
          isExiting ? 'animate-toast-out' : 'animate-toast-in'
        }`}
        role="alert"
      >
        {/* Content Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            {/* macOS glyph */}
            <div className={`w-6 h-6 rounded-[6px] bg-[#2C2C2E] flex items-center justify-center shrink-0 border border-[#38383A] ${config.iconColor} mt-0.5`}>
              <IconComponent className="w-3.5 h-3.5" />
            </div>

            {/* Message Body */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[10px] uppercase font-mono font-medium px-1.5 py-0.2 rounded-full border ${config.badgeBg}`}>
                  {config.title}
                </span>
                <span className="text-[10px] text-[#8E8E93] font-mono">Now</span>
              </div>
              <p className="text-[13px] font-medium text-[#F5F5F7] leading-snug break-words">
                {message}
              </p>
            </div>
          </div>

          {/* Dismiss Button */}
          {onClose && (
            <button
              onClick={triggerClose}
              className="text-[#8E8E93] hover:text-white p-1 rounded-[6px] hover:bg-[#2C2C2E] transition active:scale-[0.98] shrink-0"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hairline countdown bar */}
        <div className="w-full bg-[#2C2C2E] h-[1.5px] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-75 ease-linear rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: config.accentColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
