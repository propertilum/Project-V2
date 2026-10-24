import { CreditCard, Bell, Lock, Unlock, Plus, ChevronLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function MobileHeader({
  activeTab,
  walletBalance,
  openAlertsCount = 0,
  onOpenTopUp,
  onPanicFreezeAll,
  allCardsFrozen,
  onNavigateTab,
}) {
  const isSubPage = activeTab !== 'overview' && activeTab !== 'vault-menu';

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[#000000]/85 backdrop-blur-2xl border-b border-[#38383A] px-4 py-3 select-none">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Brand or Back Button */}
        {isSubPage ? (
          <button
            onClick={() => onNavigateTab('overview')}
            className="flex items-center gap-1.5 py-1 px-2 -ml-2 rounded-[8px] text-[#0A84FF] active:bg-[#1C1C1E] transition text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Wallet</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#0A84FF] flex items-center justify-center text-white shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold text-[#F5F5F7] tracking-tight">CardHub</span>
              <span className="text-[9px] font-mono font-semibold text-[#0A84FF] bg-[#0A84FF]/15 px-1.5 py-0.2 rounded border border-[#0A84FF]/30">
                v2.0
              </span>
            </div>
          </div>
        )}

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Quick Balance Pill */}
          <button
            onClick={onOpenTopUp}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#1C1C1E] border border-[#38383A] active:bg-[#2C2C2E] transition"
            title="Fund CardHub Wallet"
          >
            <span className="text-[11px] font-semibold font-mono text-[#F5F5F7]">
              {formatCurrency(walletBalance)}
            </span>
            <div className="w-4 h-4 rounded-full bg-[#0A84FF] flex items-center justify-center text-white">
              <Plus className="w-3 h-3" />
            </div>
          </button>

          {/* Panic Freeze */}
          <button
            onClick={onPanicFreezeAll}
            title={allCardsFrozen ? 'Unfreeze all cards' : 'Emergency kill switch: Freeze all virtual cards'}
            className={`p-1.5 rounded-[8px] border transition active:scale-[0.94] ${
              allCardsFrozen
                ? 'bg-[#FF453A] border-[#FF453A] text-white shadow-[0_0_12px_rgba(255,69,58,0.5)]'
                : 'bg-[#1C1C1E] border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            {allCardsFrozen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => onNavigateTab('alerts')}
            className="relative p-1.5 rounded-[8px] bg-[#1C1C1E] border border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] active:scale-[0.94] transition"
            title="Security Alerts"
          >
            <Bell className="w-4 h-4" />
            {openAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF453A] text-white text-[8px] font-mono font-bold flex items-center justify-center">
                {openAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
