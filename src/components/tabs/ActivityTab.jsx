import { useState } from 'react';
import { 
  Clock, Shield, CreditCard, DollarSign, Key 
} from 'lucide-react';
import Badge from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { formatRelativeTime } from '../../utils/formatters';

export default function ActivityTab({ activityLogs = [], isLoading = false }) {
  const [filterCategory, setFilterCategory] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Events' },
    { id: 'card', label: 'Card Lifecycle' },
    { id: 'transaction', label: 'Authorizations' },
    { id: 'security', label: 'Security' },
    { id: 'auth', label: 'Authentication' },
  ];

  const filteredLogs = activityLogs.filter((log) => {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  const getEventIcon = (category) => {
    if (category === 'card') {
      return <CreditCard className="w-3.5 h-3.5 text-[#0A84FF]" />;
    }
    if (category === 'transaction') {
      return <DollarSign className="w-3.5 h-3.5 text-[#34C759]" />;
    }
    if (category === 'security') {
      return <Shield className="w-3.5 h-3.5 text-[#FF9F0A]" />;
    }
    if (category === 'auth') {
      return <Key className="w-3.5 h-3.5 text-[#BF5AF2]" />;
    }
    return <Clock className="w-3.5 h-3.5 text-[#8E8E93]" />;
  };

  const getBadgeVariant = (severity) => {
    if (severity === 'success') return 'green';
    if (severity === 'warning') return 'orange';
    if (severity === 'danger') return 'red';
    return 'blue';
  };

  return (
    <div className="space-y-6 text-[#F5F5F7]">
      {/* 1. Header & Filters */}
      <div className="bg-[#1C1C1E] p-6 rounded-[12px] border border-[#38383A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[#F5F5F7] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0A84FF]" />
            <span>Unified Vault Activity Timeline</span>
          </h2>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">
            Immutable chronological audit log of card issuances, limits, authorizations, and policy updates.
          </p>
        </div>

        {/* macOS segmented filter */}
        <div className="flex bg-[#2C2C2E] border border-[#38383A] p-0.5 rounded-[8px] self-start sm:self-auto overflow-x-auto no-scrollbar">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterCategory(opt.id)}
              className={`px-3 py-1 text-[12px] font-medium rounded-[6px] transition active:scale-[0.98] whitespace-nowrap ${
                filterCategory === opt.id
                  ? 'bg-[#0A84FF] text-white shadow-sm'
                  : 'text-[#8E8E93] hover:text-[#F5F5F7]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Timeline Stream */}
      <div className="bg-[#1C1C1E] rounded-[12px] border border-[#38383A] p-6 md:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="w-6 h-6 rounded-full shrink-0 mt-1" />
                <div className="flex-1 bg-[#2C2C2E] p-4 rounded-[8px] border border-[#38383A] space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[#8E8E93] text-[13px]">
            No activity logs match your filter criteria.
          </div>
        ) : (
          <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#38383A]">
            {filteredLogs.map((log) => {
              return (
                <div key={log.id} className="relative flex items-start gap-4 group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-[27px] w-6 h-6 rounded-full bg-[#1C1C1E] border border-[#38383A] group-hover:border-[#0A84FF] flex items-center justify-center transition shrink-0 z-10">
                    {getEventIcon(log.category)}
                  </div>

                  {/* Event Details Card */}
                  <div className="flex-1 bg-[#2C2C2E] p-4 rounded-[8px] border border-[#38383A] hover:border-[#48484A] transition space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F5F5F7] text-[13px]">{log.title}</span>
                        <Badge
                          variant={getBadgeVariant(log.severity)}
                          size="xs"
                        >
                          {log.category.toUpperCase()}
                        </Badge>
                      </div>

                      <span className="text-[11px] font-mono text-[#8E8E93]">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#8E8E93] leading-relaxed pt-0.5">
                      {log.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
