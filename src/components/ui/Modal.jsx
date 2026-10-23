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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className={`relative bg-[#1C1C1E] text-[#F5F5F7] rounded-[14px] w-full ${maxWidth} shadow-2xl border border-[#38383A] overflow-hidden z-10 animate-scale-in my-8`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#38383A] bg-[#2C2C2E]/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-7 h-7 rounded-[7px] bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
                <Icon className="w-3.5 h-3.5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-[#F5F5F7] text-[14px] tracking-tight">{title}</h3>
              {subtitle && <p className="text-[11px] text-[#8E8E93] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E8E93] hover:text-[#F5F5F7] p-1 rounded-[6px] hover:bg-[#38383A] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
