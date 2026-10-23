import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-[12px] border border-dashed border-[#38383A] bg-[#1C1C1E]/50 flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-10 h-10 rounded-[10px] bg-[#2C2C2E] border border-[#38383A] text-[#8E8E93] flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-[#8E8E93]" />
        </div>
      )}
      <h3 className="text-[14px] font-semibold text-[#F5F5F7] mb-1">{title}</h3>
      <p className="text-[12px] text-[#8E8E93] max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
