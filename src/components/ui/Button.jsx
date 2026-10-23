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
  const base = 'inline-flex items-center justify-center font-medium rounded-[8px] transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 select-none focus:outline-none';

  const variants = {
    primary: 'bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0062C4] text-white',
    secondary: 'bg-[#2C2C2E] hover:bg-[#38383A] active:bg-[#242426] text-[#F5F5F7] border border-[#38383A]',
    outline: 'bg-transparent hover:bg-[#2C2C2E] active:bg-[#1C1C1E] text-[#F5F5F7] border border-[#38383A]',
    ghost: 'bg-transparent hover:bg-[#2C2C2E] active:bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F5F5F7]',
    danger: 'bg-[#FF453A]/15 hover:bg-[#FF453A]/25 active:bg-[#FF453A]/30 text-[#FF453A] border border-[#FF453A]/30',
    success: 'bg-[#34C759]/15 hover:bg-[#34C759]/25 active:bg-[#34C759]/30 text-[#34C759] border border-[#34C759]/30',
    accent: 'bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0062C4] text-white',
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1 gap-1.5',
    sm: 'text-[12px] px-3 py-1.5 gap-2',
    md: 'text-[13px] px-3.5 py-2 gap-2',
    lg: 'text-[14px] px-4 py-2.5 gap-2.5',
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
