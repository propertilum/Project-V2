export default function StatusDot({ status = 'active', className = '' }) {
  const styles = {
    active: 'bg-[#34C759]',
    healthy: 'bg-[#34C759]',
    normal: 'bg-[#34C759]',
    needs_review: 'bg-[#FF9F0A]',
    delayed: 'bg-[#FF9F0A]',
    frozen: 'bg-[#FF453A]',
    locked: 'bg-[#FF453A]',
    declined: 'bg-[#FF453A]',
    expired: 'bg-[#636366]',
    demo: 'bg-[#BF5AF2]',
    unknown: 'bg-[#636366]',
    disconnected: 'bg-[#636366]',
  };

  const dotColor = styles[status] || styles.unknown;

  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {status === 'active' || status === 'normal' ? (
        <span className={`absolute inline-flex h-2 w-2 rounded-full opacity-30 animate-ping ${dotColor}`} />
      ) : null}
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor}`} />
    </span>
  );
}
