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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 h-screen bg-[#1C1C1E] text-[#F5F5F7] flex flex-col justify-between shrink-0 border-r border-[#38383A] transition-transform duration-300 ease-in-out select-none ${
        isOpenMobile ? 'translate-x-0 shadow-2xl shadow-black/90' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">

          {/* Brand Header */}
          <div className="p-4.5 border-b border-[#38383A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9.5 h-9.5 rounded-[10px] bg-[#0A84FF] flex items-center justify-center text-white shadow-md shadow-[#0A84FF]/25 border border-white/10 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-[16px] font-bold text-[#F5F5F7] tracking-tight">
                      CardHub
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-[#0A84FF] bg-[#0A84FF]/15 px-1.5 py-0.5 rounded-[5px] border border-[#0A84FF]/30 leading-none">
                      v2.0
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#8E8E93] tracking-normal block mt-1 leading-tight truncate">
                    Virtual Card Intelligence
                  </span>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={() => setIsOpenMobile(false)}
                className="md:hidden text-[#8E8E93] hover:text-[#F5F5F7] p-1.5 rounded-[8px] hover:bg-[#2C2C2E] transition active:scale-[0.98] shrink-0"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Navigation */}
          <div className="p-2.5 space-y-4 flex-1 overflow-y-auto">
            <div>
              <div className="px-2.5 pb-1 text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider font-mono">
                Platform Navigation
              </div>
              <nav className="space-y-0.5 text-[13px]">
                {PRIMARY_NAV.map(({ id, label, icon: Icon, alertKey }) => {
                  const isActive = activeTab === id;
                  const showCardBadge = (id === 'my-cards' || id === 'virtual-cards') && cardCount > 0;
                  const showAlertBadge = alertKey && openAlertsCount > 0;

                  return (
                    <button
                      key={id}
                      onClick={() => { setActiveTab(id); setIsOpenMobile(false); }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] transition-all duration-100 group active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#0A84FF] text-white font-medium shadow-sm'
                          : 'text-[#8E8E93] hover:bg-[#2C2C2E] hover:text-[#F5F5F7]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-[#8E8E93] group-hover:text-[#F5F5F7]'
                        }`} />
                        <span>{label}</span>
                      </div>

                      {showAlertBadge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30">
                          {openAlertsCount}
                        </span>
                      )}

                      {showCardBadge && !showAlertBadge && id === 'virtual-cards' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium tabular-nums ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#2C2C2E] text-[#8E8E93]'
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
            <div className="pt-2 border-t border-[#38383A]">
              <div className="px-2.5 pb-1 text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider font-mono">
                Intelligence &amp; Tools
              </div>
              <nav className="space-y-0.5 text-[12px]">
                {UTILITY_NAV.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setActiveTab(id); setIsOpenMobile(false); }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] transition-all duration-100 group active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#2C2C2E] text-[#F5F5F7] font-medium border border-[#38383A]'
                          : 'text-[#8E8E93] hover:bg-[#2C2C2E]/60 hover:text-[#F5F5F7]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#0A84FF]' : 'text-[#8E8E93] group-hover:text-[#F5F5F7]'
                        }`} />
                        <span>{label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer User Info & Status */}
          <div className="p-3 border-t border-[#38383A] space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[#8E8E93]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full animate-pulse" />
                <span>Security Engine Active</span>
              </span>
              <span className="font-mono text-[#636366]">TLS 1.3</span>
            </div>

            {currentUser && (
              <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-[8px] bg-[#2C2C2E] border border-[#38383A]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#0A84FF]/20 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF] font-semibold text-xs shrink-0">
                    {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#F5F5F7] truncate">
                      {currentUser.name || 'Account'}
                    </div>
                    <div className="text-[10px] text-[#8E8E93] truncate font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                {currentUser.emailVerified ? (
                  <span
                    className="p-1 rounded text-[#34C759]"
                    title="Verified Account"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <button
                    onClick={onOpenVerifyEmail}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium text-[#FF9F0A] bg-[#FF9F0A]/10 hover:bg-[#FF9F0A]/20 border border-[#FF9F0A]/20 shrink-0 transition"
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
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 hover:bg-[#FF453A]/20 transition text-xs font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-[#FF453A]" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Sign Out */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[#8E8E93] hover:bg-[#2C2C2E] hover:text-[#FF453A] transition text-xs font-medium"
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
