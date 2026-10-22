import { useState } from 'react';
import {
  Link2, RefreshCw, ShieldCheck,
  AlertTriangle, PowerOff, Building2, Plus, Info, Check, X
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import StatusDot from '../ui/StatusDot';
import { formatRelativeTime } from '../../utils/formatters';

export default function ConnectionsTab({
  connections = [],
  onSyncConnection,
  onDisconnectConnection,
  showToast,
}) {
  const [syncingId, setSyncingId] = useState(null);
  const [isAddConnectionOpen, setIsAddConnectionOpen] = useState(false);

  const handleSync = async (connId) => {
    setSyncingId(connId);
    // Simulate connection sync latency
    await new Promise((r) => setTimeout(r, 900));
    onSyncConnection?.(connId);
    setSyncingId(null);
    showToast?.('Connection refreshed. Synced recent transaction events.', 'success');
  };

  const handleDisconnect = (connId, name) => {
    if (window.confirm(`Disconnect "${name}"? CardHub will stop receiving transactions and balance updates from this provider.`)) {
      onDisconnectConnection?.(connId);
      showToast?.(`Disconnected ${name}.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Trust Notice */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Financial Data Providers &amp; Integrations
            </h2>
            <Badge variant="demo" size="xs">
              Simulation Sandbox
            </Badge>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            CardHub connects to banking data aggregators and card issuing networks. CardHub does not store online banking passwords. Connections use read-only OAuth or authorized virtual card issuing webhooks.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsAddConnectionOpen(true)}
        >
          Connect Provider
        </Button>
      </div>

      {/* Add Provider Modal (Simulated Consent Flow) */}
      {isAddConnectionOpen && (
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/60 animate-fade-in space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Add Financial Connection (Sandbox Preview)</h3>
                <p className="text-xs text-slate-400">
                  Select an authorized institution or card network to link
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddConnectionOpen(false)}
              className="text-slate-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { name: 'Habib Bank (HBL)', note: 'Open Banking Sandbox', type: 'Bank Account / Cards' },
              { name: 'Meezan Bank', note: 'Financial API Sandbox', type: 'Debit Cards' },
              { name: 'CardHub Virtual Issuer', note: 'Lithic / Stripe Issuing Sandbox', type: 'Virtual Cards' },
            ].map((provider, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between"
                onClick={() => {
                  showToast?.(`Connected ${provider.name} in Simulation Sandbox.`, 'success');
                  setIsAddConnectionOpen(false);
                }}
              >
                <div>
                  <span className="text-xs font-bold text-white block">{provider.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{provider.type}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                  <span>{provider.note}</span>
                  <span>Connect →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-indigo-900/40">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              Real bank connections require legal entity registration, official aggregator credentials, and cardholder consent.
            </span>
          </div>
        </div>
      )}

      {/* Connected Providers List */}
      <div className="space-y-4">
        {connections.map((conn) => {
          const isDelayed = conn.status === 'connected_delayed';
          const isDisconnected = conn.status === 'disconnected';

          return (
            <div
              key={conn.id}
              className={`p-6 rounded-2xl border transition-all ${
                isDisconnected
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-70'
                  : isDelayed
                    ? 'bg-slate-900 border-amber-800/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Provider Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {conn.name}
                      </h3>
                      {conn.isDemo && (
                        <Badge variant="demo" size="xs">
                          Demo Sandbox
                        </Badge>
                      )}
                      <Badge
                        variant={
                          isDisconnected
                            ? 'dark'
                            : isDelayed
                              ? 'amber'
                              : 'emerald'
                        }
                        size="xs"
                      >
                        <StatusDot
                          status={
                            isDisconnected
                              ? 'disconnected'
                              : isDelayed
                                ? 'delayed'
                                : 'active'
                          }
                          className="mr-1"
                        />
                        {isDisconnected
                          ? 'Disconnected'
                          : isDelayed
                            ? 'Sync Delayed'
                            : 'Connected & Live'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                      <span>{conn.provider}</span>
                      <span>·</span>
                      <span>{conn.accountMask}</span>
                    </div>
                  </div>
                </div>

                {/* Connection Sync & Action Buttons */}
                <div className="flex items-center gap-2 self-start lg:self-auto">
                  {!isDisconnected && (
                    <Button
                      variant={isDelayed ? 'primary' : 'secondary'}
                      size="sm"
                      icon={RefreshCw}
                      loading={syncingId === conn.id}
                      onClick={() => handleSync(conn.id)}
                    >
                      {isDelayed ? 'Re-sync Now' : 'Sync'}
                    </Button>
                  )}

                  {!isDisconnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={PowerOff}
                      onClick={() => handleDisconnect(conn.id, conn.name)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={RefreshCw}
                      onClick={() => handleSync(conn.id)}
                    >
                      Reconnect
                    </Button>
                  )}
                </div>
              </div>

              {/* Status & Freshness Indicators */}
              <div className="py-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Last successful sync:</span>
                  <span className="text-slate-300 font-mono">
                    {formatRelativeTime(conn.lastSyncedAt)}
                  </span>
                  {isDelayed && (
                    <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3 h-3" /> Over 24 hours stale
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Encryption: AES-256 / TLS 1.3
                </div>
              </div>

              {/* Capabilities & Permissions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                {/* Capabilities */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Supported Provider Capabilities
                  </span>
                  <div className="space-y-1.5">
                    {conn.capabilities?.map((cap, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800/60"
                      >
                        {cap.supported ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className={`font-semibold ${cap.supported ? 'text-slate-200' : 'text-slate-400 line-through'}`}>
                            {cap.name}
                          </span>
                          {cap.note && (
                            <span className="block text-[11px] text-slate-500">
                              {cap.note}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions Granted */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Authorized Permissions Scope
                  </span>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <ul className="space-y-1.5 text-slate-400 text-xs">
                      {conn.permissions?.map((perm, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                      Permissions are revocable anytime. CardHub will not retain unauthorized financial telemetry.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
