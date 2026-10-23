export default function Badge({ children, variant = 'default', size = 'sm', dot = false, className = '' }) {
  const variants = {
    default: 'bg-[#2C2C2E] text-[#8E8E93] border-[#38383A]',
    blue: 'bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/30',
    indigo: 'bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/30',
    emerald: 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30',
    green: 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30',
    amber: 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30',
    orange: 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30',
    rose: 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30',
    red: 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30',
    purple: 'bg-[#BF5AF2]/15 text-[#BF5AF2] border-[#BF5AF2]/30',
    cyan: 'bg-[#64D2FF]/15 text-[#64D2FF] border-[#64D2FF]/30',
    dark: 'bg-[#1C1C1E] text-[#8E8E93] border-[#38383A]',
    enforced: 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30',
    monitoring: 'bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/30',
    demo: 'bg-[#BF5AF2]/15 text-[#BF5AF2] border-[#BF5AF2]/30',
    unavailable: 'bg-[#2C2C2E] text-[#636366] border-[#38383A]',
    delayed: 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30',
    active: 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30',
    frozen: 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30',
  };

  const dotColors = {
    blue: 'bg-[#0A84FF]',
    indigo: 'bg-[#0A84FF]',
    emerald: 'bg-[#34C759]',
    green: 'bg-[#34C759]',
    amber: 'bg-[#FF9F0A]',
    orange: 'bg-[#FF9F0A]',
    rose: 'bg-[#FF453A]',
    red: 'bg-[#FF453A]',
    purple: 'bg-[#BF5AF2]',
    cyan: 'bg-[#64D2FF]',
    enforced: 'bg-[#34C759]',
    monitoring: 'bg-[#0A84FF]',
    active: 'bg-[#34C759]',
    frozen: 'bg-[#FF453A]',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'}`} />
      )}
      <span>{children}</span>
    </span>
  );
}
