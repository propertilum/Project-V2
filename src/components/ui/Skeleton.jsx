export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`bg-[#2C2C2E]/70 animate-pulse rounded-[8px] ${className}`}
      {...props}
    />
  );
}

export function SkeletonMetric() {
  return (
    <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-7 rounded-[6px]" />
      </div>
      <div className="space-y-1.5 py-1">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-2">
      {/* 1.586:1 Card Canvas Skeleton */}
      <Skeleton className="w-full aspect-[1.586/1] rounded-[14px]" />
      
      {/* Docked Control Strip Skeleton */}
      <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#1C1C1E] border border-[#38383A]">
        <Skeleton className="h-3.5 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-[6px]" />
          <Skeleton className="h-6 w-14 rounded-[6px]" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[12px] overflow-hidden">
      <div className="p-4 border-b border-[#38383A] flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-24 rounded-[8px]" />
      </div>
      <div className="divide-y divide-[#38383A]/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-8 w-8 rounded-[8px] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
