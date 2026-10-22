import { 
  Lock, Unlock, AlertTriangle, CheckCircle, Smartphone, 
  Laptop, ShieldAlert, Cpu
} from 'lucide-react';
import Badge from '../ui/Badge';

export default function SecurityTab({
  cards,
  sessions,
  settings,
  currentUser,
  onOpenVerifyEmail,
  onUpdateSettings,
  onPanicFreezeAll,
  allCardsFrozen,
  onRevokeSession,
  onUnfreezeCard,
}) {
  const frozenCards = cards.filter((c) => c.isLocked);

  // Security score calculation
  let securityScore = 65;
  if (settings.twoFactor) securityScore += 10;
  if (settings.autoFreezeOnFraud) securityScore += 10;
  if (settings.loginAlerts) securityScore += 5;
  if (currentUser?.emailVerified) securityScore += 10;

  return (
    <div className="space-y-6 text-slate-200">
      {/* 1. Security Console Header & Posture Indicator */}
      <div className="bg-[#111418] text-white p-6 md:p-8 rounded-2xl border border-[#262B33] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider">
              Cryptographic Safeguard Active
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
            <span>Security Command Console</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Centralized risk posture monitor, emergency authorization kill-switches, and active hardware token audit logs.
          </p>
        </div>

        {/* Security Score Badge */}
        <div className="bg-[#161B22] border border-[#262B33] p-5 rounded-xl flex items-center gap-4 shrink-0 relative z-10">
          <div className="w-14 h-14 rounded-xl bg-indigo-950/60 border border-indigo-700/50 flex flex-col items-center justify-center font-mono">
            <span className="text-xl font-black text-indigo-300">{securityScore}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">/100</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Security Health Grade</div>
            <div className="text-[11px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> High Hardening Active
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">2FA & Fraud Auto-Lock Engaged</span>
          </div>
        </div>
      </div>

      {/* 2. Panic Kill-Switch & Global Channel Lockdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panic Kill Switch */}
        <div className="lg:col-span-5 bg-[#111418] p-6 rounded-2xl border border-[#262B33] shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Emergency Authorization Kill-Switch</h3>
              <p className="text-[11px] text-slate-400">One-click immediate lockdown across digital cards</p>
            </div>
          </div>

          <div className="p-4 bg-rose-950/20 rounded-xl border border-rose-900/40 text-xs space-y-2 text-rose-200/90 leading-relaxed">
            <p>
              If you detect unauthorized charges, clicking below instantly freezes all virtual cards ({cards.filter(c => c.source !== 'bank_connection').length} cards). Any incoming network authorizations will be rejected with decline code 51.
            </p>
          </div>

          <button
            onClick={onPanicFreezeAll}
            className={`w-full py-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg ${
              allCardsFrozen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            {allCardsFrozen ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Reactivate &amp; Unfreeze All Cards</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Panic Freeze All Cards Now</span>
              </>
            )}
          </button>
        </div>

        {/* Global Permission Switches */}
        <div className="lg:col-span-7 bg-[#111418] p-6 rounded-2xl border border-[#262B33] shadow-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Global Channel Safeguard Toggles</h3>
            <p className="text-xs text-slate-400 mt-0.5">Enforce immediate cross-card protocol overrides</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Two-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-slate-400">Require TOTP authentication code upon console sign-in.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => onUpdateSettings({ twoFactor: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Auto-Freeze Fraud Protection</div>
                <div className="text-[11px] text-slate-400">Automatically isolate and freeze card if suspicious velocity is detected.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoFreezeOnFraud}
                  onChange={(e) => onUpdateSettings({ autoFreezeOnFraud: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Sign-In Velocity Alerts</div>
                <div className="text-[11px] text-slate-400">Instant notification when a new IP or device authenticates.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.loginAlerts}
                  onChange={(e) => onUpdateSettings({ loginAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Cryptographic Email Verification</div>
                <div className="text-[11px] text-slate-400">
                  {currentUser?.emailVerified
                    ? 'Verified: protects transactions and enables elevated limit authority.'
                    : 'Unverified: verify your email to eliminate spending caps and lockouts.'}
                </div>
              </div>
              {currentUser?.emailVerified ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[11px] font-bold flex items-center gap-1 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified</span>
                </span>
              ) : (
                <button
                  onClick={onOpenVerifyEmail}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Verify Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card Security Audit & Frozen Cards Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Frozen Cards Review */}
        <div className="lg:col-span-6 bg-[#111418] p-6 rounded-2xl border border-[#262B33] shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#262B33]">
            <div>
              <h3 className="text-base font-bold text-white">Frozen Cards Quarantine</h3>
              <p className="text-xs text-slate-400 mt-0.5">Authorizations temporarily or permanently suspended</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              {frozenCards.length} Frozen
            </span>
          </div>

          {frozenCards.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-bold text-slate-200">No cards in quarantine</div>
              <p className="text-[11px] text-slate-500">All virtual cards are currently operating under normal limits.</p>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {frozenCards.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-rose-950/20 rounded-xl border border-rose-900/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">{c.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.brand} •••• {(c.cardNumber || c.last4 || '').slice(-4)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onUnfreezeCard(c.id)}
                    className="px-3 py-1.5 bg-[#161B22] hover:bg-slate-800 text-slate-200 border border-[#262B33] font-bold rounded-lg transition text-xs shadow-sm"
                  >
                    Unfreeze
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Hardware Sessions */}
        <div className="lg:col-span-6 bg-[#111418] p-6 rounded-2xl border border-[#262B33] shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#262B33]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Authenticated Hardware Sessions</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Devices currently authorized to access this CardHub vault</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {sessions.length} Devices
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    {sess.device.includes('iPhone') ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{sess.device}</span>
                      {sess.current && (
                        <Badge variant="emerald" size="xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {sess.browser} • {sess.location}
                    </span>
                  </div>
                </div>

                {!sess.current && (
                  <button
                    onClick={() => onRevokeSession(sess.id)}
                    className="text-slate-400 hover:text-rose-400 font-bold transition text-[11px]"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
