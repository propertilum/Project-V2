export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-[8px] border border-transparent transition-colors duration-150 ease-out active:scale-[0.98] transform-gpu will-change-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 select-none focus:outline-none box-border leading-none shrink-0';

  const variants = {
    primary: 'bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0062C4] text-white border-transparent',
    secondary: 'bg-[#2C2C2E] hover:bg-[#38383A] active:bg-[#242426] text-[#F5F5F7] border-[#38383A]',
    outline: 'bg-transparent hover:bg-[#2C2C2E] active:bg-[#1C1C1E] text-[#F5F5F7] border-[#38383A]',
    ghost: 'bg-transparent hover:bg-[#2C2C2E] active:bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F5F5F7] border-transparent',
    danger: 'bg-[#FF453A]/15 hover:bg-[#FF453A]/25 active:bg-[#FF453A]/30 text-[#FF453A] border-[#FF453A]/30',
    success: 'bg-[#34C759]/15 hover:bg-[#34C759]/25 active:bg-[#34C759]/30 text-[#34C759] border-[#34C759]/30',
    accent: 'bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0062C4] text-white border-transparent',
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 h-7 min-w-[28px] gap-1.5',
    sm: 'text-[12px] px-3 h-8 min-w-[32px] gap-2',
    md: 'text-[13px] px-3.5 h-9 min-w-[36px] gap-2',
    lg: 'text-[14px] px-4 h-10 min-w-[40px] gap-2.5',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
