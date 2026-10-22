export default function StatusDot({ status = 'active', className = '' }) {
  const styles = {
    active: 'bg-emerald-400',
    healthy: 'bg-emerald-400',
    normal: 'bg-emerald-400',
    needs_review: 'bg-amber-400 animate-pulse',
    delayed: 'bg-amber-400',
    frozen: 'bg-rose-400',
    locked: 'bg-rose-400',
    declined: 'bg-rose-400',
    expired: 'bg-slate-500',
    demo: 'bg-purple-400',
    unknown: 'bg-slate-500',
    disconnected: 'bg-slate-600',
  };

  const dotColor = styles[status] || styles.unknown;

  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {status === 'active' || status === 'normal' ? (
        <span className={`absolute inline-flex h-2 w-2 rounded-full opacity-40 animate-ping ${dotColor}`} />
      ) : null}
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor}`} />
    </span>
  );
}
