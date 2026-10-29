import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Custom Theme-Native Select Dropdown Component
 * Perfectly styled for CardHub dark OLED theme with smooth transitions,
 * custom floating menu, checkmarks, and keyboard dismissal.
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  className = '',
  size = 'md',
  disabled = false,
  icon: Icon,
  align = 'left',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to [{ value, label, icon }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt;
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Dismiss on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'h-8 py-1 px-2.5 text-xs',
    md: 'h-9 py-1.5 px-3 text-xs',
    lg: 'h-10 py-2 px-3.5 text-sm',
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 bg-[#2C2C2E] text-[#F5F5F7] rounded-[8px] border transition-all duration-150 active:scale-[0.99] font-medium box-border ${
          sizeClasses[size] || sizeClasses.md
        } ${
          isOpen
            ? 'border-[#0A84FF] shadow-[0_0_0_2px_rgba(10,132,255,0.35)] bg-[#323236]'
            : 'border-[#38383A] hover:border-[#48484A] hover:bg-[#323236]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />}
          <span className="truncate block font-normal">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8E8E93] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0A84FF]' : ''
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 min-w-full max-h-60 overflow-y-auto no-scrollbar rounded-[10px] bg-[#1C1C1E]/95 backdrop-blur-xl border border-[#38383A] shadow-[0_16px_40px_rgba(0,0,0,0.8)] py-1 text-xs animate-scale-in overscroll-contain ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-[#8E8E93] text-center">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              const OptIcon = opt.icon;

              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-left transition-colors duration-100 ${
                    isSelected
                      ? 'bg-[#0A84FF]/15 text-[#0A84FF] font-semibold'
                      : 'text-[#F5F5F7] hover:bg-[#2C2C2E]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {OptIcon && <OptIcon className="w-3.5 h-3.5 shrink-0 text-[#0A84FF]" />}
                    <div className="min-w-0">
                      <span className="block truncate">{opt.label}</span>
                      {opt.desc && (
                        <span className="text-[10px] text-[#8E8E93] block truncate font-mono">
                          {opt.desc}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

