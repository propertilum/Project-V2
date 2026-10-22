export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    dark: 'bg-slate-900 text-slate-300 border-slate-800',
    enforced: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
    monitoring: 'bg-sky-950/40 text-sky-300 border-sky-800/50',
    demo: 'bg-purple-950/40 text-purple-300 border-purple-800/50',
    unavailable: 'bg-slate-800/40 text-slate-400 border-slate-700/40',
    delayed: 'bg-amber-950/40 text-amber-300 border-amber-800/50',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
}
