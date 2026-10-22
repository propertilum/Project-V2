import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const TOAST_THEMES = {
  success: {
    border: 'border-emerald-500/40 shadow-emerald-950/40',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    title: 'Success',
    icon: CheckCircle2,
  },
  error: {
    border: 'border-rose-500/40 shadow-rose-950/40',
    iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-500/20',
    bar: 'bg-gradient-to-r from-rose-500 to-red-400',
    badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    title: 'System Alert',
    icon: XCircle,
  },
  warning: {
    border: 'border-amber-500/40 shadow-amber-950/40',
    iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-amber-500/20',
    bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    title: 'Notice',
    icon: AlertTriangle,
  },
  info: {
    border: 'border-indigo-500/40 shadow-indigo-950/40',
    iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 shadow-indigo-500/20',
    bar: 'bg-gradient-to-r from-indigo-500 to-sky-400',
    badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    title: 'CardHub Feed',
    icon: Info,
  },
};

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  const [progress, setProgress] = useState(100);
  const [prevMessage, setPrevMessage] = useState(message);

  if (message !== prevMessage) {
    setPrevMessage(message);
    setProgress(100);
  }

  useEffect(() => {
    if (!message) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [message, duration]);

  if (!message) return null;

  const config = TOAST_THEMES[type] || TOAST_THEMES.success;
  const IconComponent = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none select-none transition-all duration-300">
      <div
        className={`pointer-events-auto relative overflow-hidden bg-slate-950/90 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border ${config.border} flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200 transition-all`}
        role="alert"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Content Row */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3 min-w-0">
            {/* Glowing Icon Badge */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${config.iconBg} shadow-sm mt-0.5`}>
              <IconComponent className="w-4 h-4" />
            </div>

            {/* Message Body */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
                  {config.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
              </div>
              <p className="text-xs font-semibold text-slate-100 leading-snug break-words">
                {message}
              </p>
            </div>
          </div>

          {/* Dismiss Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-all shrink-0 mt-0.5"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Countdown Progress Bar */}
        <div className="w-full bg-slate-800/60 h-1 rounded-full overflow-hidden relative mt-1">
          <div
            className={`h-full ${config.bar} transition-all duration-75 ease-linear rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
