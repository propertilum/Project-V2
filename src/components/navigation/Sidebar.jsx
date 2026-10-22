import {
  Activity, CreditCard, Layers, DollarSign, ShieldAlert,
  Shield, Link2, Settings, Repeat, Sparkles, PieChart, Clock,
  LogOut, X, ShieldCheck
} from 'lucide-react';

const PRIMARY_NAV = [
  { id: 'overview',       label: 'Overview',             icon: Activity },
  { id: 'my-cards',       label: 'My Cards',             icon: CreditCard },
  { id: 'virtual-cards',  label: 'Virtual Cards',        icon: Layers },
  { id: 'transactions',   label: 'Activity',             icon: DollarSign },
  { id: 'alerts',         label: 'Alerts',               icon: ShieldAlert, alertKey: true },
  { id: 'rules',          label: 'Rules & Limits',       icon: Shield },
  { id: 'connections',    label: 'Connections',          icon: Link2 },
  { id: 'settings',       label: 'Settings',             icon: Settings },
];

const UTILITY_NAV = [
  { id: 'subscriptions',  label: 'Subscriptions',        icon: Repeat },
  { id: 'customizer',     label: 'Card Studio',          icon: Sparkles },
  { id: 'spending',       label: 'Spending Insights',    icon: PieChart },
  { id: 'activity',       label: 'Audit Trail',          icon: Clock },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  cardCount = 0,
  openAlertsCount = 0,
  onLogout,
  isOpenMobile,
  setIsOpenMobile,
  currentUser,
  onGoToAdmin,
  onOpenVerifyEmail,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#090A0D] text-slate-300 flex flex-col justify-between shrink-0 border-r border-[#1E232B] transition-transform duration-300 ease-in-out ${
        isOpenMobile ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">

          {/* Logo / Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-[#1E232B]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-black text-white tracking-tight block leading-tight">
                  CardHub <span className="text-[10px] text-indigo-400 font-mono font-bold ml-1">v2</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Card Intelligence &amp; Controls
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpenMobile(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className="p-3 space-y-4 flex-1 overflow-y-auto">
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Platform Navigation
              </div>
              <nav className="space-y-0.5 text-xs font-medium">
                {PRIMARY_NAV.map(({ id, label, icon: Icon, alertKey }) => {
                  const isActive = activeTab === id;
                  const showCardBadge = (id === 'my-cards' || id === 'virtual-cards') && cardCount > 0;
                  const showAlertBadge = alertKey && openAlertsCount > 0;

                  return (
                    <button
                      key={id}
                      onClick={() => { setActiveTab(id); setIsOpenMobile(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                        }`} />
                        <span>{label}</span>
                      </div>

                      {showAlertBadge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {openAlertsCount}
                        </span>
                      )}

                      {showCardBadge && !showAlertBadge && id === 'virtual-cards' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tabular-nums ${
                          isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {cardCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Secondary Intelligence & Tools */}
            <div className="pt-2 border-t border-[#1E232B]">
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Intelligence &amp; Tools
              </div>
              <nav className="space-y-0.5 text-xs font-medium">
                {UTILITY_NAV.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setActiveTab(id); setIsOpenMobile(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                        }`} />
                        <span className="text-[11px]">{label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer User Info & Status */}
          <div className="p-4 border-t border-[#1E232B] space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>Security Engine Active</span>
              </span>
              <span className="font-mono text-slate-400">TLS 1.3</span>
            </div>

            {currentUser && (
              <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                    {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {currentUser.name || 'Account'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                {currentUser.emailVerified ? (
                  <span
                    className="p-1 rounded text-emerald-400"
                    title="Verified Account"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <button
                    onClick={onOpenVerifyEmail}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 shrink-0 transition"
                  >
                    Verify
                  </button>
                )}
              </div>
            )}

            {/* Admin Portal if Admin */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onGoToAdmin}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 transition text-xs font-semibold"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Sign Out */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
