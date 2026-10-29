import { useState, useMemo } from 'react';
import {
  AlertTriangle, ShieldAlert, CheckCircle2,
  Clock, ArrowUpRight, ExternalLink, ShieldCheck, Lock
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Select from '../ui/Select';
import EmptyState from '../ui/EmptyState';
import { SkeletonTable } from '../ui/Skeleton';
import { formatRelativeTime } from '../../utils/formatters';

export default function AlertsTab({
  alerts = [],
  cards = [],
  onUpdateAlertStatus,
  onFreezeCard,
  onNavigateTab,
  isLoading = false,
}) {
  const [statusFilter, setStatusFilter] = useState('open'); // 'all', 'open', 'resolved'
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (statusFilter === 'open' && alert.status !== 'open') return false;
      if (statusFilter === 'resolved' && alert.status === 'open') return false;
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
      return true;
    });
  }, [alerts, statusFilter, severityFilter]);

  const openCount = alerts.filter((a) => a.status === 'open').length;
  const highSeverityCount = alerts.filter((a) => a.status === 'open' && a.severity === 'high').length;

  return (
    <div className="space-y-6 text-[#F5F5F7]">
      {/* Top Health Assessment Card (macOS System Settings Style) */}
      <div className="bg-[#1C1C1E] p-5 rounded-[12px] border border-[#38383A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 ${
            highSeverityCount > 0
              ? 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
              : openCount > 0
                ? 'bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30'
                : 'bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30'
          }`}>
            {highSeverityCount > 0 ? (
              <ShieldAlert className="w-5 h-5" />
            ) : openCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#F5F5F7] tracking-tight">
                {highSeverityCount > 0
                  ? `${highSeverityCount} High Priority Security Alert${highSeverityCount > 1 ? 's' : ''}`
                  : openCount > 0
                    ? `${openCount} Issue${openCount > 1 ? 's' : ''} Require Attention`
                    : 'Security Core: All Signals Normal'}
              </h2>
              <Badge variant={highSeverityCount > 0 ? 'red' : openCount > 0 ? 'orange' : 'green'} size="xs" dot>
                {highSeverityCount > 0 ? 'Action Required' : openCount > 0 ? 'Needs Review' : 'Healthy'}
              </Badge>
            </div>
            <p className="text-[12px] text-[#8E8E93] mt-0.5">
              {openCount > 0
                ? 'CardHub security telemetry detected spending anomalies or provider sync delays.'
                : 'No unresolved spending rule violations, card tampering, or velocity alerts found.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-[#8E8E93] font-mono px-2.5 py-1 bg-[#2C2C2E] border border-[#38383A] rounded-[6px]">
            {openCount} Open · {alerts.length - openCount} Resolved
          </span>
        </div>
      </div>

      {/* Filter Tabs Bar (macOS Segmented Control) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#38383A]">
        <div className="flex items-center gap-1 p-1 bg-[#2C2C2E] rounded-[8px] border border-[#38383A] text-[12px] overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('open')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-[6px] font-medium transition active:scale-[0.98] whitespace-nowrap text-center ${
              statusFilter === 'open'
                ? 'bg-[#0A84FF] text-white shadow-sm'
                : 'text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            <span className="sm:hidden">Open ({openCount})</span>
            <span className="hidden sm:inline">Unresolved ({openCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-[6px] font-medium transition active:scale-[0.98] whitespace-nowrap text-center ${
              statusFilter === 'all'
                ? 'bg-[#0A84FF] text-white shadow-sm'
                : 'text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-[6px] font-medium transition active:scale-[0.98] whitespace-nowrap text-center ${
              statusFilter === 'resolved'
                ? 'bg-[#0A84FF] text-white shadow-sm'
                : 'text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            Resolved
          </button>
        </div>

        <div className="flex items-center gap-2 min-w-[170px]">
          <span className="text-[12px] text-[#8E8E93] font-medium shrink-0">Severity:</span>
          <Select
            value={severityFilter}
            onChange={setSeverityFilter}
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Alerts Feed */}
      {isLoading ? (
        <SkeletonTable rows={4} />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No alerts in this view"
          description={
            statusFilter === 'open'
              ? 'Great news! There are no unresolved security alerts or anomalous activity flags.'
              : 'No alerts match the selected severity or status filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const card = cards.find((c) => c.id === alert.cardId);
            const isBankCard = card?.source === 'bank_connection';
            const isResolved = alert.status === 'resolved';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-[12px] border transition-all ${
                  isResolved
                    ? 'bg-[#1C1C1E]/60 border-[#38383A]/60 opacity-60'
                    : alert.severity === 'high'
                      ? 'bg-[#1C1C1E] border-[#38383A] border-l-2 border-l-[#FF453A]'
                      : 'bg-[#1C1C1E] border-[#38383A] hover:border-[#48484A]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Header line: Badges + Card + Timestamp */}
                    <div className="flex flex-wrap items-center gap-2 text-[12px]">
                      <Badge
                        variant={
                          alert.severity === 'high'
                            ? 'red'
                            : alert.severity === 'medium'
                              ? 'orange'
                              : 'blue'
                        }
                        size="xs"
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>

                      <span className="font-mono text-[#F5F5F7] font-medium text-[13px]">
                        {alert.cardLabel || card?.label || 'Account'}
                      </span>

                      {alert.maskedCard && (
                        <span className="font-mono text-[#8E8E93] text-[11px]">
                          ({alert.maskedCard})
                        </span>
                      )}

                      {isBankCard && (
                        <Badge variant="monitoring" size="xs">
                          Linked Bank Card
                        </Badge>
                      )}

                      <span className="text-[#8E8E93] text-[11px] flex items-center gap-1 ml-auto sm:ml-0 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(alert.timestamp)}
                      </span>
                    </div>

                    {/* Alert Title & Reason */}
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#F5F5F7] mb-0.5 tracking-tight">
                        {alert.title}
                      </h3>
                      <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                        {alert.reason}
                      </p>
                    </div>

                    {/* Evidence Summary Box */}
                    {alert.evidenceSummary && (
                      <div className="p-3 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[11px] text-[#8E8E93] font-mono space-y-0.5">
                        <div className="text-[10px] uppercase font-semibold text-[#8E8E93] tracking-wider">
                          Evidence Summary
                        </div>
                        <div className="text-[#F5F5F7]">{alert.evidenceSummary}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#38383A]">
                    {!isResolved && (
                      <>
                        {!isBankCard && card && !card.isLocked && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Lock}
                            onClick={() => onFreezeCard?.(card.id)}
                          >
                            Freeze Virtual Card
                          </Button>
                        )}

                        {alert.type === 'connection_delayed' && onNavigateTab && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={ArrowUpRight}
                            onClick={() => onNavigateTab('connections')}
                          >
                            View Connection
                          </Button>
                        )}

                        {alert.type === 'unusual_merchant' && onNavigateTab && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={ArrowUpRight}
                            onClick={() => onNavigateTab('rules')}
                          >
                            Review Rules
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => onUpdateAlertStatus?.(alert.id, 'resolved')}
                        >
                          Acknowledge
                        </Button>
                      </>
                    )}

                    {isResolved && (
                      <div className="flex items-center gap-1.5 text-[12px] text-[#34C759] font-medium py-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved</span>
                      </div>
                    )}

                    {isBankCard && (
                      <div className="text-[10px] text-[#8E8E93] max-w-[180px] leading-tight mt-1 flex items-start gap-1 font-mono">
                        <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-[#8E8E93]" />
                        <span>Bank cards cannot be frozen remotely.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
