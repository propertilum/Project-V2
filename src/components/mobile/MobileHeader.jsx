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
    <header className="md:hidden sticky top-0 z-30 bg-[#000000]/85 backdrop-blur-2xl border-b border-[#38383A] px-2.5 sm:px-4 py-2.5 select-none">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Brand or Back Button */}
        {isSubPage ? (
          <button
            onClick={() => onNavigateTab('overview')}
            className="flex items-center gap-1 py-1 px-1.5 sm:px-2 rounded-[8px] text-[#0A84FF] active:bg-[#1C1C1E] transition text-sm font-medium shrink-0"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>Wallet</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 rounded-[8px] bg-[#0A84FF] flex items-center justify-center text-white shadow-xs shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[14px] sm:text-[15px] font-bold text-[#F5F5F7] tracking-tight truncate">CardHub</span>
              <span className="text-[9px] font-mono font-semibold text-[#0A84FF] bg-[#0A84FF]/15 px-1 py-0.5 rounded border border-[#0A84FF]/30 shrink-0">
                v2.0
              </span>
            </div>
          </div>
        )}

        {/* Right Action Cluster */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Balance Pill */}
          <button
            onClick={onOpenTopUp}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[8px] bg-[#1C1C1E] border border-[#38383A] active:bg-[#2C2C2E] transition min-w-0 max-w-[120px] sm:max-w-none"
            title="Fund CardHub Wallet"
          >
            <span className="text-[10px] sm:text-[11px] font-semibold font-mono text-[#F5F5F7] truncate">
              {formatCurrency(walletBalance)}
            </span>
            <div className="w-3.5 h-3.5 rounded-full bg-[#0A84FF] flex items-center justify-center text-white shrink-0">
              <Plus className="w-2.5 h-2.5" />
            </div>
          </button>

          {/* Panic Freeze */}
          <button
            onClick={onPanicFreezeAll}
            title={allCardsFrozen ? 'Unfreeze all cards' : 'Emergency kill switch: Freeze all virtual cards'}
            className={`w-8 h-8 rounded-[8px] border transition active:scale-[0.94] flex items-center justify-center shrink-0 ${
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
            className="relative w-8 h-8 rounded-[8px] bg-[#1C1C1E] border border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] active:scale-[0.94] transition flex items-center justify-center shrink-0"
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
