import { useEffect, useState, useRef } from 'react';
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

export default function Toast({ id, message, type = 'success', onClose, duration = 3500 }) {
  const [isExiting, setIsExiting] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const prevIdRef = useRef(id);
  const prevMessageRef = useRef(message);

  // If a new notification message or id arrives while mounted, cleanly reset state & animation
  useEffect(() => {
    if (message && (id !== prevIdRef.current || message !== prevMessageRef.current)) {
      prevIdRef.current = id;
      prevMessageRef.current = message;
      setIsExiting(false);
      setAnimKey((k) => k + 1);
    }
  }, [id, message]);

  // Safety fallback: guarantees dismiss if browser/tab throttling disrupts onAnimationEnd
  useEffect(() => {
    if (!isExiting) return;
    const fallbackTimer = setTimeout(() => {
      onClose?.();
    }, 380);
    return () => clearTimeout(fallbackTimer);
  }, [isExiting, onClose]);

  if (!message && !isExiting) return null;

  const handleProgressComplete = () => {
    if (isExiting) return;
    // Graceful 60ms pause after countdown line reaches 0% so completion is crisp and fully perceived
    setTimeout(() => {
      setIsExiting(true);
    }, 60);
  };

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
  };

  const handleCardAnimationEnd = (e) => {
    // Only respond to animations ending on the card itself, not child elements
    if (e.target !== e.currentTarget) return;
    if (isExiting) {
      onClose?.();
    }
  };

  const config = TOAST_THEMES[type] || TOAST_THEMES.success;
  const IconComponent = config.icon;

  return (
    <div className="fixed top-3 inset-x-0 mx-auto w-[calc(100%-1.25rem)] max-w-md sm:w-full sm:max-w-sm sm:right-5 sm:left-auto sm:top-5 z-50 pointer-events-none select-none">
      <div
        className={`toast-card pointer-events-auto relative overflow-hidden bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[12px] p-3.5 border border-[#38383A] shadow-[0_12px_36px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)] flex flex-col gap-2.5 transition-[border-color,box-shadow] duration-200 hover:border-[#48484A] ${
          isExiting ? 'animate-toast-out' : 'animate-toast-in'
        }`}
        onAnimationEnd={handleCardAnimationEnd}
        role="alert"
      >
        {/* Content Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            {/* macOS glyph */}
            <div className={`w-6 h-6 rounded-[6px] bg-[#2C2C2E] flex items-center justify-center shrink-0 border border-[#38383A] ${config.iconColor} mt-0.5 shadow-xs`}>
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
              onClick={handleDismiss}
              className="text-[#8E8E93] hover:text-white p-1 rounded-[6px] hover:bg-[#2C2C2E] transition active:scale-[0.94] shrink-0"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hairline countdown bar (hardware-accelerated GPU scaleX, pauses on hover) */}
        <div className="w-full bg-[#2C2C2E]/80 h-[2px] rounded-full overflow-hidden">
          <div
            key={animKey}
            className="h-full w-full rounded-full toast-progress-bar"
            style={{
              backgroundColor: config.accentColor,
              '--toast-duration': `${duration}ms`,
            }}
            onAnimationEnd={(e) => {
              e.stopPropagation();
              handleProgressComplete();
            }}
          />
        </div>
      </div>
    </div>
  );
}
