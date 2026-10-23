import { 
  Lock, Unlock, AlertTriangle, CheckCircle, Smartphone, 
  Laptop, ShieldAlert, Cpu
} from 'lucide-react';
import Badge from '../ui/Badge';
import { SkeletonMetric, SkeletonTable } from '../ui/Skeleton';

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
  isLoading = false,
}) {
  const frozenCards = cards.filter((c) => c.isLocked);

  // Security score calculation
  let securityScore = 65;
  if (settings.twoFactor) securityScore += 10;
  if (settings.autoFreezeOnFraud) securityScore += 10;
  if (settings.loginAlerts) securityScore += 5;
  if (currentUser?.emailVerified) securityScore += 10;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F5F5F7]">
      {/* 1. Security Console Header & Posture Indicator */}
      <div className="bg-[#1C1C1E] text-white p-5 md:p-6 rounded-[12px] border border-[#38383A] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#34C759] rounded-full animate-pulse"></span>
            <span className="text-[10px] uppercase font-mono font-semibold text-[#0A84FF] tracking-wider">
              Cryptographic Safeguard Active
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5 text-[#F5F5F7]">
            <ShieldAlert className="w-5 h-5 text-[#0A84FF]" />
            <span>Security Command Console</span>
          </h2>
          <p className="text-xs text-[#8E8E93] max-w-xl leading-relaxed">
            Centralized risk posture monitor, emergency authorization kill-switches, and active hardware token audit logs.
          </p>
        </div>

        {/* Security Score Badge */}
        <div className="bg-[#2C2C2E] border border-[#38383A] p-4 rounded-[10px] flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-[8px] bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex flex-col items-center justify-center font-mono">
            <span className="text-lg font-bold text-[#0A84FF]">{securityScore}</span>
            <span className="text-[9px] text-[#8E8E93] font-semibold uppercase tracking-wider">/100</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F5F5F7]">Security Health Grade</div>
            <div className="text-[11px] text-[#34C759] font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> High Hardening Active
            </div>
            <span className="text-[10px] text-[#8E8E93] block mt-0.5 font-mono">2FA &amp; Fraud Auto-Lock Engaged</span>
          </div>
        </div>
      </div>

      {/* 2. Panic Kill-Switch & Global Channel Lockdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Panic Kill Switch */}
        <div className="lg:col-span-5 bg-[#1C1C1E] p-5 rounded-[12px] border border-[#38383A] shadow-sm space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5F5F7]">Emergency Authorization Kill-Switch</h3>
              <p className="text-[11px] text-[#8E8E93]">One-click immediate lockdown across digital cards</p>
            </div>
          </div>

          <div className="p-3.5 bg-[#FF453A]/10 rounded-[8px] border border-[#FF453A]/20 text-xs space-y-1.5 text-[#F5F5F7] leading-relaxed">
            <p>
              If you detect unauthorized charges, clicking below instantly freezes all virtual cards ({cards.filter(c => c.source !== 'bank_connection').length} cards). Any incoming network authorizations will be rejected with decline code 51.
            </p>
          </div>

          <button
            onClick={onPanicFreezeAll}
            className={`w-full py-2.5 rounded-[8px] font-medium text-xs transition duration-100 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm ${
              allCardsFrozen
                ? 'bg-[#34C759] hover:bg-[#28B04C] text-white shadow-[#34C759]/20'
                : 'bg-[#FF453A] hover:bg-[#E03A30] text-white shadow-[#FF453A]/20'
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
        <div className="lg:col-span-7 bg-[#1C1C1E] p-5 rounded-[12px] border border-[#38383A] shadow-sm space-y-3.5">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F7]">Global Channel Safeguard Toggles</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">Enforce immediate cross-card protocol overrides</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between">
              <div>
                <div className="font-medium text-[#F5F5F7]">Two-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-[#8E8E93]">Require TOTP authentication code upon console sign-in.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => onUpdateSettings({ twoFactor: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A84FF]"></div>
              </label>
            </div>

            <div className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between">
              <div>
                <div className="font-medium text-[#F5F5F7]">Auto-Freeze Fraud Protection</div>
                <div className="text-[11px] text-[#8E8E93]">Automatically isolate and freeze card if suspicious velocity is detected.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoFreezeOnFraud}
                  onChange={(e) => onUpdateSettings({ autoFreezeOnFraud: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A84FF]"></div>
              </label>
            </div>

            <div className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between">
              <div>
                <div className="font-medium text-[#F5F5F7]">Sign-In Velocity Alerts</div>
                <div className="text-[11px] text-[#8E8E93]">Instant notification when a new IP or device authenticates.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.loginAlerts}
                  onChange={(e) => onUpdateSettings({ loginAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A84FF]"></div>
              </label>
            </div>

            <div className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between">
              <div>
                <div className="font-medium text-[#F5F5F7]">Cryptographic Email Verification</div>
                <div className="text-[11px] text-[#8E8E93]">
                  {currentUser?.emailVerified
                    ? 'Verified: protects transactions and enables elevated limit authority.'
                    : 'Unverified: verify your email to eliminate spending caps and lockouts.'}
                </div>
              </div>
              {currentUser?.emailVerified ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30 text-[11px] font-medium flex items-center gap-1 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34C759]" />
                  <span>Verified</span>
                </span>
              ) : (
                <button
                  onClick={onOpenVerifyEmail}
                  className="px-2.5 py-1 rounded-[6px] bg-[#FF9F0A] hover:bg-[#E08A00] text-black font-semibold text-xs transition duration-100 active:scale-[0.98] shadow-sm flex items-center gap-1.5"
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Frozen Cards Review */}
        <div className="lg:col-span-6 bg-[#1C1C1E] p-5 rounded-[12px] border border-[#38383A] shadow-sm space-y-3.5">
          <div className="flex justify-between items-center pb-2.5 border-b border-[#38383A]">
            <div>
              <h3 className="text-sm font-semibold text-[#F5F5F7]">Frozen Cards Quarantine</h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Authorizations temporarily or permanently suspended</p>
            </div>
            <span className="text-xs font-mono font-medium text-[#FF453A] bg-[#FF453A]/10 px-2.5 py-0.5 rounded-full border border-[#FF453A]/30">
              {frozenCards.length} Frozen
            </span>
          </div>

          {frozenCards.length === 0 ? (
            <div className="p-8 text-center text-[#8E8E93] text-xs space-y-2">
              <CheckCircle className="w-7 h-7 text-[#34C759] mx-auto" />
              <div className="font-medium text-[#F5F5F7]">No cards in quarantine</div>
              <p className="text-[11px] text-[#8E8E93]">All virtual cards are currently operating under normal limits.</p>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {frozenCards.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-[#FF453A]/10 rounded-[8px] border border-[#FF453A]/25 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-[#FF453A] shrink-0" />
                    <div>
                      <span className="font-medium text-[#F5F5F7] block">{c.label}</span>
                      <span className="text-[10px] text-[#8E8E93] font-mono">
                        {c.brand} •••• {(c.cardNumber || c.last4 || '').slice(-4)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onUnfreezeCard(c.id)}
                    className="px-2.5 py-1 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] border border-[#38383A] font-medium rounded-[6px] transition duration-100 active:scale-[0.98] text-xs shadow-sm"
                  >
                    Unfreeze
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Hardware Sessions */}
        <div className="lg:col-span-6 bg-[#1C1C1E] p-5 rounded-[12px] border border-[#38383A] shadow-sm space-y-3.5">
          <div className="flex justify-between items-center pb-2.5 border-b border-[#38383A]">
            <div>
              <h3 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0A84FF]" />
                <span>Authenticated Hardware Sessions</span>
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Devices currently authorized to access this CardHub vault</p>
            </div>
            <span className="text-xs font-mono font-medium text-[#8E8E93]">
              {sessions.length} Devices
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-[6px] bg-[#1C1C1E] border border-[#38383A] flex items-center justify-center text-[#8E8E93]">
                    {sess.device.includes('iPhone') ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#F5F5F7]">{sess.device}</span>
                      {sess.current && (
                        <Badge variant="green" size="xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8E8E93]">
                      {sess.browser} • {sess.location}
                    </span>
                  </div>
                </div>

                {!sess.current && (
                  <button
                    onClick={() => onRevokeSession(sess.id)}
                    className="text-[#8E8E93] hover:text-[#FF453A] font-medium transition text-[11px]"
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
