import { useState, useMemo } from 'react';
import {
  AlertTriangle, ShieldAlert, CheckCircle2,
  Clock, ArrowUpRight, ExternalLink, ShieldCheck, Lock
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { formatRelativeTime } from '../../utils/formatters';

export default function AlertsTab({
  alerts = [],
  cards = [],
  onUpdateAlertStatus,
  onFreezeCard,
  onNavigateTab,
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
    <div className="space-y-6">
      {/* Top Health Assessment Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        highSeverityCount > 0
          ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
          : openCount > 0
            ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
            : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              highSeverityCount > 0
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : openCount > 0
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {highSeverityCount > 0 ? (
                <ShieldAlert className="w-5 h-5" />
              ) : openCount > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {highSeverityCount > 0
                    ? `${highSeverityCount} High Priority Security Alert${highSeverityCount > 1 ? 's' : ''}`
                    : openCount > 0
                      ? `${openCount} Issue${openCount > 1 ? 's' : ''} Require Review`
                      : 'All Connected Cards Look Normal'}
                </h2>
                <Badge variant={highSeverityCount > 0 ? 'rose' : openCount > 0 ? 'amber' : 'emerald'} size="xs">
                  {highSeverityCount > 0 ? 'Action Required' : openCount > 0 ? 'Needs Review' : 'Healthy'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {openCount > 0
                  ? 'CardHub detected spending anomalies or provider delays based on available authorized data.'
                  : 'No unresolved spending rule violations or sync delays found in recent activity.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">
              {openCount} Open · {alerts.length - openCount} Resolved
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'open'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unresolved ({openCount})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'resolved'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolved
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      {filteredAlerts.length === 0 ? (
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
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const card = cards.find((c) => c.id === alert.cardId);
            const isBankCard = card?.source === 'bank_connection';
            const isResolved = alert.status === 'resolved';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                    : alert.severity === 'high'
                      ? 'bg-slate-900/90 border-rose-800/50 shadow-lg shadow-rose-950/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    {/* Header line: Badges + Card + Timestamp */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant={
                          alert.severity === 'high'
                            ? 'rose'
                            : alert.severity === 'medium'
                              ? 'amber'
                              : 'indigo'
                        }
                        size="xs"
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>

                      <span className="font-mono text-slate-400 font-semibold">
                        {alert.cardLabel || card?.label || 'Account'}
                      </span>

                      {alert.maskedCard && (
                        <span className="font-mono text-slate-500 text-[11px]">
                          ({alert.maskedCard})
                        </span>
                      )}

                      {isBankCard && (
                        <Badge variant="monitoring" size="xs">
                          Linked Bank Card
                        </Badge>
                      )}

                      <span className="text-slate-500 text-[11px] flex items-center gap-1 ml-auto sm:ml-0">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(alert.timestamp)}
                      </span>
                    </div>

                    {/* Alert Title & Reason */}
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 tracking-tight">
                        {alert.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {alert.reason}
                      </p>
                    </div>

                    {/* Evidence Summary Box */}
                    {alert.evidenceSummary && (
                      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 font-mono space-y-1">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Evidence Summary
                        </div>
                        <div>{alert.evidenceSummary}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                    {!isResolved && (
                      <>
                        {/* If it's a CardHub virtual card, user can freeze it right here */}
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

                        {/* If it's a bank connection issue, navigate to Connections */}
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

                        {/* If it's a rule violation, navigate to Rules */}
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

                        {/* Acknowledge / Dismiss */}
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
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium py-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved</span>
                      </div>
                    )}

                    {isBankCard && (
                      <div className="text-[10px] text-slate-500 max-w-[180px] leading-tight mt-1 flex items-start gap-1">
                        <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
                        <span>Bank cards cannot be frozen remotely by CardHub.</span>
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
