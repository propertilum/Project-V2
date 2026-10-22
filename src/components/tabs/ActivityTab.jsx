import { useState } from 'react';
import { 
  Clock, Shield, CreditCard, DollarSign, Key 
} from 'lucide-react';
import Badge from '../ui/Badge';
import { formatRelativeTime } from '../../utils/formatters';

export default function ActivityTab({ activityLogs = [] }) {
  const [filterCategory, setFilterCategory] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Events' },
    { id: 'card', label: 'Card Lifecycle' },
    { id: 'transaction', label: 'Authorizations' },
    { id: 'security', label: 'Security Protocols' },
    { id: 'auth', label: 'Authentication' },
  ];

  const filteredLogs = activityLogs.filter((log) => {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  const getEventIcon = (category) => {
    if (category === 'card') {
      return <CreditCard className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (category === 'transaction') {
      return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (category === 'security') {
      return <Shield className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (category === 'auth') {
      return <Key className="w-3.5 h-3.5 text-sky-400" />;
    }
    return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* 1. Header & Filters */}
      <div className="bg-[#111418] p-6 rounded-2xl border border-[#262B33] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Unified Vault Activity Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable chronological audit log of card issuances, limits, authorizations, and policy updates.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterCategory(opt.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                filterCategory === opt.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#161B22] text-slate-400 hover:text-white border border-[#262B33] hover:border-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Timeline Stream */}
      <div className="bg-[#111418] rounded-2xl border border-[#262B33] p-6 md:p-8 shadow-lg">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No activity logs match your filter criteria.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#262B33]">
            {filteredLogs.map((log) => {
              return (
                <div key={log.id} className="relative flex items-start gap-4 group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-[27px] w-6 h-6 rounded-full bg-[#111418] border-2 border-[#262B33] group-hover:border-indigo-500 flex items-center justify-center transition shrink-0 z-10 shadow-sm">
                    {getEventIcon(log.category)}
                  </div>

                  {/* Event Details Card */}
                  <div className="flex-1 bg-[#161B22] p-4 rounded-xl border border-[#262B33] hover:border-slate-700 transition space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{log.title}</span>
                        <Badge
                          variant={
                            log.severity === 'success'
                              ? 'emerald'
                              : log.severity === 'warning'
                              ? 'amber'
                              : log.severity === 'danger'
                              ? 'rose'
                              : 'indigo'
                          }
                          size="xs"
                        >
                          {log.category.toUpperCase()}
                        </Badge>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
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
