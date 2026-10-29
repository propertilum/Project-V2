import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, icon: Icon, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-backdrop-in" 
        onClick={onClose} 
      />
      
      {/* Modal / Bottom Sheet Box */}
      <div className={`relative bg-[#1C1C1E] text-[#F5F5F7] rounded-t-[24px] sm:rounded-[14px] w-full ${maxWidth} shadow-2xl border-t sm:border border-[#38383A] overflow-hidden z-10 animate-sheet-up sm:animate-scale-in max-h-[92vh] sm:max-h-none flex flex-col my-0 sm:my-8`}>
        
        {/* iOS-Style Bottom Sheet Drag Handle (Mobile only) */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-start sm:items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#38383A] bg-[#2C2C2E]/60 backdrop-blur-md shrink-0 gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <div className="w-7 h-7 rounded-[7px] bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF] shrink-0 mt-0.5 sm:mt-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[#F5F5F7] text-[13px] sm:text-[14px] tracking-tight leading-snug break-words">{title}</h3>
              {subtitle && <p className="text-[11px] text-[#8E8E93] mt-0.5 leading-normal line-clamp-2 sm:line-clamp-none break-words">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E8E93] hover:text-[#F5F5F7] p-1.5 rounded-[8px] hover:bg-[#38383A] transition active:scale-[0.94] shrink-0 -mr-1"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with momentum scrolling & safe padding */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
