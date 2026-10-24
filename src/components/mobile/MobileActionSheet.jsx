import { useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';

export default function MobileActionSheet({
  isOpen,
  onClose,
  title = 'Options',
  subtitle,
  options = [],
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-backdrop-in"
        onClick={onClose}
      />

      {/* Sheet Box */}
      <div className="relative bg-[#1C1C1E] text-[#F5F5F7] rounded-t-[24px] w-full max-w-lg shadow-2xl border-t border-[#38383A] overflow-hidden z-10 animate-sheet-up flex flex-col pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* iOS Drag Indicator */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#38383A]/60">
          <div>
            <h3 className="font-semibold text-sm text-[#F5F5F7]">{title}</h3>
            {subtitle && <p className="text-[11px] text-[#8E8E93] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[8px] text-[#8E8E93] hover:text-[#F5F5F7] active:bg-[#2C2C2E] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-3 space-y-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  opt.onClick?.();
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-[14px] bg-[#2C2C2E]/60 border border-[#38383A]/80 hover:border-[#48484A] active:scale-[0.98] transition-all text-left group ${opt.className || ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 border border-white/5 ${opt.bg || 'bg-[#0A84FF]/15'} ${opt.color || 'text-[#0A84FF]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#F5F5F7] group-hover:text-white flex items-center gap-2">
                      <span>{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <p className="text-[11px] text-[#8E8E93] mt-0.5 leading-snug line-clamp-1">
                        {opt.description}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#8E8E93] group-hover:text-white shrink-0 ml-2" />
              </button>
            );
          })}
        </div>

        {/* Cancel Button */}
        <div className="px-3 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-[12px] bg-[#2C2C2E] text-[#8E8E93] hover:text-[#F5F5F7] font-medium text-xs active:scale-[0.98] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
